import React from 'react'

const Header = () => {
    return (
        <div 
            className="h-64 bg-cover bg-center relative bg-[url('./assets/header.jpg')]"
            style={{
                backgroundBlendMode: 'overlay',
                backgroundColor: 'rgba(26, 15, 46, 0.2)'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#110f2e]"></div>
            <div className="container mx-auto px-5 md:px-20 h-full flex items-center relative z-10">
                <div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-blue-200">
                        Ask Your Documents
                    </h1>
                    <p className="text-xl text-blue-100">
                        Ask. Search. Discover.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Header