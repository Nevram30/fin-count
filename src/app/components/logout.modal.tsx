'use client'
import React from 'react'
import { useLogout } from '../context/logout'

const LoadingSpinner = () => (
    <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
)

export const LogoutModal: React.FC = () => {
    const { isLogoutModalOpen, isLoggingOut, hideLogoutModal, handleLogout } = useLogout()

    if (!isLogoutModalOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500/50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                {isLoggingOut ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <LoadingSpinner />
                        <span className="mt-4 text-lg font-medium text-gray-700">Logging out...</span>
                        <p className="mt-2 text-sm text-gray-500">Please wait while we sign you out</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
                        <p className="mb-4">Are you sure you want to logout?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={hideLogoutModal}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}