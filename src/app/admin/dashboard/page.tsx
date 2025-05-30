"use client";
import React from "react";
import { Users, BarChart3, Package, UserCheck } from "lucide-react";
import AsideNavigation from "../components/aside.navigation";

import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";

// TypeScript interfaces
interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    iconColor: string;
}

interface StatData {
    title: string;
    value: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    iconColor: string;
}

const FullScreenLoader = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

// Statistics Card Component
const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon, bgColor, iconColor }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <div className={`p-2 rounded-full ${bgColor}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
        </div>
        <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
    </div>
);

// Statistics Overview Component
const StatisticsOverview: React.FC = () => {
    const stats: StatData[] = [
        {
            title: "Total Fingerlings",
            value: "0",
            description: "Total fingerlings counted across all batches",
            icon: Package,
            bgColor: "bg-cyan-50",
            iconColor: "text-cyan-600"
        },
        {
            title: "Active Batch",
            value: "1",
            description: "Currently active fingering batches",
            icon: BarChart3,
            bgColor: "bg-cyan-50",
            iconColor: "text-cyan-600"
        },
        {
            title: "Total Batch",
            value: "1",
            description: "Total number of batch",
            icon: Package,
            bgColor: "bg-cyan-50",
            iconColor: "text-cyan-600"
        },
        {
            title: "Staff Members",
            value: "2",
            description: "Total number of staff members",
            icon: UserCheck,
            bgColor: "bg-cyan-50",
            iconColor: "text-cyan-600"
        }
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Statistics Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
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
            <div className="grid grid-cols-6">
                <div className="col-start-2 col-span-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome back! Here's what's happening with your system.</p>
                        </div>

                        {/* Statistics Overview */}
                        <StatisticsOverview />

                        {/* Additional Dashboard Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-gray-600">New batch created</span>
                                        <span className="text-xs text-gray-400">2 hours ago</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-gray-600">Staff member added</span>
                                        <span className="text-xs text-gray-400">1 day ago</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-gray-600">System maintenance completed</span>
                                        <span className="text-xs text-gray-400">3 days ago</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                                        <span className="text-sm font-medium text-blue-700">Add New Batch</span>
                                    </button>
                                    <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                                        <span className="text-sm font-medium text-green-700">Manage Staff</span>
                                    </button>
                                    <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                                        <span className="text-sm font-medium text-purple-700">View Reports</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Main App Component with LogoutProvider wrapper
const App: React.FC = () => {
    return (
        <LogoutProvider>
            <AdminDashboard />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;