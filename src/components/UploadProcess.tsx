import React from 'react'
import { useStoreEmbeddingsMutation } from '../utils/helpers'
import { useChunkTextMutation } from '../utils/helpers'
import { useExtractTextMutation } from '../utils/helpers'
import { useUploadMutation } from '../utils/helpers'
import { useSummarizeMutation } from '../utils/helpers'
import { Loader } from 'lucide-react'
import { CheckCircle } from 'lucide-react'

const UploadProcess = ({
    fileInStorage,
    uploadedFileData,
}: {
    fileInStorage: { path: string, id: string } | null,
    uploadedFileData: { path: string, id: string } | null,
}) => {

    const { uploadFileMutation, uploadFileReset, uploadFilePending, uploadFileSuccess } = useUploadMutation()
	const { extractTextMutation, extractTextReset, extractTextPending, extractTextSuccess } = useExtractTextMutation()
	const { chunkTextMutation, chunkTextReset, chunkTextPending, chunkTextSuccess } = useChunkTextMutation()
	const { storeEmbeddingsMutation, storeEmbeddingsReset, storeEmbeddingsPending, storeEmbeddingsSuccess } = useStoreEmbeddingsMutation()
	const { summarizeMutation, summarizeReset, summarizePending, summarizeSuccess, summarizeError } = useSummarizeMutation(fileInStorage?.id || uploadedFileData?.id || '')
    
    return (
        <div className={`mt-6 ${uploadFilePending || uploadFileSuccess ? 'divide-y divide-blue-500/30 flex flex-col [&>*]:py-3 text-teal-600' : 'hidden'}`}>
            {
                (uploadFilePending || uploadFileSuccess) && 
                <div>
                    <div className="flex items-center justify-between">
                        <p>
                            {
                                uploadFilePending 
                                ? "Uploading file..." 
                                : uploadFileSuccess 
                                ? "File uploaded successfully" 
                                : null
                            }
                        </p>
                        {
                            uploadFilePending ? (
                                <Loader className="animate-spin w-4 h-4" />
                            ) : uploadFileSuccess ? (
                                <CheckCircle className="text-green-400 w-4 h-4" />
                            ) : null
                        }
                    </div>
                </div>
            }
            {
                (extractTextPending || extractTextSuccess) &&
                <div>
                    <div className="flex items-center justify-between">
                        <p>
                            {
                                extractTextPending 
                                ? "Extracting text..." 
                                : extractTextSuccess 
                                ? "Text extracted successfully" 
                                : null
                            }
                        </p>
                        {
                            extractTextPending ? (
                                <Loader className="animate-spin w-4 h-4" />
                            ) : extractTextSuccess ? (
                                <CheckCircle className="text-green-400 w-4 h-4" />
                            ) : null
                        }
                    </div>
                </div>
            }
            {
                (summarizePending || summarizeSuccess) &&
                <div>
                    <div className="flex items-center justify-between">
                        <p>
                            {
                                summarizePending 
                                ? "Summarizing text..." 
                                : summarizeSuccess 
                                ? "Text summarized successfully" 
                                : null
                            }
                        </p>
                        {
                            summarizePending ? (
                                <Loader className="animate-spin w-4 h-4" />
                            ) : summarizeSuccess ? (
                                <CheckCircle className="text-green-400 w-4 h-4" />
                            ) : null
                        }
                    </div>
                </div>
            }
            {
                (chunkTextPending || chunkTextSuccess) &&
                <div>
                    <div className="flex items-center justify-between">
                        <p>
                            {
                                chunkTextPending 
                                ? "Chunking text..." 
                                : chunkTextSuccess 
                                ? "Text chunked successfully" 
                                : null
                            }
                        </p>
                        {
                            chunkTextPending ? (
                                <Loader className="animate-spin w-4 h-4" />
                            ) : chunkTextSuccess ? (
                                <CheckCircle className="text-green-400 w-4 h-4" />
                            ) : null
                        }
                    </div>
                </div>
            }
            {(storeEmbeddingsPending || storeEmbeddingsSuccess) &&
                <div>
                    <div className="flex items-center justify-between">
                        <p>
                            {
                                storeEmbeddingsPending 
                                ? "Creating embeddings..." 
                                : storeEmbeddingsSuccess 
                                ? "Embeddings created successfully" 
                                : null
                            }
                        </p>
                        {
                            storeEmbeddingsPending ? (
                                <Loader className="animate-spin w-4 h-4" />
                            ) : storeEmbeddingsSuccess ? (
                                <CheckCircle className="text-green-400 w-4 h-4" />
                            ) : null
                        }
                    </div>
                </div>
            }
        </div>
    )
}

export default UploadProcess