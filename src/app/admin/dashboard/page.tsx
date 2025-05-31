"use client";
import React from "react";
import { Users, BarChart3, Package, UserCheck, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import AsideNavigation from "../components/aside.navigation";

import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";

// TypeScript interfaces
interface ChartData {
    month: string;
    fingerlingCount: number;
}

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

// Monthly Fingerling Count Chart Component
const MonthlyFingerlingsChart: React.FC = () => {
    // Sample data - replace with actual data from your API
    const chartData: ChartData[] = [
        { month: "Jan", fingerlingCount: 100 },
        { month: "Feb", fingerlingCount: 25 },
        { month: "Mar", fingerlingCount: 50 },
        { month: "Apr", fingerlingCount: 5 },
        { month: "May", fingerlingCount: 10 },
        { month: "Jun", fingerlingCount: 30 },
        { month: "Jul", fingerlingCount: 90 },
        { month: "Aug", fingerlingCount: 80 },
        { month: "Sep", fingerlingCount: 100 },
        { month: "Oct", fingerlingCount: 200 },
        { month: "Nov", fingerlingCount: 78 },
        { month: "Dec", fingerlingCount: 100 }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Monthly Fingerling Count</h3>
                <p className="text-sm text-gray-600">Track fingerling production across the year</p>
            </div>

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            domain={[0, 1]}
                            ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="rect"
                            wrapperStyle={{ paddingBottom: '20px' }}
                        />
                        <Bar
                            dataKey="fingerlingCount"
                            fill="#67e8f9"
                            name="Fingerling Count"
                            radius={[2, 2, 0, 0]}
                            stroke="#22d3ee"
                            strokeWidth={1}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Additional Statistics Cards for Data Visualization
const DataVisualizationStats: React.FC = () => {
    const stats = [
        {
            title: "Peak Month",
            value: "N/A",
            description: "Highest production month",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600"
        },
        {
            title: "Total Annual",
            value: "0",
            description: "Total fingerlings this year",
            bgColor: "bg-green-50",
            textColor: "text-green-600"
        },
        {
            title: "Average Monthly",
            value: "0",
            description: "Monthly average production",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600"
        },
        {
            title: "Growth Rate",
            value: "0%",
            description: "Month-over-month growth",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-3`}>
                        <TrendingUp className={`h-4 w-4 ${stat.textColor}`} />
                    </div>
                    <div className="mb-2">
                        <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-sm font-medium text-gray-700">{stat.title}</span>
                    </div>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
            ))}
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
            <div className="grid grid-cols-6 bg-gradient-to-br from-gray-50 to-emerald-50 min-h-screen">
                <div className="col-start-1 sm:col-start-1 md:col-start-1 lg:col-start-2 xl:col-start-2 col-span-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-5 pt-20 pb-8 sm:px-6 sm:py-8">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome back! Here's what's happening with your system.</p>
                        </div>

                        {/* Statistics Overview */}
                        <StatisticsOverview />

                        {/* Statistics Cards */}
                        <DataVisualizationStats />

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

                        {/* Page Header */}
                        <div className="mb-8 mt-10">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                    <TrendingUp className="h-6 w-6 text-blue-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Data Visualization</h1>
                            </div>
                            <p className="text-gray-600">
                                Comprehensive insights and analytics for your fingerling production data
                            </p>
                        </div>

                        {/* Chart Section */}
                        <div className="space-y-8">
                            <MonthlyFingerlingsChart />

                            {/* Additional Charts Placeholder */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Batch Performance</h3>
                                    <div className="h-48 flex items-center justify-center text-gray-500">
                                        <div className="text-center">
                                            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                            <p className="text-sm">Batch performance chart will be displayed here</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Production Trends</h3>
                                    <div className="h-48 flex items-center justify-center text-gray-500">
                                        <div className="text-center">
                                            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                            <p className="text-sm">Production trends chart will be displayed here</p>
                                        </div>
                                    </div>
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