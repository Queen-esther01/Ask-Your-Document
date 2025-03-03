import { useState } from 'react'
import Header from './components/Header'
import { toast } from 'react-hot-toast';
import { useChunkTextMutation, useExtractTextMutation, useStoreEmbeddingsMutation, useUploadMutation, useGetResponseMutation, useSummarizeMutation } from './utils/helpers'
import UploadSection from './components/UploadSection'
import SummarySection from './components/SummarySection'
import ChatSection from './components/ChatSection'


export interface Message {
  type: 'user' | 'assistant';
  content: string;
}

function App() {

	// async function main(input: string[]) {
	// 	const embeddingResponse = await openai.embeddings.create({
	// 		model: "text-embedding-ada-002",
	// 		input: input
	// 	});

	// 	console.log(embeddingResponse)

	// 	const paired = embeddingResponse.data.map((embedding, index) => ({
	// 		content: input[index],
	// 		embedding: embedding.embedding
	// 	}));

	// 	console.log(paired)
		
	// 	// Insert content and embedding into Supabase
	// 	await supabase.from('documents').insert(paired); 
	// 	console.log('Embedding and storing complete!');
	// }

	


	// // A SCRIMBA EXERCISE TO CHUNK DOCUMENTS AND STORE THEM IN THE DB
	// async function splitDocument(document: string | URL | Request) {
	// 	try{
	// 		const response = await fetch(document)
	// 		if(!response.ok) {
	// 			throw new Error('Failed to fetch document')
	// 		}
	// 		const result = await response.text()
	// 		const splitter = new RecursiveCharacterTextSplitter({
	// 			chunkSize: 250,
	// 			chunkOverlap: 35,
	// 		});
	// 		const output = await splitter.createDocuments([result]);
	// 		return output
	// 	} catch (error) {
	// 		console.error('Error splitting document:', error);
	// 		throw error;
	// 	}
	// }

	// async function createAndStoreEmbeddingss() {
	// 	try {
	// 		// Get Chunk Data
	// 		const chunkData = await splitDocument(movies);
	// 		console.log(chunkData)

	// 		// Get Actual Strings in Chunk Data
	// 		const pageContent = chunkData.map(val => val.pageContent)
	// 		console.log(pageContent)
			
	// 		// Create embeddings
	// 		const embeddings = await openai.embeddings.create({
	// 		model: "text-embedding-ada-002",
	// 		input: pageContent
	// 		})
	// 		console.log(embeddings)
			
	// 		// Create map to store in db
	// 		const embeddingsMap = embeddings.data.map((value, index) => ({
	// 		content: pageContent[index],
	// 		embedding: value.embedding
	// 		}))
	// 		console.log(embeddingsMap)
			
	// 		// store embeddings in db
	// 		const { error } = await supabase.from("movieembeddings").insert(embeddingsMap)
	// 		if(error) {
	// 			console.error('Error storing embeddings:', error);
	// 			throw error;
	// 		}
	// 		console.log('Embeddings stored successfully!');
	// 	} catch (error) {
	// 		console.error('Error splitting document:', error);
	// 		throw error;
	// 	}
	// }

	



	
	const [file, setFile] = useState<File | null>(null);
	const [fileInStorage, setFileInStorage] = useState<{ path: string, id: string } | null>(null)
	const [messages, setMessages] = useState<Message[]>([]);
	const [question, setQuestion] = useState('');
	const [hideAnalyzeButton, setHideAnalyzeButton] = useState(false)
	const [uploadedFileData, setUploadedFileData] = useState<{ path: string, id: string } | null>(null)
	const [summary, setSummary] = useState<string>('')
	const [isExpanded, setIsExpanded] = useState(false);

	

	// select file from local file system
	const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile && (selectedFile.type === 'text/plain' || selectedFile.type === 'application/pdf')) {
			// Check if file is greater than 1mb 
			if (selectedFile.size > 1024 * 1024) {
				toast.error('File size must be less than 1MB');
				return;
			}
			// Check if file is already in localStorage
			const existingFileArray = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
			const existingFile = existingFileArray?.find((file: { path: string }) => file.path === selectedFile.name)
			if (existingFile) {
				toast.success('This file is already loaded from history');
				setFileInStorage(existingFile)
				return;
			}
			setFile(selectedFile);
		} else {
			alert('Please upload a pdf or txt file');
		}
	};

	const { uploadFileMutation, uploadFileReset } = useUploadMutation()
	const { extractTextMutation, extractTextReset } = useExtractTextMutation()
	const { chunkTextMutation, chunkTextReset } = useChunkTextMutation()
	const { storeEmbeddingsMutation, storeEmbeddingsReset } = useStoreEmbeddingsMutation()
	const { getResponseMutation } = useGetResponseMutation()
	const { summarizeMutation, summarizeReset, summarizePending } = useSummarizeMutation(fileInStorage?.id || uploadedFileData?.id || '')


	// const testSummary = async(file: File) => {
	// 	await extractTextMutation(file)
	// 	.then(async(data) => {
	// 		if(data) {
	// 			console.log('extracted text: ', data)
	// 			const summarizedData = await summarizeMutation(data);
	// 			console.log('summarized data: ', summarizedData)
	// 			setSummary(summarizedData || '');
	// 		}
	// 	})
	// }

	// upload file to supabase, extract text, chunk text, create embeddings
	const uploadFileAndExtractText = async (file: File) => {
		try {
			setHideAnalyzeButton(false);
	
			// Upload file
			const resolvedFileData = await uploadFileMutation(file);
			setUploadedFileData(resolvedFileData);
			if(!resolvedFileData) return;
	
			// Extract and process text
			const extractedData = await extractTextMutation(file);
			if (!extractedData) return;
	
			// Set extracted text and get summary
			const summarizedData = await summarizeMutation(extractedData);
			setSummary(summarizedData || '');
			if(!summarizedData) return;
	
			// Chunk text and store embeddings
			const chunkedData = await chunkTextMutation(extractedData);
			await storeEmbeddingsMutation({
				chunkedData,
				resolvedFileData,
				summary: summarizedData
			});
			setHideAnalyzeButton(true);
		} catch (error) {
			console.error('Error processing file:', error);
			// Reset all states
			uploadFileReset();
			extractTextReset();
			chunkTextReset();
			storeEmbeddingsReset();
			summarizeReset()
		} finally {
			
		}
	};
    

	const handleSubmit = async(e: React.FormEvent) => {
		e.preventDefault();
		console.log('question', question)
		if (question.trim()) {
			const payload = {
				question: question,
				file_id: uploadedFileData?.id || fileInStorage?.id || '',
			}
			setMessages(prev => [...prev, { type: 'user', content: question }]);
			setQuestion('');
			const response = await getResponseMutation(payload)
			console.log('response', response)
			setMessages(prev => [...prev, { 
				type: 'assistant', 
				content: response 
			}]);
		}
	};

	console.log(fileInStorage)
	console.log('messages', messages)
	// if user swutches between file in history, reset conversation, show confirm modal for this
	// pass name of file to chat completion for additional context
	
		

	return (
		<div className="min-h-screen bg-[#110f2e] text-white">
			{/* <button onClick={() => main(podcasts)}>Create Embeddings</button> */}
			{/* <input type="text" onChange={(e) => setUserQuery(e.target.value)} />
			<button onClick={() => query(userQuery)}>Query</button> */}
			{/* <button onClick={() => createAndStoreEmbeddings()}>Create Embeddings</button> */}
			<Header setFile={setFileInStorage}/>
			{/* Main Content */}
			<div className="container mx-auto px-5 md:px-20 py-8">
				<div className="grid xl:grid-cols-2 gap-8">
					{/* Upload Section */}
					<UploadSection 
						file={file}
						fileInStorage={fileInStorage}
						setFile={setFile}
						setFileInStorage={setFileInStorage}
						selectFile={selectFile}
						uploadedFileData={uploadedFileData}
						setHideAnalyzeButton={setHideAnalyzeButton}
						hideAnalyzeButton={hideAnalyzeButton}
						setSummary={setSummary}
						setMessages={setMessages}
						uploadFileAndExtractText={uploadFileAndExtractText}
					/>

					<div>
						{/* Summary Section */}
						<SummarySection 
							file={file}
							summarizePending={summarizePending}
							summary={summary}
							isExpanded={isExpanded}
							setIsExpanded={setIsExpanded}
						/>
						
						{/* Chat Section */}
						<ChatSection
							messages={messages}
							handleSubmit={handleSubmit}
							question={question}
							setQuestion={setQuestion}
							fileInStorage={fileInStorage}
							file={file}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
