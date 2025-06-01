"use client";

import React, { useState, useEffect } from "react";
import { Users, TrendingUp, BarChart3, Scale, RefreshCw, Download, Filter, Fish, Trophy, Calendar, MapPin, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import AsideNavigation from "../components/aside.navigation";
import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";

interface LocationData {
    provinces: string[];
    cities: { [key: string]: string[] };
    barangays: { [key: string]: string[] };
}

interface ComparativeData {
    region: string;
    value: number;
    projected: number;
    growth: number;
}

interface FingerlingsData {
    location: string;
    tilapia: number;
    bangus: number;
    date: string;
    facilityType: string;
    province: string;
    city: string;
    barangay: string;
}

interface BeneficiaryData {
    id: string;
    name: string;
    location: string;
    species: 'tilapia' | 'bangus';
    fingerlingsReceived: number;
    harvestKg: number;
    facilityType: 'fish_cage' | 'pond';
    distributionDate: string;
    province: string;
    city: string;
    barangay: string;
}

interface ForecastingState {
    selectedLocation: string;
    data: ComparativeData[];
    isLoading: boolean;
    lastUpdated: Date;
}

interface FingerlingsState {
    dateFrom: string;
    dateTo: string;
    selectedProvince: string;
    selectedCity: string;
    selectedBarangay: string;
    selectedFacilityType: string;
    data: FingerlingsData[];
    isLoading: boolean;
}

interface LeaderboardState {
    selectedSpecies: 'all' | 'tilapia' | 'bangus';
    selectedFacilityType: 'all' | 'fish_cage' | 'pond';
    data: BeneficiaryData[];
    isLoading: boolean;
}

// Davao Region locations data
const locationData: LocationData = {
    provinces: ["Davao del Norte", "Davao del Sur", "Davao de Oro", "Davao Oriental", "Davao Occidental"],
    cities: {
        "Davao del Norte": ["Tagum City", "Panabo City", "Samal City", "Asuncion", "Braulio E. Dujali", "Carmen", "Kapalong", "New Corella", "San Isidro", "Santo Tomas", "Talaingod"],
        "Davao del Sur": ["Davao City", "Digos City", "Bansalan", "Hagonoy", "Kiblawan", "Magsaysay", "Malalag", "Matanao", "Padada", "Santa Cruz", "Sulop"],
        "Davao de Oro": ["Nabunturan", "Compostela", "Laak", "Mabini", "Maco", "Maragusan", "Mawab", "Monkayo", "Montevista", "New Bataan", "Pantukan"],
        "Davao Oriental": ["Mati City", "Baganga", "Banaybanay", "Boston", "Caraga", "Cateel", "Governor Generoso", "Lupon", "Manay", "San Isidro", "Tarragona"],
        "Davao Occidental": ["Malita", "Don Marcelino", "Jose Abad Santos", "Santa Maria"]
    },
    barangays: {
        "Tagum City": ["Apokon", "Bincungan", "La Filipina", "Magugpo East", "Magugpo North", "Magugpo Poblacion", "Magugpo South", "Mankilam", "Nueva Fuerza", "Pagsabangan", "San Agustin", "San Miguel", "Visayan Village"],
        "Panabo City": ["A.O. Floirendo", "Cagangohan", "Datu Abdul Dadia", "Gredu", "J.P. Laurel", "Kasilak", "Kauswagan", "Little Panay", "Mabunao", "Malativas", "Nanyo", "New Malaga", "New Malitbog", "New Pandan", "Quezon", "San Francisco", "San Nicolas", "San Pedro", "San Roque", "San Vicente", "Santo Niño", "Waterfall"],
        "Samal City": ["Adecor", "Anonang", "Aumbay", "Babak", "Caliclic", "Camudmud", "Cawag", "Cogon", "Dadiangas", "Guilon", "Kanaan", "Kinawitnon", "Licoan", "Limao", "Miranda", "Pangubatan", "Penaplata", "Poblacion", "San Isidro", "San Miguel", "San Remigio", "Sion", "Tagbaobo", "Tagpopongan", "Tambo", "Tokawal"],
        "Davao City": ["Agdao", "Alambre", "Atan-awe", "Bago Aplaya", "Bago Gallera", "Baliok", "Biao Escuela", "Biao Guianga", "Biao Joaquin", "Binugao", "Buhangin", "Bunawan", "Cabantian", "Cadalian", "Calinan", "Carmen", "Catalunan Grande", "Catalunan Pequeño", "Catitipan", "Central Business District", "Daliao", "Dumoy", "Eden", "Fatima", "Indangan", "Lamanan", "Lampianao", "Leon Garcia", "Ma-a", "Maa", "Magsaysay", "Mahayag", "Malabog", "Manambulan", "Mandug", "Marilog", "Matina Aplaya", "Matina Crossing", "Matina Pangi", "Mintal", "Mulig", "New Carmen", "New Valencia", "Pampanga", "Panacan", "Paquibato", "Paradise Embac", "Riverside", "Salapawan", "San Antonio", "Sirawan", "Sirao", "Tacunan", "Tagluno", "Tagurano", "Talomo", "Tamayong", "Tamugan", "Tapak", "Tawan-tawan", "Tibuloy", "Tibungco", "Toril", "Tugbok", "Waan", "Wines"],
        "Digos City": ["Aplaya", "Balabag", "Biao", "Binaton", "Cogon", "Colorado", "Dulangan", "Goma", "Igpit", "Kapatagan", "Kiagot", "Mahayahay", "Matti", "Meta", "Palili", "Poblacion", "San Agustin", "San Jose", "San Miguel", "Sinawilan", "Soong", "Tres de Mayo", "Zone I", "Zone II", "Zone III"],
        "Mati City": ["Badas", "Bobon", "Buso", "Central", "Dahican", "Danao", "Don Enrique Lopez", "Don Martin Marundan", "Langka", "Lawigan", "Libudon", "Lupon", "Matiao", "Mayo", "Sainz", "Taguibo", "Tagum"],
        "Nabunturan": ["Anislagan", "Antequera", "Basak", "Cabidianan", "Katipunan", "Magading", "Magsaysay", "Nabunturan", "Pandasan", "Poblacion", "San Vicente"],
        "Malita": ["Bolitoc", "Bolontoy", "Culaman", "Dapitan", "Don Narciso Ramos", "Happy Valley", "Kiokong", "Lawa-an", "Little Baguio", "Poblacion", "Sarmiento"],
        "Asuncion": ["Bapa", "Candiis", "Concepcion", "New Corella", "Poblacion", "San Vicente", "Sonlon", "Tubalan"],
        "Braulio E. Dujali": ["Cabidianan", "Datu Balong", "Magsaysay", "New Katipunan", "Poblacion", "Tanglaw", "Tibal-og", "Tres de Mayo"],
        "Carmen": ["Alejal", "Asuncion", "Bincungan", "Carmen", "Ising", "Mabuhay", "Mabini", "Poblacion", "San Agustin"],
        "Bansalan": ["Anonang", "Bitaug", "Darapuay", "Dolo", "Kinuskusan", "Libertad", "Linawan", "Mabini", "Mabunga", "Managa", "Marber", "New Clarin", "Poblacion", "Siblag", "Tinongcop"],
        "Compostela": ["Bagongsilang", "Gabi", "Lagab", "Mangayon", "Mapaca", "Ngan", "New Leyte", "New Panay", "Osmeña", "Poblacion", "Siocon"],
        "Baganga": ["Banaybanay", "Batawan", "Bobonao", "Campawan", "Caraga", "Dapnan", "Lambajon", "Poblacion", "Tokoton"],
        "Don Marcelino": ["Balasinon", "Dulian", "Kinanga", "New Katipunan", "Poblacion", "San Miguel", "Santa Rosa"]
    }
};

const FullScreenLoader = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

const DataVisualization: React.FC = () => {
    const { isLoading, isAuthenticated, logout } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    const { unreadCount } = useNotification();

    const [activeTab, setActiveTab] = useState<'comparative' | 'fingerlings' | 'leaderboard'>('comparative');

    const [forecastState, setForecastState] = useState<ForecastingState>({
        selectedLocation: "Barangay",
        data: [],
        isLoading: false,
        lastUpdated: new Date()
    });

    const [fingerlingsState, setFingerlingsState] = useState<FingerlingsState>({
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        selectedProvince: 'all',
        selectedCity: 'all',
        selectedBarangay: 'all',
        selectedFacilityType: 'all',
        data: [],
        isLoading: false
    });

    const [leaderboardState, setLeaderboardState] = useState<LeaderboardState>({
        selectedSpecies: 'all',
        selectedFacilityType: 'all',
        data: [],
        isLoading: false
    });

    // Location options
    const locationOptions = ["Barangay", "Municipality", "Province"];
    const facilityTypes = ["All Facilities", "Fish Cage", "Pond"];

    // Get available cities based on selected province
    const getAvailableCities = (province: string) => {
        if (province === 'all' || !locationData.cities[province]) {
            return ["All Cities"];
        }
        return ["All Cities", ...locationData.cities[province]];
    };

    // Get available barangays based on selected city
    const getAvailableBarangays = (city: string) => {
        if (city === 'all' || !locationData.barangays[city]) {
            return ["All Barangays"];
        }
        return ["All Barangays", ...locationData.barangays[city]];
    };

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

    // Generate mock fingerlings data with Davao locations
    const generateFingerlingsData = (): FingerlingsData[] => {
        const cities = ["Davao City", "Tagum City", "Panabo City", "Digos City", "Mati City", "Nabunturan", "Malita"];
        const facilityTypes = ['Fish Cage', 'Pond'];
        const provinces = locationData.provinces;

        return Array.from({ length: 12 }, (_, i) => {
            const city = cities[i % cities.length];
            const province = provinces.find(p => locationData.cities[p]?.includes(city)) || provinces[0];
            const barangays = locationData.barangays[city] || ["Poblacion"];

            return {
                location: city,
                tilapia: Math.floor(Math.random() * 5000) + 1000,
                bangus: Math.floor(Math.random() * 3000) + 500,
                date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                facilityType: facilityTypes[i % facilityTypes.length],
                province: province,
                city: city,
                barangay: barangays[i % barangays.length]
            };
        });
    };

    // Generate mock beneficiary data with Davao locations
    const generateBeneficiaryData = (): BeneficiaryData[] => {
        const names = ['Juan dela Cruz', 'Maria Santos', 'Pedro Gonzales', 'Ana Reyes', 'Carlos Martinez', 'Rosa Lopez', 'Miguel Torres', 'Elena Fernandez'];
        const cities = ["Davao City", "Tagum City", "Panabo City", "Digos City", "Mati City", "Nabunturan", "Malita"];
        const species: ('tilapia' | 'bangus')[] = ['tilapia', 'bangus'];
        const facilityTypes: ('fish_cage' | 'pond')[] = ['fish_cage', 'pond'];

        return Array.from({ length: 20 }, (_, i) => {
            const fingerlingsReceived = Math.floor(Math.random() * 2000) + 500;
            const harvestKg = Math.floor(fingerlingsReceived * (0.6 + Math.random() * 0.4) * (0.8 + Math.random() * 0.4));
            const city = cities[i % cities.length];
            const province = locationData.provinces.find(p => locationData.cities[p]?.includes(city)) || locationData.provinces[0];
            const barangays = locationData.barangays[city] || ["Poblacion"];

            return {
                id: `BEN-${String(i + 1).padStart(3, '0')}`,
                name: names[i % names.length],
                location: city,
                species: species[i % species.length],
                fingerlingsReceived,
                harvestKg,
                facilityType: facilityTypes[i % facilityTypes.length],
                distributionDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                province: province,
                city: city,
                barangay: barangays[i % barangays.length]
            };
        });
    };

    // Handle location change
    const handleLocationChange = async (location: string) => {
        setForecastState(prev => ({ ...prev, selectedLocation: location, isLoading: true }));
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newData = generateComparativeData(location);
        setForecastState(prev => ({
            ...prev,
            data: newData,
            isLoading: false,
            lastUpdated: new Date()
        }));
    };

    // Handle fingerlings comparison
    const handleFingerlingsCompare = async () => {
        setFingerlingsState(prev => ({ ...prev, isLoading: true }));
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newData = generateFingerlingsData();
        setFingerlingsState(prev => ({
            ...prev,
            data: newData,
            isLoading: false
        }));
    };

    // Handle leaderboard refresh
    const handleLeaderboardRefresh = async () => {
        setLeaderboardState(prev => ({ ...prev, isLoading: true }));
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newData = generateBeneficiaryData();
        setLeaderboardState(prev => ({
            ...prev,
            data: newData,
            isLoading: false
        }));
    };

    // Handle province change in fingerlings section
    const handleProvinceChange = (province: string) => {
        setFingerlingsState(prev => ({
            ...prev,
            selectedProvince: province,
            selectedCity: 'all',
            selectedBarangay: 'all'
        }));
    };

    // Handle city change in fingerlings section
    const handleCityChange = (city: string) => {
        setFingerlingsState(prev => ({
            ...prev,
            selectedCity: city,
            selectedBarangay: 'all'
        }));
    };

    // Initialize data
    useEffect(() => {
        handleLocationChange("Barangay");
        handleFingerlingsCompare();
        handleLeaderboardRefresh();
    }, []);

    // Filter leaderboard data
    const filteredLeaderboardData = leaderboardState.data
        .filter(item =>
            (leaderboardState.selectedSpecies === 'all' || item.species === leaderboardState.selectedSpecies) &&
            (leaderboardState.selectedFacilityType === 'all' || item.facilityType === leaderboardState.selectedFacilityType)
        )
        .sort((a, b) => b.harvestKg - a.harvestKg)
        .slice(0, 10);

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{label}</p>
                    {payload.map((item: any, index: number) => (
                        <p key={index} style={{ color: item.color }}>
                            {item.name}: <span className="font-semibold">{item.value?.toLocaleString()}</span>
                        </p>
                    ))}
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
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        Your account doesn't have access to this area
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
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex flex-col items-start gap-3 mb-2">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="h-6 w-6 text-blue-600" />
                                    <h1 className="text-2xl font-bold text-gray-900">Davao Region Aquaculture Data Visualization</h1>
                                </div>
                                <p className="text-gray-600">Comparative tools and fingerling distribution analysis for Davao Region</p>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="mb-6">
                            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('comparative')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'comparative'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Scale className="h-4 w-4" />
                                    Comparative Analysis
                                </button>
                                <button
                                    onClick={() => setActiveTab('fingerlings')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'fingerlings'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Fish className="h-4 w-4" />
                                    Fingerling Distribution
                                </button>
                                <button
                                    onClick={() => setActiveTab('leaderboard')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'leaderboard'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Trophy className="h-4 w-4" />
                                    Harvest Leaderboard
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Last updated: {new Date().toLocaleString()}
                            </div>

                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh All
                                </button>

                                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    <Download className="h-4 w-4" />
                                    Export Data
                                </button>
                            </div>
                        </div>

                        {/* Comparative Analysis Tab */}
                        {activeTab === 'comparative' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <Scale className="h-5 w-5 text-blue-600" />
                                            <h2 className="text-xl font-semibold text-gray-900">Comparative Analysis</h2>
                                        </div>

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
                                                onClick={() => handleLocationChange(forecastState.selectedLocation)}
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
                                                        <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => value.toLocaleString()} />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Bar dataKey="value" fill="#7dd3fc" radius={[4, 4, 0, 0]} name="Current" />
                                                        <Bar dataKey="projected" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Projected" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>

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
                                </div>
                            </div>
                        )}

                        {/* Fingerling Distribution Tab */}
                        {activeTab === 'fingerlings' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <Fish className="h-5 w-5 text-blue-600" />
                                            <h2 className="text-xl font-semibold text-gray-900">Fingerling Distribution Analysis</h2>
                                        </div>
                                    </div>

                                    {/* Filters */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                                            <input
                                                type="date"
                                                value={fingerlingsState.dateFrom}
                                                onChange={(e) => setFingerlingsState(prev => ({ ...prev, dateFrom: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                                            <input
                                                type="date"
                                                value={fingerlingsState.dateTo}
                                                onChange={(e) => setFingerlingsState(prev => ({ ...prev, dateTo: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                                            <select
                                                value={fingerlingsState.selectedProvince}
                                                onChange={(e) => handleProvinceChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="all">All Provinces</option>
                                                {locationData.provinces.map(province => (
                                                    <option key={province} value={province}>{province}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <select
                                                value={fingerlingsState.selectedCity}
                                                onChange={(e) => handleCityChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {getAvailableCities(fingerlingsState.selectedProvince).map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                                            <select
                                                value={fingerlingsState.selectedBarangay}
                                                onChange={(e) => setFingerlingsState(prev => ({ ...prev, selectedBarangay: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {getAvailableBarangays(fingerlingsState.selectedCity).map(barangay => (
                                                    <option key={barangay} value={barangay}>{barangay}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
                                            <select
                                                value={fingerlingsState.selectedFacilityType}
                                                onChange={(e) => setFingerlingsState(prev => ({ ...prev, selectedFacilityType: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {facilityTypes.map(facility => (
                                                    <option key={facility} value={facility.toLowerCase().replace(/\s+/g, '_')}>{facility}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mb-6">
                                        <button
                                            onClick={handleFingerlingsCompare}
                                            disabled={fingerlingsState.isLoading}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center gap-2"
                                        >
                                            {fingerlingsState.isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <Filter className="h-4 w-4" />
                                                    Apply Filters
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Chart */}
                                    <div className="relative">
                                        {fingerlingsState.isLoading ? (
                                            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                                                <div className="text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                    <p className="text-gray-600">Loading fingerling distribution data...</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-96">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={fingerlingsState.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis dataKey="location" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => value.toLocaleString()} />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Legend />
                                                        <Bar dataKey="tilapia" fill="#10b981" name="Tilapia" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="bangus" fill="#3b82f6" name="Bangus" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>

                                    {/* Summary */}
                                    {!fingerlingsState.isLoading && fingerlingsState.data.length > 0 && (
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-green-50 rounded-lg p-4">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {fingerlingsState.data.reduce((sum, item) => sum + item.tilapia, 0).toLocaleString()}
                                                </div>
                                                <div className="text-sm text-green-800">Total Tilapia</div>
                                            </div>
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {fingerlingsState.data.reduce((sum, item) => sum + item.bangus, 0).toLocaleString()}
                                                </div>
                                                <div className="text-sm text-blue-800">Total Bangus</div>
                                            </div>
                                            <div className="bg-purple-50 rounded-lg p-4">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {fingerlingsState.data.length}
                                                </div>
                                                <div className="text-sm text-purple-800">Locations</div>
                                            </div>
                                            <div className="bg-orange-50 rounded-lg p-4">
                                                <div className="text-2xl font-bold text-orange-600">
                                                    {fingerlingsState.data.reduce((sum, item) => sum + item.tilapia + item.bangus, 0).toLocaleString()}
                                                </div>
                                                <div className="text-sm text-orange-800">Total Fingerlings</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Leaderboard Tab */}
                        {activeTab === 'leaderboard' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <Trophy className="h-5 w-5 text-blue-600" />
                                            <h2 className="text-xl font-semibold text-gray-900">Harvest Leaderboard</h2>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <select
                                                value={leaderboardState.selectedSpecies}
                                                onChange={(e) => setLeaderboardState(prev => ({ ...prev, selectedSpecies: e.target.value as any }))}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            >
                                                <option value="all">All Species</option>
                                                <option value="tilapia">Tilapia</option>
                                                <option value="bangus">Bangus</option>
                                            </select>

                                            <select
                                                value={leaderboardState.selectedFacilityType}
                                                onChange={(e) => setLeaderboardState(prev => ({ ...prev, selectedFacilityType: e.target.value as any }))}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            >
                                                <option value="all">All Facilities</option>
                                                <option value="fish_cage">Fish Cage</option>
                                                <option value="pond">Pond</option>
                                            </select>

                                            <button
                                                onClick={handleLeaderboardRefresh}
                                                disabled={leaderboardState.isLoading}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center gap-2"
                                            >
                                                {leaderboardState.isLoading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <RefreshCw className="h-4 w-4" />
                                                        Refresh
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {leaderboardState.isLoading ? (
                                        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                <p className="text-gray-600">Loading leaderboard data...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredLeaderboardData.map((beneficiary, index) => (
                                                <div key={beneficiary.id} className={`flex items-center justify-between p-4 rounded-lg border-2 ${index === 0 ? 'border-yellow-300 bg-yellow-50' :
                                                    index === 1 ? 'border-gray-300 bg-gray-50' :
                                                        index === 2 ? 'border-orange-300 bg-orange-50' :
                                                            'border-gray-200 bg-white'
                                                    }`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                                            index === 1 ? 'bg-gray-500' :
                                                                index === 2 ? 'bg-orange-500' :
                                                                    'bg-blue-500'
                                                            }`}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{beneficiary.name}</h3>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {beneficiary.location}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Building2 className="h-3 w-3" />
                                                                    {beneficiary.facilityType.replace('_', ' ')}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Fish className="h-3 w-3" />
                                                                    {beneficiary.species}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-gray-900">
                                                            {beneficiary.harvestKg.toLocaleString()} kg
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            From {beneficiary.fingerlingsReceived.toLocaleString()} fingerlings
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
            <DataVisualization />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;
