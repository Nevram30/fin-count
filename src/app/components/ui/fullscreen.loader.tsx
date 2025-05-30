import React from 'react'

const FullScreenLoader: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <div className="w-screen h-screen grid content-center bg-white">
            <div className="flex gap-3 items-center justify-center h-[300px]">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500">
                    <p className="text-slate-700">{children}</p>
                </div>
            </div>
        </div>
    )
}

export default FullScreenLoader
