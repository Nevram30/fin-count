"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User,
    Bell,
    Briefcase,
    Users,
    Settings,
    LogOut,
} from "lucide-react";
import { useLogout } from "@/app/context/logout";


type AsideNavigationProps = {
    onLogout: () => void;
    userName?: string;
    userRole?: string;
    userAvatar?: string;
    unreadNotificationCount: number
};

const AsideNavigation: React.FC<AsideNavigationProps> = ({
    onLogout,
    userName = "Jhon Doe",
    userRole = "Registrar",
    userAvatar = "",
    unreadNotificationCount
}) => {

    const pathname = usePathname();

    const { showLogoutModal, setLogoutHandler } = useLogout()

    useEffect(() => {
        setLogoutHandler(onLogout)
    }, [onLogout, setLogoutHandler])

    const handleLogoutClick = () => {
        showLogoutModal()
    }


    return (
        <aside className="w-64 fixed h-full bg-white shadow-sm">
            <div className="p-4 flex flex-col h-full">
                {/* Admin Brand and User Profile */}
                <div className="mb-6">
                    {/* <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-blue-700">Guidance and Records Management System</h1>
          </div> */}

                    {/* User Profile Section */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            {userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-10 h-10 rounded-full mr-3 border-2 border-blue-100"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                    <User className="h-5 w-5" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {userName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{userRole}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="mb-4">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Main Menu
                    </p>
                </div>

                <nav className="bg-white flex-1">
                    <ul className="space-y-1">
                        <li>
                            <Link
                                href="/admin/dashboard"
                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 ${pathname.startsWith("/admin/dashboard")
                                    ? "bg-blue-50 text-blue-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Briefcase className="h-5 w-5" />
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/users"
                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 ${pathname.startsWith("/admin/users")
                                    ? "bg-blue-50 text-blue-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Users className="h-5 w-5" />
                                <span>User Management</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* System Categories */}
                <div className="mb-4 mt-6">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        System
                    </p>
                </div>

                {/* Profile Section */}
                <div className="mt-auto pt-6 border-t border-gray-100">
                    <Link
                        href="/admin/notifications"
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 relative ${pathname.startsWith("/admin/notifications")
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <div className="relative">
                            <Bell className="h-5 w-5" />
                            {unreadNotificationCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-1">
                                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                                </span>
                            )}
                        </div>
                        <span>Notifications</span>
                    </Link>
                    <Link
                        href="/admin/settings"
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 ${pathname.startsWith("/admin/settings")
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </Link>
                    <button
                        onClick={handleLogoutClick}
                        className="w-full mt-4 px-3 py-2.5 flex items-center space-x-3 text-left text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors duration-200"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AsideNavigation;
