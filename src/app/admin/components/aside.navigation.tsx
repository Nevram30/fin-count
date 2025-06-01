"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User,
    Bell,
    Settings,
    LogOut,
    ClipboardList,
    LayoutPanelLeft,
    UserRoundPlus,
    ChartColumnStacked,
    Menu,
    X,
    Building2,
    ChartNoAxesCombined,
    CircleHelp,
    MessageSquareText,
} from "lucide-react";
import { useLogout } from "@/app/context/logout";

type AsideNavigationProps = {
    onLogout: () => void;
    userName?: string;
    userRole?: string;
    userAvatar?: string;
    unreadNotificationCount: number;
};

const AsideNavigation: React.FC<AsideNavigationProps> = ({
    onLogout,
    userName = "Jhon Doe",
    userRole = "Administrator",
    userAvatar = "",
    unreadNotificationCount
}) => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { showLogoutModal, setLogoutHandler } = useLogout();

    useEffect(() => {
        setLogoutHandler(onLogout);
    }, [onLogout, setLogoutHandler]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Close menu when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.getElementById('mobile-sidebar');
            const toggleButton = document.getElementById('sidebar-toggle');

            if (isOpen && sidebar && !sidebar.contains(event.target as Node) &&
                toggleButton && !toggleButton.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleLogoutClick = () => {
        showLogoutModal();
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                id="sidebar-toggle"
                onClick={toggleSidebar}
                className={`fixed z-50 lg:hidden p-2 rounded-md shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 
                    ${isOpen ? 'bg-red-500 top-4 right-28' : 'bg-white top-4 left-4'}`}
                aria-label="Toggle navigation menu"
            >
                {isOpen ? (<X className="h-6 w-6 text-white" />) : (<Menu className="h-6 w-6 text-gray-600" />)}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
            )}

            {/* Sidebar */}
            <aside
                id="mobile-sidebar"
                className={`
                    fixed h-full bg-white border-r shadow-lg z-40 transition-transform duration-300 ease-in-out
                    w-64 lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="p-4 flex flex-col h-full overflow-y-auto">
                    {/* Header spacing for mobile toggle button */}
                    <div className="h-12 lg:h-0 flex-shrink-0" />

                    {/* Admin Brand and User Profile */}
                    <div className="mb-6">
                        {/* User Profile Section */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt={userName}
                                        className="w-10 h-10 rounded-full mr-3 border-2 border-blue-100 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
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
                    <div className="mb-2">
                        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Main Menu
                        </p>
                    </div>

                    <nav className="bg-white">
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    href="/admin/dashboard"
                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 ${pathname.startsWith("/admin/dashboard")
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <LayoutPanelLeft className="h-5 w-5 flex-shrink-0" />
                                    <span className="truncate">Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin/reports"
                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 ${pathname.startsWith("/admin/reports")
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <ClipboardList className="h-5 w-5 flex-shrink-0" />
                                    <span className="truncate">Reports</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Analytics Navigation */}
                    <div className="mt-6">
                        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Analytics
                        </p>
                    </div>

                    <nav className="bg-white flex-1 mb-4">
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    href="/admin/distribution"
                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 ${pathname.startsWith("/admin/distribution")
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <Building2 className="h-5 w-5 flex-shrink-0" />
                                    <span className="truncate">Distribution</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin/visualization"
                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 ${pathname.startsWith("/admin/visualization")
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <ChartColumnStacked className="h-5 w-5 flex-shrink-0" />
                                    <span className="truncate">Data Visualization</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin/forecasting"
                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 ${pathname.startsWith("/admin/forecasting")
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <ChartNoAxesCombined className="h-5 w-5 flex-shrink-0" />
                                    <span className="truncate">Forecasting</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* User Management Navigation */}
                    <div>
                        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            User Management
                        </p>
                    </div>

                    <nav className="bg-white flex-1">
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    href="/admin/users"
                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 ${pathname.startsWith("/admin/users")
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <UserRoundPlus className="h-5 w-5 flex-shrink-0" />
                                    <span className="truncate">Add Users</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* System Categories */}
                    <div className="mb-2 mt-6">
                        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            System
                        </p>
                    </div>

                    {/* Profile Section */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                        <Link
                            href="/admin/helpdesk"
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 relative ${pathname.startsWith("/admin/helpdesk")
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <div className="relative flex-shrink-0">
                                <CircleHelp className="h-5 w-5" />
                            </div>
                            <span className="truncate">Help Desk</span>
                        </Link>
                        <Link
                            href="/admin/feedback"
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 ${pathname.startsWith("/admin/feedback")
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <MessageSquareText className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate">Feedback</span>
                        </Link>
                        <button
                            onClick={handleLogoutClick}
                            className="w-full mt-4 px-3 py-2.5 flex items-center space-x-3 text-left text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors duration-200"
                        >
                            <LogOut className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AsideNavigation;