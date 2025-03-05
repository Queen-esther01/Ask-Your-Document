import { Loader, CheckCircle } from 'lucide-react'

const ProcessStep = ({ isPending, isSuccess, pendingText, successText }: {
    isPending: boolean;
    isSuccess: boolean;
    pendingText: string;
    successText: string;
}) => {
    if (!isPending && !isSuccess) return null;
    
    return (
        <div>
            <div className="flex items-center justify-between">
                <p>{isPending ? pendingText : successText}</p>
                {isPending ? (
                    <Loader className="animate-spin w-4 h-4" />
                ) : (
                    <CheckCircle className="text-green-400 w-4 h-4" />
                )}
            </div>
        </div>
    );
};

const UploadProcess = ({
    uploadFilePending,
    uploadFileSuccess,
    extractTextPending,
    extractTextSuccess,
    chunkTextPending,
    chunkTextSuccess,
    storeEmbeddingsPending,
    storeEmbeddingsSuccess,
    summarizePending,
    summarizeSuccess,
}: {
    uploadFilePending: boolean,
    uploadFileSuccess: boolean,
    extractTextPending: boolean,
    extractTextSuccess: boolean,
    chunkTextPending: boolean,
    chunkTextSuccess: boolean,
    storeEmbeddingsPending: boolean,
    storeEmbeddingsSuccess: boolean,
    summarizePending: boolean,
    summarizeSuccess: boolean,
}) => {

    const steps = [
        { isPending: uploadFilePending, isSuccess: uploadFileSuccess, pendingText: "Uploading file...", successText: "File uploaded successfully" },
        { isPending: extractTextPending, isSuccess: extractTextSuccess, pendingText: "Extracting text...", successText: "Text extracted successfully" },
        { isPending: summarizePending, isSuccess: summarizeSuccess, pendingText: "Summarizing text...", successText: "Text summarized successfully" },
        { isPending: chunkTextPending, isSuccess: chunkTextSuccess, pendingText: "Chunking text...", successText: "Text chunked successfully" },
        { isPending: storeEmbeddingsPending, isSuccess: storeEmbeddingsSuccess, pendingText: "Creating embeddings...", successText: "Embeddings created successfully" }
    ];

    if (!uploadFilePending && !uploadFileSuccess) return null;

    return (
        <div className="mt-6 divide-y divide-blue-500/30 flex flex-col [&>*]:py-3 text-teal-600">
            {steps.map((step, index) => (
                <ProcessStep key={index} {...step} />
            ))}
        </div>
    )
}

export default UploadProcess