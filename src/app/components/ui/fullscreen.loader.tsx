import React from 'react'
import Image from 'next/image'

const FullScreenLoader: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <div className="w-screen h-screen grid content-center bg-white">
            <div className="flex gap-3 items-center justify-center h-[300px]">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute w-24 h-24 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
                    <Image
                        src="/image/logo.png"
                        alt="FinCount Logo"
                        width={60}
                        height={60}
                        className="object-contain z-10"
                    />
                </div>
                <p className="text-slate-700">{children}</p>
            </div>
        </div>
    )
}

export default FullScreenLoader
