"use client";
import FullScreenLoader from "@/app/components/ui/fullscreen.loader";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";
import { Users } from "lucide-react";
import React from "react";
import AsideNavigation from "../components/aside.navigation";
import { LogoutProvider } from "@/app/context/logout";
import { LogoutModal } from "@/app/components/logout.modal";
import SelectUser from "../components/select.user";


const AddUserPage: React.FC = () => {
    const { isLoading, isAuthenticated, logout } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    const { unreadCount } = useNotification();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <FullScreenLoader />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md text-center">
                    <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-50 mb-6">
                        <Users className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {!isAuthenticated
                            ? "Your account doesn't have access to this area"
                            : "Invalid role for this section"}
                    </p>
                    <button
                        onClick={logout}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <AsideNavigation onLogout={logout} unreadNotificationCount={unreadCount} />
            <div className="grid grid-cols-6 bg-gradient-to-br from-gray-50 to-emerald-50 min-h-screen">
                <main className="col-start-2 col-span-6 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Add New User</h1>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Admin Panel</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-sm text-blue-600">User Management</span>
                            </div>
                        </div>

                        <div className="overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-700">
                                    User Selection
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Select user role and fill in the details to create a new user account
                                </p>
                            </div>
                            <SelectUser />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

// Main App Component with LogoutProvider wrapper
const App: React.FC = () => {
    return (
        <LogoutProvider>
            <AddUserPage />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;
