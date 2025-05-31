"use client";

import React, { useState, useEffect } from "react";
import { Users, TrendingUp, BarChart3, Scale, RefreshCw, Download, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import AsideNavigation from "../components/aside.navigation";
import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";

// Types
interface ComparativeData {
    region: string;
    value: number;
    projected: number;
    growth: number;
}

interface ForecastingState {
    selectedLocation: string;
    data: ComparativeData[];
    isLoading: boolean;
    lastUpdated: Date;
}

const FullScreenLoader = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

const Forecasting: React.FC = () => {
    const { isLoading, isAuthenticated, logout } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    const { unreadCount } = useNotification();

    // State management
    const [forecastState, setForecastState] = useState<ForecastingState>({
        selectedLocation: "Barangay",
        data: [],
        isLoading: false,
        lastUpdated: new Date()
    });

    // Location options
    const locationOptions = [
        "Barangay",
        "Municipality",
        "Province",
        "Region",
        "National"
    ];

    // Generate mock comparative data
    const generateComparativeData = (location: string): ComparativeData[] => {
        const baseData = [
            { region: "Q1 2024", baseValue: 1000 },
            { region: "Q2 2024", baseValue: 1500 },
            { region: "Q3 2024", baseValue: 1200 },
            { region: "Q4 2024", baseValue: 900 }
        ];

        const locationMultiplier = {
            "Barangay": 1,
            "Municipality": 1.5,
            "Province": 2.2,
            "Region": 3.5,
            "National": 5
        }[location] || 1;

        return baseData.map(item => {
            const value = Math.round(item.baseValue * locationMultiplier * (0.8 + Math.random() * 0.4));
            const projected = Math.round(value * (1.1 + Math.random() * 0.3));
            const growth = Math.round(((projected - value) / value) * 100);

            return {
                region: item.region,
                value,
                projected,
                growth
            };
        });
    };

    // Handle location change
    const handleLocationChange = async (location: string) => {
        setForecastState(prev => ({ ...prev, selectedLocation: location, isLoading: true }));

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newData = generateComparativeData(location);
        setForecastState(prev => ({
            ...prev,
            data: newData,
            isLoading: false,
            lastUpdated: new Date()
        }));
    };

    // Handle compare button click
    const handleCompare = () => {
        handleLocationChange(forecastState.selectedLocation);
    };

    // Handle data refresh
    const handleRefresh = () => {
        handleLocationChange(forecastState.selectedLocation);
    };

    // Initialize data on component mount
    useEffect(() => {
        handleLocationChange("Barangay");
    }, []);

    // Custom tooltip for chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p className="text-blue-600">
                        Current: <span className="font-semibold">{payload[0]?.value?.toLocaleString()}</span>
                    </p>
                    {payload[1] && (
                        <p className="text-green-600">
                            Projected: <span className="font-semibold">{payload[1]?.value?.toLocaleString()}</span>
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

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
                <div className="col-start-2 col-span-5 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex flex-col items-start gap-3 mb-2">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="h-6 w-6 text-blue-600" />
                                    <h1 className="text-2xl font-bold text-gray-900">Data Visualization</h1>
                                </div>
                                <p className="text-gray-600">Comparative tools</p>
                            </div>
                        </div>

                        {/* Comparative Analysis Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6">
                                {/* Section Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Scale className="h-5 w-5 text-blue-600" />
                                        <h2 className="text-xl font-semibold text-gray-900">Comparative Analysis</h2>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-4">
                                        <select
                                            value={forecastState.selectedLocation}
                                            onChange={(e) => setForecastState(prev => ({ ...prev, selectedLocation: e.target.value }))}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            {locationOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={handleCompare}
                                            disabled={forecastState.isLoading}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center gap-2"
                                        >
                                            {forecastState.isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <BarChart3 className="h-4 w-4" />
                                                    Compare
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Chart Container */}
                                <div className="relative">
                                    {forecastState.isLoading ? (
                                        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                <p className="text-gray-600">Loading comparative data...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-96">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={forecastState.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis
                                                        dataKey="region"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                                        tickFormatter={(value) => value.toLocaleString()}
                                                    />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar
                                                        dataKey="value"
                                                        fill="#7dd3fc"
                                                        radius={[4, 4, 0, 0]}
                                                        name="Current"
                                                    />
                                                    <Bar
                                                        dataKey="projected"
                                                        fill="#0ea5e9"
                                                        radius={[4, 4, 0, 0]}
                                                        name="Projected"
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* Summary Statistics */}
                                {!forecastState.isLoading && forecastState.data.length > 0 && (
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {forecastState.data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-blue-800">Total Current</div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-green-600">
                                                {forecastState.data.reduce((sum, item) => sum + item.projected, 0).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-green-800">Total Projected</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {Math.round(forecastState.data.reduce((sum, item) => sum + item.growth, 0) / forecastState.data.length)}%
                                            </div>
                                            <div className="text-sm text-purple-800">Avg Growth</div>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {forecastState.selectedLocation}
                                            </div>
                                            <div className="text-sm text-orange-800">Analysis Level</div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Last updated: {forecastState.lastUpdated.toLocaleString()}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleRefresh}
                                            disabled={forecastState.isLoading}
                                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <RefreshCw className={`h-4 w-4 ${forecastState.isLoading ? 'animate-spin' : ''}`} />
                                            Refresh
                                        </button>

                                        <button
                                            disabled={forecastState.isLoading || forecastState.data.length === 0}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            Export
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Analysis Tools */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <h3 className="font-semibold text-gray-900">Trend Analysis</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Analyze growth patterns and seasonal variations in your data.
                                </p>
                                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    View Trends
                                </button>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Filter className="h-5 w-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Apply custom filters to refine your comparative analysis.
                                </p>
                                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                    Apply Filters
                                </button>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900">Custom Reports</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Generate detailed reports based on your analysis criteria.
                                </p>
                                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Create Report
                                </button>
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
            <Forecasting />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;
