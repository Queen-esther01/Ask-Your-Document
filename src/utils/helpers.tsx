
import { useMutation } from '@tanstack/react-query'
import { deepseek, openai, supabase } from './config'
import { toast } from 'react-hot-toast'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import pdfToText from 'react-pdftotext'
import { Document } from '@langchain/core/documents'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs'

export const uploadFileToSupabase = async (file: File) => {
    // const { error } = await supabase.from("movieembeddings").insert(embeddingsMap)
    // uploadFileMutation.reset()
    const { data, error } = await supabase.storage.from('AskYourDocumentFiles').upload(`${file.name}`, file)
    if(error) {
        console.error('Error uploading file:', error);
        throw new Error(JSON.stringify(error))
    }
    return data
}

export const useUploadMutation = () => {
    const { mutateAsync: uploadFileMutation, reset: uploadFileReset, isPending: uploadFilePending, isSuccess: uploadFileSuccess, isError: uploadFileError } = useMutation({
        mutationFn: uploadFileToSupabase,
        onSuccess: (data) => {
            toast.success('File uploaded successfully');
  
            const existingFiles = localStorage.getItem('uploadedFiles')
            let filesArray = existingFiles ? JSON.parse(existingFiles) : []
            
            if (!Array.isArray(filesArray)) {
                filesArray = [filesArray]
            }
    
            filesArray.push(data)
            
            localStorage.setItem('uploadedFiles', JSON.stringify(filesArray))
        },
        onError: (error) => {
            // console.log('error', error.message)
            // console.log('Error uploading file:', JSON.parse(error.message).error);
            toast.error(`Error uploading file: ${JSON.parse(error.message).error}, ${JSON.parse(error.message).message}`);
        }
    })
    return { uploadFileMutation, uploadFileReset, uploadFilePending, uploadFileSuccess, uploadFileError }
}

export const chunkExtractedText = async(extractedText: string) => {
    try{
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 100,
        });
        const output = await splitter.createDocuments([extractedText]);
        return output
    } catch (error) {
        toast.error("Failed to chunk extracted text")
        throw error;
    }
}

function cleanText(text: string) {
    return text.replace(/[^\w\s.,!?-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Extract text from file and chunk it
const extractText = async(file: File) => {
    if(file.type === 'application/pdf') {
        try {
            const text = await pdfToText(file)
            return cleanText(text)
        } catch (error) {
            toast.error("Failed to extract text from pdf")
            throw new Error(JSON.stringify(error))
        }
    } 
    else if(file.type === 'text/plain') {
        try {
            const text = await file.text()
            return cleanText(text)
        } catch (error) {
            toast.error("Failed to extract text from txt file")
            throw new Error(JSON.stringify(error))
        }
    }
}

export const useExtractTextMutation = () => {
    
    const { mutateAsync: extractTextMutation, reset: extractTextReset, isPending: extractTextPending, isSuccess: extractTextSuccess, isError: extractTextError } = useMutation({
        mutationFn: extractText,
        onSuccess: () => {
            toast.success('Text extracted successfully');
        },
        onError: (error) => {
            // console.log('error', error.message)
            // console.log('Error uploading file:', JSON.parse(error.message).error);
            toast.error(`Error uploading file: ${JSON.parse(error.message).error}`);
        }
    })

    return { extractTextMutation, extractTextReset, extractTextPending, extractTextSuccess, extractTextError }
}


const summarize = async(data: string) => {
    try {
        const result = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'user', content: `${data.slice(0, 60000)}` },
                { role: 'assistant', content: 'You are a helpful assistant that summarizes text in a document and only returns the summary of the document stating clearly what the document is about. Do not include any other text in your response.' }
            ],
            max_tokens: 8000
        })
        // console.log('summarization result: ', result)
        const summary = result.choices[0].message.content
        // console.log('summary: ', summary)
        return summary
    } catch (error) {
        // console.log('error summarizing: ', error) 
        toast.error('Error summarizing text')
        throw error;
    }
}


export const useSummarizeMutation = (fileId: string) => {
    const { mutateAsync: summarizeMutation, reset: summarizeReset, isPending: summarizePending, isSuccess: summarizeSuccess, isError: summarizeError } = useMutation({
        mutationFn: summarize,
        onSuccess: (data) => {
            toast.success('Text summarized successfully');
            const exisingFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
            const updatedFiles = exisingFiles.map((file: any) => {
                if(file.id === fileId) {
                    return { ...file, summary: data }
                }
                return file
            })
            localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles))
            return data
        },
        onError: () => {
            // console.log('error', error.message)
            // console.log('Error summarizing text:', JSON.parse(error.message).error);
        }
    })
    return { summarizeMutation, summarizeReset, summarizePending, summarizeSuccess, summarizeError }
}


export const useChunkTextMutation = () => {
    const { mutateAsync: chunkTextMutation, reset: chunkTextReset, isPending: chunkTextPending, isSuccess: chunkTextSuccess, isError: chunkTextError } = useMutation({
        mutationFn: chunkExtractedText,
        onSuccess: () => {
            toast.success('Text chunked successfully');
        },
        onError: (error) => {
            toast.error(`Error chunking text: ${JSON.parse(error.message).error}`);
        }
    })
    return { chunkTextMutation, chunkTextReset, chunkTextPending, chunkTextSuccess, chunkTextError }
}

