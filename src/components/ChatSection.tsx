import { Loader, Sparkles, MessageCircle } from 'lucide-react'
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react'
import { useGetResponseMutation } from '../utils/helpers'
import { Message } from '../App'
import Markdown from 'react-markdown'

const ChatSection = ({
    messages,
    question,
    setQuestion,
    fileInStorage,
    file,
    setMessages,
    uploadedFileData,
}: {
    messages: Message[],
    question: string,
    setQuestion: (question: string) => void,
    fileInStorage: { path: string, id: string } | null,
    file: File | null,
    setMessages: Dispatch<SetStateAction<Message[]>>,
    uploadedFileData: { path: string, id: string } | null,
}) => {

    const { getResponsePending, getResponseMutation } = useGetResponseMutation()

    const handleSubmit = async(e: React.FormEvent) => {
		e.preventDefault();
		if (question.trim()) {
			const payload = {
				question: question,
				file_id: uploadedFileData?.id || fileInStorage?.id || '',
			}
			setMessages((prev) => [...prev, { type: 'user', content: question }]);
			setQuestion('');
			const response = await getResponseMutation(payload)
			setMessages((prev) => [...prev, { 
				type: 'assistant', 
				content: response 
			}]);
		}
	};
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
		messagesEndRef.current?.scrollTo({
            top: messagesEndRef.current.scrollHeight,
            behavior: "smooth"
        });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);
    
    return (
        <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="text-blue-400" />
                <h2 className="text-2xl font-semibold text-blue-200">Chat Insights</h2>
            </div>

            <div className="h-[400px] overflow-y-auto pb-10 mb-4 space-y-4" ref={messagesEndRef}>
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
                                    ? 'bg-blue-600/30 text-blue-100 mr-3'
                                    : 'bg-blue-900/40 text-blue-200'
                                }`}
                            >
                                { message.type === 'assistant' ? <Markdown>{message.content}</Markdown> : message.content}
                            </div>
                        </div>
                    )
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about your text..."
                    className="flex-1 bg-blue-900/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-100 placeholder-blue-400 focus:outline-none focus:border-blue-400"
                />
                <button
                    type="submit"
                    disabled={getResponsePending || (!fileInStorage && !file) || !question}
                    className="self-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    { getResponsePending ? <Loader className="animate-spin w-4 h-4" /> : 'Ask' }
                </button>
            </form>
        </div>
    )
}

export default ChatSection