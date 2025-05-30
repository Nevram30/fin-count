'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface LogoutContextType {
    isLogoutModalOpen: boolean
    isLoggingOut: boolean
    showLogoutModal: () => void
    hideLogoutModal: () => void
    handleLogout: () => Promise<void>
    setLogoutHandler: (handler: () => void | Promise<void>) => void
}

const LogoutContext = createContext<LogoutContextType | undefined>(undefined)

interface LogoutProviderProps {
    children: ReactNode
}

export const LogoutProvider: React.FC<LogoutProviderProps> = ({ children }) => {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [logoutHandler, setLogoutHandler] = useState<(() => void | Promise<void>) | null>(null)

    const showLogoutModal = () => {
        setIsLogoutModalOpen(true)
    }

    const hideLogoutModal = () => {
        if (!isLoggingOut) {
            setIsLogoutModalOpen(false)
        }
    }

    const handleLogout = async () => {
        if (logoutHandler && !isLoggingOut) {
            setIsLoggingOut(true)
            try {
                await Promise.resolve(logoutHandler())
                // Add a delay to show the loading state (1.5 seconds)
                await new Promise(resolve => setTimeout(resolve, 1500))
            } catch (error) {
                console.error('Logout error:', error)
            } finally {
                setIsLoggingOut(false)
                setIsLogoutModalOpen(false)
            }
        }
    }

    const setLogoutHandlerFn = (handler: () => void | Promise<void>) => {
        setLogoutHandler(() => handler)
    }

    return (
        <LogoutContext.Provider
            value={{
                isLogoutModalOpen,
                isLoggingOut,
                showLogoutModal,
                hideLogoutModal,
                handleLogout,
                setLogoutHandler: setLogoutHandlerFn,
            }}
        >
            {children}
        </LogoutContext.Provider>
    )
}

export const useLogout = (): LogoutContextType => {
    const context = useContext(LogoutContext)
    if (context === undefined) {
        throw new Error('useLogout must be used within a LogoutProvider')
    }
    return context
}