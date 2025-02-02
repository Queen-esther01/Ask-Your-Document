import { useState } from 'react'
import { supabase, openai } from './config'
import { podcasts } from './content'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import movies from './movies.txt'
import Header from './components/Header'
import { Book, Upload, MessageCircle, Sparkles, X } from 'lucide-react';

interface Message {
  type: 'user' | 'assistant';
  content: string;
}

function App() {

	async function main(input: string[]) {
		const embeddingResponse = await openai.embeddings.create({
			model: "text-embedding-ada-002",
			input: input
		});

		console.log(embeddingResponse)

		const paired = embeddingResponse.data.map((embedding, index) => ({
			content: input[index],
			embedding: embedding.embedding
		}));

		console.log(paired)
		
		// Insert content and embedding into Supabase
		await supabase.from('documents').insert(paired); 
		console.log('Embedding and storing complete!');
	}

	


	// A SCRIMBA EXERCISE TO CHUNK DOCUMENTS AND STORE THEM IN THE DB
	async function splitDocument(document: string | URL | Request) {
		try{
			const response = await fetch(document)
			if(!response.ok) {
				throw new Error('Failed to fetch document')
			}
			const result = await response.text()
			const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 250,
			chunkOverlap: 35,
			});
			const output = await splitter.createDocuments([result]);
			return output
		} catch (error) {
			console.error('Error splitting document:', error);
			throw error;
		}
	}

	async function createAndStoreEmbeddings() {
		try {
			// Get Chunk Data
			const chunkData = await splitDocument(movies);
			console.log(chunkData)

			// Get Actual Strings in Chunk Data
			const pageContent = chunkData.map(val => val.pageContent)
			console.log(pageContent)
			
			// Create embeddings
			const embeddings = await openai.embeddings.create({
			model: "text-embedding-ada-002",
			input: pageContent
			})
			console.log(embeddings)
			
			// Create map to store in db
			const embeddingsMap = embeddings.data.map((value, index) => ({
			content: pageContent[index],
			embedding: value.embedding
			}))
			console.log(embeddingsMap)
			
			// store embeddings in db
			const { error } = await supabase.from("movieembeddings").insert(embeddingsMap)
			if(error) {
				console.error('Error storing embeddings:', error);
				throw error;
			}
			console.log('Embeddings stored successfully!');
		} catch (error) {
			console.error('Error splitting document:', error);
			throw error;
		}
	}

	async function findNearestmatch(embedding: number[]) {
		const { data, error } = await supabase.rpc('match_movies', {
			query_embedding: embedding,
			match_threshold: 0.5, // 0-1threshold for similarity
			match_count: 3 // number of results to return
		})
		console.log(data)
		const match = data.map((obj: any) => obj.content).join('\n');
		return match
	}

	async function getChatCompletion(match: any, query: string) {
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{ role: "system", content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.` }, 
				{ role: "user", content: `Context: ${match} Question: ${query}`}
			]
		})
		console.log(response.choices[0].message.content)
	}

	const [userQuery, setUserQuery] = useState('')

	async function query(input: string) {
		const embedding = await openai.embeddings.create({
			model: "text-embedding-ada-002",
			input: input
		});

		console.log(embedding.data[0].embedding)

		const match = await findNearestmatch(embedding.data[0].embedding)
		getChatCompletion(match, input)
	}


	// Upload file
	// query file name embeddings to see if it matches any existing embeddings
	// if it does, return the embeddings and say file already exists, chat with it
	// if it doesn't, create file name embeddings and store in db
	// Extract text from file
	// Create embeddings for text
	// Store embeddings in db
	// Chat with embeddings

	
	const [file, setFile] = useState<File | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [question, setQuestion] = useState('');

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile && (selectedFile.type === 'text/plain' || selectedFile.type === 'application/pdf')) {
			setFile(selectedFile);
		} else {
			alert('Please upload a pdf or txt file');
		}
	};
	console.log("file", file)

	const handleAnalyzeFile = (e: React.FormEvent) => {
		e.preventDefault();
		// Read file as array buffer
		const fileReader = new FileReader();
		fileReader.readAsArrayBuffer(file);
		fileReader.onload = () => {
			const fileText = fileReader.result as string;
			console.log(fileText)
		}
		fileReader.onerror = (error) => {
			console.error('Error reading file:', error);
		}
		
		// 
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (question.trim()) {
			setMessages([...messages, { type: 'user', content: question }]);
			// Placeholder for AI response
			setMessages(prev => [...prev, { 
				type: 'assistant', 
				content: 'This is where the AI response will appear. The integration will be handled separately.' 
			}]);
			setQuestion('');
		}
	};
		

	return (
		<div className="min-h-screen bg-[#110f2e] text-white">
			{/* <button onClick={() => main(podcasts)}>Create Embeddings</button> */}
			{/* <input type="text" onChange={(e) => setUserQuery(e.target.value)} />
			<button onClick={() => query(userQuery)}>Query</button> */}
			{/* <button onClick={() => createAndStoreEmbeddings()}>Create Embeddings</button> */}
			<Header/>
			{/* Main Content */}
			<div className="container mx-auto px-5 md:px-20 py-8">
				<div className="grid md:grid-cols-2 gap-8">
					{/* Upload Section */}
					<div className="relative bg-blue-900/20 p-6 rounded-lg border border-blue-500/30 backdrop-blur-sm">
						<div className="flex items-center gap-3 mb-4">
							<Book className="text-blue-400" />
							<h2 className="text-2xl font-semibold text-blue-200">Your Tome</h2>
						</div>
						
						{!file ? (
							<label className="flex flex-col items-center justify-center w-full h-48 border-2 border-blue-500/30 border-dashed rounded-lg cursor-pointer hover:bg-blue-900/30 transition-colors">
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<Upload className="w-10 h-10 mb-3 text-blue-400" />
									<p className="mb-2 text-sm text-blue-300">
										<span className="font-semibold">Click to upload</span>
									</p>
									<p className="text-xs text-blue-400">Pdf and Text files only (.pdf/.txt)</p>
								</div>
								<input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.pdf" />
							</label>
						) : (
							<div className="">
								<div className="flex items-center justify-between mb-20 md:mb-0 p-4 bg-blue-900/30 rounded-lg">
									<div className="flex items-center gap-3">
										<Book className="text-blue-400" />
										<span className="text-blue-200">{file.name}</span>
									</div>
									<button 
										onClick={() => setFile(null)}
										className="text-blue-400 hover:text-blue-200"
									>
										<X size={20} />
									</button>
								</div>
								<div className='flex justify-center'>
									<button
										onClick={handleAnalyzeFile}
										type="submit"
										className="w-full mx-auto absolute left-0 bottom-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg rounded-t-none transition-colors"
									>
										Analyze File
									</button>
								</div>
							</div>
						)}
					</div>

					{/* Chat Section */}
					<div className="bg-blue-900/20 p-6 rounded-lg border border-blue-500/30 backdrop-blur-sm">
						<div className="flex items-center gap-3 mb-4">
							<MessageCircle className="text-blue-400" />
							<h2 className="text-2xl font-semibold text-blue-200">Magical Insights</h2>
						</div>

						<div className="h-[400px] overflow-y-auto mb-4 space-y-4">
							{
								messages.map((message, index) => (
									<div
										key={index}
										className={`flex items-start gap-3 ${
											message.type === 'user' ? 'justify-end' : 'justify-start'
										}`}
									>
										{
											message.type === 'assistant' && (
											<div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
												<Sparkles size={16} className="text-blue-300" />
											</div>
										)}
										<div
											className={`max-w-[80%] p-3 rounded-lg ${
											message.type === 'user'
												? 'bg-blue-600/30 text-blue-100'
												: 'bg-blue-900/40 text-blue-200'
											}`}
										>
											{message.content}
										</div>
									</div>
								)
							)}
						</div>

						<form onSubmit={handleSubmit} className="flex gap-2">
							<input
								type="text"
								value={question}
								onChange={(e) => setQuestion(e.target.value)}
								placeholder="Ask about your text..."
								className="flex-1 bg-blue-900/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-100 placeholder-blue-400 focus:outline-none focus:border-blue-400"
							/>
							<button
								type="submit"
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
							>
								Ask
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
