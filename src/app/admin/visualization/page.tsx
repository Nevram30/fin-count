"use client";
import React, { useState, useEffect } from "react";
import { Users, TrendingUp, Calendar, MapPin, Fish, Building2, BarChart3, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, LineChart, Line, Tooltip } from "recharts";
import AsideNavigation from "../components/aside.navigation";
import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";

// Types
interface ForecastData {
    month: string;
    predicted: number;
    historical: number;
    confidence: number;
}

interface FormData {
    species: string;
    facilityType: string;
    location: string;
    forecastPeriod: string;
    date: string;
    quantity: string;
}

const FullScreenLoader: React.FC = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

const HarvestForecast: React.FC = () => {
    const { isLoading, isAuthenticated, logout } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    const { unreadCount } = useNotification();

    // Form state
    const [formData, setFormData] = useState<FormData>({
        species: "Red Tilapia",
        facilityType: "Fish Cage",
        location: "Southern",
        forecastPeriod: "1 Months",
        date: "05/28/2025",
        quantity: "1000"
    });

    // Forecast data state
    const [forecastData, setForecastData] = useState<ForecastData[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Options for dropdowns
    const speciesOptions = [
        "Red Tilapia",
        "Nile Tilapia",
        "Blue Tilapia",
        "Hybrid Tilapia",
        "Catfish",
        "Carp",
        "Bass"
    ];

    const facilityTypeOptions = [
        "Fish Cage",
        "Pond System",
        "RAS (Recirculating Aquaculture System)",
        "Flow-through System",
        "Biofloc System"
    ];

    const locationOptions = [
        "Northern",
        "Southern",
        "Eastern",
        "Western",
        "Central",
        "Coastal"
    ];

    const forecastPeriodOptions = [
        "1 Months",
        "3 Months",
        "6 Months",
        "12 Months"
    ];

    // Handle form input changes
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Generate mock forecast data
    const generateForecastData = () => {
        const periods = parseInt(formData.forecastPeriod.split(' ')[0]);
        const baseQuantity = parseInt(formData.quantity);
        const data: ForecastData[] = [];

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();

        for (let i = 0; i < periods; i++) {
            const monthIndex = (currentMonth + i) % 12;
            const seasonalFactor = 0.8 + 0.4 * Math.sin((monthIndex / 12) * 2 * Math.PI);
            const growthFactor = 1 + (i * 0.15); // Growth over time
            const randomVariation = 0.9 + Math.random() * 0.2;

            const predicted = Math.round(baseQuantity * seasonalFactor * growthFactor * randomVariation);
            const historical = Math.round(predicted * (0.85 + Math.random() * 0.3));
            const confidence = Math.round(85 + Math.random() * 10);

            data.push({
                month: months[monthIndex],
                predicted,
                historical,
                confidence
            });
        }

        return data;
    };

    // Handle forecast generation
    const handleGenerateForecast = async () => {
        setIsGenerating(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const data = generateForecastData();
        setForecastData(data);
        setShowResults(true);
        setIsGenerating(false);
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
            <div className="grid grid-cols-6">
                <div className="col-start-2 col-span-5 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                                <h1 className="text-2xl font-bold text-gray-900">Data Visualization</h1>
                            </div>
                        </div>

                        {/* Harvest Forecast Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        <h2 className="text-lg font-semibold text-gray-900">Harvest Forecast</h2>
                                    </div>
                                    <Settings className="h-5 w-5 text-gray-400" />
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                    {/* Species */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Fish className="h-4 w-4" />
                                            Species:
                                        </label>
                                        <select
                                            value={formData.species}
                                            onChange={(e) => handleInputChange('species', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            {speciesOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Facility Type */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Building2 className="h-4 w-4" />
                                            Facility Type:
                                        </label>
                                        <select
                                            value={formData.facilityType}
                                            onChange={(e) => handleInputChange('facilityType', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            {facilityTypeOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <MapPin className="h-4 w-4" />
                                            Location:
                                        </label>
                                        <select
                                            value={formData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            {locationOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Forecast Period */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="h-4 w-4" />
                                            Forecast Period:
                                        </label>
                                        <select
                                            value={formData.forecastPeriod}
                                            onChange={(e) => handleInputChange('forecastPeriod', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            {forecastPeriodOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Date and Quantity Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="h-4 w-4" />
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => handleInputChange('date', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <BarChart3 className="h-4 w-4" />
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => handleInputChange('quantity', e.target.value)}
                                            placeholder="1000"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <button
                                            onClick={handleGenerateForecast}
                                            disabled={isGenerating}
                                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingUp className="h-4 w-4" />
                                                    Generate Forecast
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Instructions */}
                                {!showResults && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-blue-800 text-sm">
                                            Select a species and click Generate Forecast to view predictions
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Results Section */}
                        {showResults && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Forecast Chart */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Harvest Forecast</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={forecastData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="predicted" fill="#3B82F6" name="Predicted" />
                                                <Bar dataKey="historical" fill="#10B981" name="Historical" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Confidence Chart */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Confidence</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={forecastData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis domain={[0, 100]} />
                                                <Tooltip formatter={(value) => [`${value}%`, 'Confidence']} />
                                                <Line type="monotone" dataKey="confidence" stroke="#F59E0B" strokeWidth={3} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Summary Statistics */}
                                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {forecastData.reduce((sum, item) => sum + item.predicted, 0).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-blue-800">Total Predicted</div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-green-600">
                                                {Math.round(forecastData.reduce((sum, item) => sum + item.confidence, 0) / forecastData.length)}%
                                            </div>
                                            <div className="text-sm text-green-800">Avg Confidence</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {Math.max(...forecastData.map(item => item.predicted)).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-purple-800">Peak Month</div>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {formData.species}
                                            </div>
                                            <div className="text-sm text-orange-800">Species</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
            <HarvestForecast />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;