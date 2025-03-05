import React, { useState, useEffect } from 'react'

const Header = ({ 
    setFile, 
    setMessages, 
    setSummary,
    setUploadedFileData
}: { 
    setFile: (file: { path: string, id: string }) => void, 
    setMessages: (messages: any[]) => void, 
    setSummary: (summary: string) => void,
    setUploadedFileData: (uploadedFileData: null) => void
}) => {

    const storedFiles = localStorage.getItem('uploadedFiles')
    const filesArray = storedFiles ? JSON.parse(storedFiles) : []
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    useEffect(() => {
        const handleClickOutside = () => {
            setIsDropdownOpen(false)
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsDropdownOpen(!isDropdownOpen)
    }

    return (
        <div 
            className="h-64 bg-cover bg-center relative bg-[url('./assets/header.jpg')]"
            style={{
                backgroundBlendMode: 'overlay',
                backgroundColor: 'rgba(26, 15, 46, 0.2)'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#110f2e]"></div>
            <div className="container mx-auto px-5 md:px-20 h-full flex justify-between items-center relative z-10">
                <div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-blue-200">
                        Ask Your Documents
                    </h1>
                    <p className="text-xl text-blue-100">
                        Ask. Search. Discover.
                    </p>
                </div>
                <div className=''>
                    <button
                        onClick={toggleDropdown}
                        className="text-blue-200 hover:text-blue-100 transition-colors"
                    >
                        <h3 className='w-full'>File History</h3>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute bg-opacity-100 mt-2 w-64 right-0 bg-blue-900/20 rounded-lg shadow-lg border border-blue-500/30 overflow-hidden">
                            {filesArray.length > 0 ? (
                                filesArray.map((file: any) => (
                                    <button
                                        key={file.id} 
                                        className="p-3 w-full cursor-pointer hover:bg-blue-900/20 border-b border-blue-900/30 last:border-0"
                                        onClick={() => {
                                            setFile(file)
                                            setMessages([])
                                            setSummary('')
                                            setUploadedFileData(null)
                                        }}
                                    >
                                        <p className="text-blue-100 text-sm text-left">{file.path}</p>
                                    </button>
                                ))
                            ) : (
                                <div className="p-3">
                                    <p className="text-blue-100 text-sm">No files uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Header