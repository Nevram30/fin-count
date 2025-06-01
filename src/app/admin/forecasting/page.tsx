"use client";
import React, { useState, useEffect } from "react";
import { Users, TrendingUp, Calendar, MapPin, Fish, Building2, BarChart3, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, LineChart, Line, Tooltip, ComposedChart, Area, AreaChart } from "recharts";
import AsideNavigation from "../components/aside.navigation";
import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";

// Types
interface ForecastData {
    month: string;
    date: string;
    predicted: number;
    historical: number;
    confidence: number;
    species: string;
    location: string;
}

interface TrendData {
    month: string;
    date: string;
    value: number;
    species: string;
    location: string;
}

interface BatchData {
    batchId: string;
    name: string;
    city?: string;
    barangay?: string;
    fingerlingsCount: number;
    harvestForecasted: number;
}

interface FormData {
    dateFrom: string;
    dateTo: string;
    species: string;
    province: string;
    city: string;
    barangay: string;
    facilityType: string;
}

interface LocationData {
    provinces: string[];
    cities: { [key: string]: string[] };
    barangays: { [key: string]: string[] };
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
        dateFrom: "2025-06-01",
        dateTo: "2025-12-31",
        species: "Red Tilapia",
        province: "Davao del Norte",
        city: "Tagum City",
        barangay: "Apokon",
        facilityType: "Fish Cage"
    });

    // Forecast data state
    const [forecastData, setForecastData] = useState<ForecastData[]>([]);
    const [provinceTrendData, setProvinceTrendData] = useState<TrendData[]>([]);
    const [cityTrendData, setCityTrendData] = useState<TrendData[]>([]);
    const [barangayTrendData, setBarangayTrendData] = useState<TrendData[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalLevel, setModalLevel] = useState<'province' | 'city' | 'barangay'>('province');
    const [modalData, setModalData] = useState<BatchData[]>([]);

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

    // Options for dropdowns
    const speciesOptions = [
        "Red Tilapia",
        "Bangus",
    ];

    const facilityTypeOptions = [
        "Fish Cage",
        "Pond System",
    ];

    // Handle form input changes
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Reset dependent fields when parent changes
            if (field === 'province') {
                newData.city = locationData.cities[value]?.[0] || '';
                newData.barangay = '';
            } else if (field === 'city') {
                newData.barangay = locationData.barangays[value]?.[0] || '';
            }

            return newData;
        });
    };

    // Generate date range between two dates
    const getDateRange = (startDate: string, endDate: string): string[] => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dates: string[] = [];

        const current = new Date(start);
        while (current <= end) {
            dates.push(current.toISOString().split('T')[0]);
            current.setMonth(current.getMonth() + 1);
        }

        return dates;
    };

    // Generate mock forecast data
    const generateForecastData = (): ForecastData[] => {
        const dates = getDateRange(formData.dateFrom, formData.dateTo);
        const data: ForecastData[] = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        dates.forEach((date, index) => {
            const dateObj = new Date(date);
            const monthIndex = dateObj.getMonth();
            const seasonalFactor = 0.8 + 0.4 * Math.sin((monthIndex / 12) * 2 * Math.PI);
            const growthFactor = 1 + (index * 0.1);
            const randomVariation = 0.9 + Math.random() * 0.2;

            const baseQuantity = 1000;
            const predicted = Math.round(baseQuantity * seasonalFactor * growthFactor * randomVariation);
            const historical = Math.round(predicted * (0.85 + Math.random() * 0.3));
            const confidence = Math.round(85 + Math.random() * 10);

            data.push({
                month: months[monthIndex],
                date,
                predicted,
                historical,
                confidence,
                species: formData.species,
                location: `${formData.province}, ${formData.city}`
            });
        });

        return data;
    };

    // Generate mock batch data for details modal
    const generateBatchData = (level: 'province' | 'city' | 'barangay'): BatchData[] => {
        const batchCount = Math.floor(Math.random() * 8) + 5; // 5-12 batches
        const data: BatchData[] = [];

        const batchNames = [
            "Aqua Farm Alpha", "Blue Waters Beta", "Coastal Gamma", "Delta Fisheries",
            "Echo Marine", "Freshwater Phi", "Golden Harvest", "Harbor Industries",
            "Island Aqua", "Jade Waters", "Kelp Cultivation", "Lake Marina"
        ];

        const cities = locationData.cities[formData.province] || [];
        const barangays = locationData.barangays[formData.city] || [];

        for (let i = 0; i < batchCount; i++) {
            const batchId = `BTC-${String(i + 1).padStart(3, '0')}-${new Date().getFullYear()}`;
            const name = batchNames[Math.floor(Math.random() * batchNames.length)];
            const fingerlingsCount = Math.floor(Math.random() * 8000) + 2000; // 2000-10000
            const harvestForecasted = Math.floor(fingerlingsCount * (0.75 + Math.random() * 0.2)); // 75-95% survival rate

            const batchData: BatchData = {
                batchId,
                name,
                fingerlingsCount,
                harvestForecasted
            };

            if (level === 'province') {
                batchData.city = cities[Math.floor(Math.random() * cities.length)];
            } else if (level === 'city') {
                batchData.barangay = barangays[Math.floor(Math.random() * barangays.length)];
            }

            data.push(batchData);
        }

        return data.sort((a, b) => a.batchId.localeCompare(b.batchId));
    };

    // Handle view details modal
    const handleViewDetails = (level: 'province' | 'city' | 'barangay') => {
        const data = generateBatchData(level);
        setModalData(data);
        setModalLevel(level);
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setModalData([]);
    };

    // Generate trend data for specific geographic level
    const generateTrendDataForLevel = (level: 'province' | 'city' | 'barangay'): TrendData[] => {
        const dates = getDateRange(formData.dateFrom, formData.dateTo);
        const data: TrendData[] = [];

        // Different base multipliers for different levels
        const levelMultipliers = {
            province: 3.5, // Highest level, aggregated data
            city: 2.0,     // Mid level
            barangay: 1.0  // Specific location level
        };

        dates.forEach((date, index) => {
            const dateObj = new Date(date);
            const monthIndex = dateObj.getMonth();
            const seasonalFactor = 0.8 + 0.4 * Math.sin((monthIndex / 12) * 2 * Math.PI);
            const growthFactor = 1 + (index * 0.08);
            const randomVariation = 0.9 + Math.random() * 0.2;

            // Add some variation based on facility type
            const facilityFactor = formData.facilityType === "Fish Cage" ? 1.1 :
                formData.facilityType === "RAS (Recirculating Aquaculture System)" ? 1.3 :
                    formData.facilityType === "Pond System" ? 0.9 : 1.0;

            // Level-specific variation
            const levelFactor = levelMultipliers[level];
            const levelVariation = level === 'province' ? 0.95 + Math.random() * 0.1 :
                level === 'city' ? 0.9 + Math.random() * 0.2 :
                    0.85 + Math.random() * 0.3;

            const value = Math.round(1000 * seasonalFactor * growthFactor * facilityFactor * levelFactor * levelVariation);

            // Location string based on level
            const locationString = level === 'province' ? formData.province :
                level === 'city' ? `${formData.city}, ${formData.province}` :
                    `${formData.barangay}, ${formData.city}, ${formData.province}`;

            data.push({
                month: dateObj.toLocaleDateString('en-US', { month: 'short' }),
                date,
                value,
                species: formData.species,
                location: locationString
            });
        });

        return data;
    };

    // Handle forecast generation
    const handleGenerateForecast = async () => {
        setIsGenerating(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const forecastResults = generateForecastData();
        const provinceTrend = generateTrendDataForLevel('province');
        const cityTrend = generateTrendDataForLevel('city');
        const barangayTrend = generateTrendDataForLevel('barangay');

        setForecastData(forecastResults);
        setProvinceTrendData(provinceTrend);
        setCityTrendData(cityTrend);
        setBarangayTrendData(barangayTrend);
        setShowResults(true);
        setIsGenerating(false);
    };

    // Get available cities based on selected province
    const getAvailableCities = () => {
        return locationData.cities[formData.province] || [];
    };

    // Get available barangays based on selected city
    const getAvailableBarangays = () => {
        return locationData.barangays[formData.city] || [];
    };

    // Generate dynamic titles based on selected parameters
    const getParameterBasedTitle = () => {
        return `${formData.species} - ${formData.city}, ${formData.province} (${formData.facilityType})`;
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
                <div className="col-start-1 sm:col-start-1 md:col-start-1 lg:col-start-2 xl:col-start-2 col-span-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-5 pt-20 pb-8 sm:px-6 sm:py-8">

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forecasting</h1>
                            <p className="text-gray-600">Generate harvest forecasts and analyze trends across different species and locations</p>
                        </div>

                        {/* Forecasting Form Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        <h2 className="text-lg font-semibold text-gray-900">Forecasting Parameters</h2>
                                    </div>
                                    {/* <Settings className="h-5 w-5 text-gray-400" /> */}
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="h-4 w-4" />
                                            Date From:
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.dateFrom}
                                            onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="h-4 w-4" />
                                            Date To:
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.dateTo}
                                            onChange={(e) => handleInputChange('dateTo', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Species and Facility */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                                </div>

                                {/* Location Hierarchy */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <MapPin className="h-4 w-4" />
                                            Province:
                                        </label>
                                        <select
                                            value={formData.province}
                                            onChange={(e) => handleInputChange('province', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            {locationData.provinces.map(province => (
                                                <option key={province} value={province}>{province}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <MapPin className="h-4 w-4" />
                                            City/Municipality:
                                        </label>
                                        <select
                                            value={formData.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            {getAvailableCities().map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <MapPin className="h-4 w-4" />
                                            Barangay:
                                        </label>
                                        <select
                                            value={formData.barangay}
                                            onChange={(e) => handleInputChange('barangay', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            {getAvailableBarangays().length > 0 ? (
                                                getAvailableBarangays().map(barangay => (
                                                    <option key={barangay} value={barangay}>{barangay}</option>
                                                ))
                                            ) : (
                                                <option value="">Select a barangay</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleGenerateForecast}
                                        disabled={isGenerating}
                                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Generating Forecast...
                                            </>
                                        ) : (
                                            <>
                                                <TrendingUp className="h-4 w-4" />
                                                Generate Forecast
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Instructions */}
                                {!showResults && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                        <p className="text-blue-800 text-sm">
                                            Configure your forecasting parameters and click "Generate Forecast" to view predictions and trend analysis
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Results Section */}
                        {showResults && (
                            <>
                                {/* Summary Statistics */}
                                {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-5">
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
                                                {forecastData.length}
                                            </div>
                                            <div className="text-sm text-orange-800">Months Forecasted</div>
                                        </div>
                                    </div>
                                </div> */}

                                {/* Forecast Charts */}
                                {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Harvest Forecast</h3>
                                        <p className="text-sm text-gray-600 mb-4">{getParameterBasedTitle()}</p>
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

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Prediction Confidence</h3>
                                        <p className="text-sm text-gray-600 mb-4">{getParameterBasedTitle()}</p>
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
                                </div> */}

                                {/* Trend Analysis Section - Three Separate Charts */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                        <h3 className="text-xl font-semibold text-gray-900">Geographic Trend Analysis</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-6">Compare harvest trends across different geographic levels for {formData.species}</p>

                                    {/* Province Level Trend */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-lg font-semibold text-gray-900">Province Level Trend</h4>
                                                <button
                                                    onClick={() => handleViewDetails('province')}
                                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                    View Details
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">{formData.province} - Aggregated Provincial Data</p>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={provinceTrendData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <Tooltip
                                                            formatter={(value) => [
                                                                value?.toLocaleString(),
                                                                'Harvest Volume (kg)'
                                                            ]}
                                                            labelFormatter={(label) => `Month: ${label}`}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="#8B5CF6"
                                                            fill="#8B5CF6"
                                                            fillOpacity={0.3}
                                                            strokeWidth={2}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    {/* City Level Trend */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-lg font-semibold text-gray-900">City/Municipality Level Trend</h4>
                                                <button
                                                    onClick={() => handleViewDetails('city')}
                                                    className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors text-sm flex items-center gap-2"
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                    View Details
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">{formData.city}, {formData.province} - City-Level Data</p>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={cityTrendData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <Tooltip
                                                            formatter={(value) => [
                                                                value?.toLocaleString(),
                                                                'Harvest Volume (kg)'
                                                            ]}
                                                            labelFormatter={(label) => `Month: ${label}`}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="#06B6D4"
                                                            fill="#06B6D4"
                                                            fillOpacity={0.3}
                                                            strokeWidth={2}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Barangay Level Trend */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-lg font-semibold text-gray-900">Barangay Level Trend</h4>
                                                <button
                                                    onClick={() => handleViewDetails('barangay')}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                    View Details
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">{formData.barangay}, {formData.city}, {formData.province} - Barangay-Specific Data</p>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={barangayTrendData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <Tooltip
                                                            formatter={(value) => [
                                                                value?.toLocaleString(),
                                                                'Harvest Volume (kg)'
                                                            ]}
                                                            labelFormatter={(label) => `Month: ${label}`}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="#10B981"
                                                            fill="#10B981"
                                                            fillOpacity={0.3}
                                                            strokeWidth={2}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {modalLevel === 'province' ? 'Province Level Details' :
                                        modalLevel === 'city' ? 'City Level Details' :
                                            'Barangay Level Details'}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {modalLevel === 'province' ? `${formData.province} - All Cities` :
                                        modalLevel === 'city' ? `${formData.city}, ${formData.province} - All Barangays` :
                                            `${formData.barangay}, ${formData.city}, ${formData.province}`}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {modalData.length}
                                    </div>
                                    <div className="text-sm text-blue-800">Total Batches</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-600">
                                        {modalData.reduce((sum, batch) => sum + batch.fingerlingsCount, 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-green-800">Total Fingerlings</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {modalData.reduce((sum, batch) => sum + batch.harvestForecasted, 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-purple-800">Forecasted Harvest</div>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Batch ID</th>
                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                                            {modalLevel === 'province' && (
                                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">City</th>
                                            )}
                                            {modalLevel === 'city' && (
                                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Barangay</th>
                                            )}
                                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">Fingerlings Count</th>
                                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">Harvest Forecasted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modalData.map((batch, index) => (
                                            <tr key={batch.batchId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                <td className="border border-gray-300 px-4 py-3 font-mono text-sm">{batch.batchId}</td>
                                                <td className="border border-gray-300 px-4 py-3">{batch.name}</td>
                                                {modalLevel === 'province' && batch.city && (
                                                    <td className="border border-gray-300 px-4 py-3">{batch.city}</td>
                                                )}
                                                {modalLevel === 'city' && batch.barangay && (
                                                    <td className="border border-gray-300 px-4 py-3">{batch.barangay}</td>
                                                )}
                                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                    {batch.fingerlingsCount.toLocaleString()}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                    {batch.harvestForecasted.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    const csv = [
                                        ['Batch ID', 'Name', modalLevel === 'province' ? 'City' : modalLevel === 'city' ? 'Barangay' : '', 'Fingerlings Count', 'Harvest Forecasted'].filter(Boolean),
                                        ...modalData.map(batch => [
                                            batch.batchId,
                                            batch.name,
                                            modalLevel === 'province' ? batch.city : modalLevel === 'city' ? batch.barangay : '',
                                            batch.fingerlingsCount,
                                            batch.harvestForecasted
                                        ].filter((_, i) => modalLevel === 'barangay' ? i !== 2 : true))
                                    ].map(row => row.join(',')).join('\n');

                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${modalLevel}_batch_details.csv`;
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            )}
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