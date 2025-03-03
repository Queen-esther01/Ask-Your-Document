import { ScrollText, Sparkles } from 'lucide-react'
import React from 'react'

const SummarySection = ({
    file,
    summarizePending,
    summary,
    isExpanded,
    setIsExpanded,
}: {
    file: File | null,
    summarizePending: boolean,
    summary: string,
    isExpanded: boolean,
    setIsExpanded: (isExpanded: boolean) => void,
}) => {
    return (
        <>
            {(file || summarizePending) && (
                <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-500/30 backdrop-blur-sm mb-3">
                    <div className="flex items-center gap-3 mb-4">
                        <ScrollText className="text-purple-400" />
                        <h2 className="text-2xl font-semibold text-purple-200">Document Summary</h2>
                    </div>
                    <div className="prose prose-invert max-w-none">
                        {
                            summarizePending ? (
                                <div className="flex items-center justify-center h-24">
                                    <div className="animate-pulse flex items-center gap-2">
                                        <Sparkles className="text-purple-400" />
                                        <span className="text-purple-300">Conjuring summary...</span>
                                    </div>
                                </div>
                            ) : !summary ? (
                                <div className="bg-purple-900/30 p-4 rounded-lg text-purple-200">
                                    No summary available yet
                                </div>
                            ) : (
                                <div className="bg-purple-900/30 p-4 rounded-lg text-purple-200">
                                    {isExpanded ? summary : summary.slice(0, 220)}
                                    {summary.length > 220 && (
                                        <button 
                                            onClick={() => setIsExpanded(!isExpanded)} 
                                            className="text-purple-400 hover:text-purple-600">
                                            &nbsp;{isExpanded ? 'View Less' : 'View More'}
                                        </button>
                                    )}
                                </div>
                            )
                        }
                    </div>
                </div>
            )}
        </>
    )
}

export default SummarySection