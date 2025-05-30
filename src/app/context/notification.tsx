"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NotificationContextType {
    unreadCount: number;
    updateUnreadCount: (count: number) => void;
    refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState<number>(0);

    // Sample notification data - replace with your actual data source
    const fetchNotificationCount = async () => {
        try {
            // Replace this with your actual API call or data fetching logic
            const sampleNotifications = [
                { id: 1, read: false },
                { id: 2, read: false },
                { id: 3, read: false },
                { id: 4, read: false },
                { id: 5, read: true },
                { id: 6, read: true },
                { id: 7, read: true },
                { id: 8, read: true },
                { id: 9, read: true },
                { id: 10, read: true },
            ];

            const count = sampleNotifications.filter(n => !n.read).length;
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching notification count:', error);
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        fetchNotificationCount();

        const interval = setInterval(fetchNotificationCount, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const updateUnreadCount = (count: number) => {
        setUnreadCount(count);
    };

    const refreshNotifications = () => {
        fetchNotificationCount();
    };

    const value = {
        unreadCount,
        updateUnreadCount,
        refreshNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};