import { X, Loader, Book, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { useSummarizeMutation, useUploadMutation, useChunkTextMutation, useExtractTextMutation, useStoreEmbeddingsMutation } from '../utils/helpers'
import UploadProcess from './UploadProcess'
import toast from 'react-hot-toast'

const UploadSection = ({
    file,
    fileInStorage,
    setFile,
    setFileInStorage,
    uploadedFileData,
    setSummary,
    setMessages,
    setUploadedFileData,
}: {
    file: File | null,
    fileInStorage: { path: string, id: string } | null,
    setFile: (file: File | null) => void,
    setFileInStorage: (file: { path: string, id: string } | null) => void,
    uploadedFileData: { path: string, id: string } | null,
    setSummary: (summary: string) => void,
    setMessages: (messages: any) => void,
    setUploadedFileData: (uploadedFileData: { path: string, id: string } | null) => void,
}) => {

    const [hideAnalyzeButton, setHideAnalyzeButton] = useState(false)

    const { uploadFileReset, uploadFilePending, uploadFileMutation, uploadFileSuccess } = useUploadMutation()
	const { extractTextReset, extractTextPending, extractTextMutation, extractTextSuccess } = useExtractTextMutation()
	const { chunkTextReset, chunkTextPending, chunkTextMutation, chunkTextSuccess } = useChunkTextMutation()
	const { storeEmbeddingsReset, storeEmbeddingsPending, storeEmbeddingsMutation, storeEmbeddingsSuccess } = useStoreEmbeddingsMutation()
	const { summarizeReset, summarizePending, summarizeMutation, summarizeSuccess } = useSummarizeMutation(fileInStorage?.id || uploadedFileData?.id || '')

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


    // upload file to supabase, extract text, chunk text, create embeddings
	const uploadFileAndExtractText = async (file: File) => {
		try {
			setHideAnalyzeButton(true);
	
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
			storeEmbeddingsMutation({
				chunkedData,
				resolvedFileData,
				summary: summarizedData
			});
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

    return (
        <div className="relative bg-blue-900/20 p-6 rounded-lg border border-blue-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
                <Book className="text-blue-400" />
                <h2 className="text-2xl font-semibold text-blue-200">Document Upload</h2>
            </div>
            
            {(!file && !fileInStorage) ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-blue-500/30 border-dashed rounded-lg cursor-pointer hover:bg-blue-900/30 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-blue-400" />
                        <p className="mb-2 text-sm text-blue-300">
                            <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-blue-400">Pdf and Text files only (.pdf/.txt)</p>
                    </div>
                    <input type="file" className="hidden" onChange={selectFile} accept=".txt,.pdf" />
                </label>
            ) : (
                <div className="">
                    <div className="flex items-center justify-between mb-20 md:mb-0 p-4 bg-blue-900/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Book className="text-blue-400" />
                            <span className="text-blue-200">
                                {file?.name || fileInStorage?.path}&nbsp;
                                {
                                    file &&
                                    (file?.size < 1024 * 1024 
                                    ? `${(file?.size / 1024).toFixed(2)} KB`
                                    : `${(file?.size / (1024 * 1024)).toFixed(2)} MB`)
                                }
                            </span>
                        </div>
                        <button 
                            onClick={() => {
                                setFile(null)
                                uploadFileReset()
                                extractTextReset()
                                chunkTextReset()
                                storeEmbeddingsReset()
                                summarizeReset()
                                setHideAnalyzeButton(false)
                                setFileInStorage(null)
                                setSummary('')
                                setMessages([])
                            }}
                            className="text-blue-400 hover:text-blue-200"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <UploadProcess
                        uploadFilePending={uploadFilePending}
                        uploadFileSuccess={uploadFileSuccess}
                        extractTextPending={extractTextPending}
                        extractTextSuccess={extractTextSuccess}
                        chunkTextPending={chunkTextPending}
                        chunkTextSuccess={chunkTextSuccess}
                        storeEmbeddingsPending={storeEmbeddingsPending}
                        storeEmbeddingsSuccess={storeEmbeddingsSuccess}
                        summarizePending={summarizePending}
                        summarizeSuccess={summarizeSuccess}
                    />
                    {
                        ((storeEmbeddingsSuccess && file) || (hideAnalyzeButton && fileInStorage)) &&
                        <div className='flex justify-center'>
                            <h2 className='text-green-400 mt-10'>The chat is ready! Ask away!</h2>
                        </div>
                    }
                    {
                        !hideAnalyzeButton && !fileInStorage && file &&
                        <div className='flex justify-center'>
                            <button
                                disabled={uploadFilePending || extractTextPending || chunkTextPending || storeEmbeddingsPending}
                                onClick={() => uploadFileAndExtractText(file)}
                                // onClick={() => testSummary(file)}
                                type="submit"
                                className="w-full mx-auto absolute left-0 bottom-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg rounded-t-none transition-colors"
                            >
                                {
                                    (uploadFilePending || extractTextPending || chunkTextPending || storeEmbeddingsPending) 
                                    ? <Loader className="animate-spin w-4 h-4 mx-auto" /> 
                                    : "Analyze File"
                                }
                            </button>
                        </div> 
                    }
                </div>
            )}
        </div>
    )
}

export default UploadSection