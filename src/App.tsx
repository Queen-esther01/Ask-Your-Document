import { useState } from 'react'
import Header from './components/Header'
import { useSummarizeMutation } from './utils/helpers'
import UploadSection from './components/UploadSection'
import SummarySection from './components/SummarySection'
import ChatSection from './components/ChatSection'

export interface Message {
  type: 'user' | 'assistant';
  content: string;
}

function App() {
	
	const [file, setFile] = useState<File | null>(null);
	const [fileInStorage, setFileInStorage] = useState<{ path: string, id: string } | null>(null)
	const [messages, setMessages] = useState<Message[]>([]);
	const [question, setQuestion] = useState('');
	const [uploadedFileData, setUploadedFileData] = useState<{ path: string, id: string } | null>(null)
	const [summary, setSummary] = useState<string>('')

	
	const { summarizePending } = useSummarizeMutation(fileInStorage?.id || uploadedFileData?.id || '')


	// if user swutches between file in history, reset conversation, show confirm modal for this
	// pass name of file to chat completion for additional context
	
		

	return (
		<div className="min-h-screen bg-[#110f2e] text-white">
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
						uploadedFileData={uploadedFileData}
						setSummary={setSummary}
						setMessages={setMessages}
						setUploadedFileData={setUploadedFileData}
					/>
					<div>
						{/* Summary Section */}
						<SummarySection 
							file={file}
							summarizePending={summarizePending}
							summary={summary}
						/>
						
						{/* Chat Section */}
						<ChatSection
							setMessages={setMessages}
							uploadedFileData={uploadedFileData}
							messages={messages}
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