export const createAndStoreEmbeddings = async (requestData: { chunkedData: Document[], resolvedFileData: { id: string, path: string }, summary: string }) => {
    try {
        // Get Actual Strings in Chunk Data
        const pageContent = requestData.chunkedData.map(val => val.pageContent)
        
        // Create embeddings
        const embeddings = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: pageContent
        })
        
        // Create map to store in db
        const embeddingsMap = embeddings.data.map((value, index) => ({
            content: pageContent[index],
            embedding: value.embedding,
            file_id: requestData.resolvedFileData.id,
            file_name: requestData.resolvedFileData.path,
            summary: requestData.summary
        }))
        
        // store embeddings in db
        const { error } = await supabase.from("file_content_embeddings").insert(embeddingsMap)
        if(error) {
            toast.error('Error storing embeddings')
            console.error('Error storing embeddings:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error storing embeddings:', error);
        toast.error('Error storing embeddings')
        throw error;
    }
}

export const useStoreEmbeddingsMutation = () => {

    const { mutate: storeEmbeddingsMutation, reset: storeEmbeddingsReset, isPending: storeEmbeddingsPending, isSuccess: storeEmbeddingsSuccess, isError: storeEmbeddingsError } = useMutation({
        mutationFn: createAndStoreEmbeddings,
        onSuccess: () => {
            toast.success('Embeddings stored successfully');
        },
        onError: (error) => {
            // console.log('error', error.message)
            // console.log('Error storing embeddings:', JSON.parse(error.message).error);
            toast.error(`Error storing embeddings: ${JSON.parse(error.message).error}`);
        }
    })

    return { storeEmbeddingsMutation, storeEmbeddingsReset, storeEmbeddingsPending, storeEmbeddingsSuccess, storeEmbeddingsError }
}


export const findNearestmatch = async (embedding: number[], file_id: string) => {
    try {
        const { data } = await supabase.rpc('match_documents_test', {
            query_embedding: embedding,
            match_threshold: 0.5, // 0-1threshold for similarity
            match_count: 3, // number of results to return
            target_file_id: file_id
        })
        // console.log(data)
        const match = data.map((obj: any) => obj.content).join('\n');
        return match
    } catch (error) {
        console.error('Error finding nearest match:', error);
        toast.error('Error finding nearest match')
        throw error;
    }
}

const chatMessages = [
    { 
        role: "system", 
        // content: `You are an enthusiastic assistant who loves to help people. You will be given two pieces of information - some context from a document and a question. Your task is to answer the question using the provided context as a guide. Keep your answers very brief and clear. Do you best to answer the questions without turning the user down. , however If the answer cannot be found in the provided context, respond with "I apologize, but I cannot find the answer to your question in the provided document." Do not make assumptions or provide information beyond what is contained in the context.`, 
        content: `You are a very friendly and enthusiastic assistant who loves to help people. You will be given two pieces of information - some context from a document and a question. Your task is to answer the question using the provided context as a guide, you must not answer in verbatim from the context. Be friendly but brief. Do your best to answer the questions without turning the user down. However If the answer cannot be found in the provided context, gently turn the user down with facts on why you cannot answer the question. Do not mention the context in verbatim and do not make assumptions or provide information beyond what is contained in the context.`, 
    }
]

export const getChatCompletion = async (match: string, query: string, summary?: string) => {
    try {
        // const updateSystemMessage = chatMessages.map((message) => {
        //     if(message.role === 'system') {
        //         return { ...message, content: `${message.content}. Document Summary: ${summary}` }
        //     }
        //     return message
        // })
        console.log('summary', summary)
        const updatedMessages = [...chatMessages, { role: "user", content: `Context: ${match} Question: ${query}`}]
        const response = await deepseek.chat.completions.create({
            model: "deepseek-chat",
            messages: updatedMessages as ChatCompletionMessageParam[]
        })
        chatMessages.push({ role: "assistant", content: response.choices[0].message.content || '' })
        return response.choices[0].message.content || ''
    } catch (error) {
        console.error('Error getting chat completion:', error);
        chatMessages.pop()
        toast.error('Error getting chat completion')
        throw error;
    }
}

export const query = async ({question, file_id}: {question: string, file_id: string}) => {
    try {
        const existingFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
        const file = existingFiles.find((file: any) => file.id === file_id)
        const embedding = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: question
        });
        const match = await findNearestmatch(embedding.data[0].embedding, file_id)
        return await getChatCompletion(match, question, file.summary)
    } catch (error) {
        console.error('Error embedding input:', error);
        toast.error('Error embedding input')
        throw error;
    }
}

export const useGetResponseMutation = () => {
    const { mutateAsync: getResponseMutation, reset: getResponseReset, isPending: getResponsePending, isSuccess: getResponseSuccess, isError: getResponseError } = useMutation({
        mutationFn: query,
        onSuccess: () => {
            // console.log(data)
        }
    })
    return { getResponseMutation, getResponseReset, getResponsePending, getResponseSuccess, getResponseError }
}
