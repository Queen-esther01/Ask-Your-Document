import { X, Loader, Book, Upload } from 'lucide-react'
import React from 'react'
import { useSummarizeMutation, useUploadMutation, useChunkTextMutation, useExtractTextMutation, useStoreEmbeddingsMutation } from '../utils/helpers'
import UploadProcess from './UploadProcess'

const UploadSection = ({
    file,
    fileInStorage,
    setFile,
    setFileInStorage,
    selectFile,
    uploadedFileData,
    setHideAnalyzeButton,
    hideAnalyzeButton,
    setSummary,
    setMessages,
    uploadFileAndExtractText,
}: {
    file: File | null,
    fileInStorage: { path: string, id: string } | null,
    setFile: (file: File | null) => void,
    setFileInStorage: (file: { path: string, id: string } | null) => void,
    selectFile: (e: React.ChangeEvent<HTMLInputElement>) => void,
    uploadedFileData: { path: string, id: string } | null,
    setHideAnalyzeButton: (hideAnalyzeButton: boolean) => void,
    hideAnalyzeButton: boolean,
    setSummary: (summary: string) => void,
    setMessages: (messages: any) => void,
    uploadFileAndExtractText: (file: File) => void,
}) => {

    const { uploadFileReset, uploadFilePending } = useUploadMutation()
	const { extractTextReset, extractTextPending } = useExtractTextMutation()
	const { chunkTextReset, chunkTextPending } = useChunkTextMutation()
	const { storeEmbeddingsReset, storeEmbeddingsPending } = useStoreEmbeddingsMutation()
	const { summarizeReset } = useSummarizeMutation(fileInStorage?.id || uploadedFileData?.id || '')

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
                        fileInStorage={fileInStorage}
                        uploadedFileData={uploadedFileData}
                    />
                    {
                        ((hideAnalyzeButton && file) || (hideAnalyzeButton && fileInStorage)) &&
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