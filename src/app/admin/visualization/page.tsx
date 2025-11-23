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

interface HarvestData {
    location: string;
    tilapia: number;
    bangus: number;
    date: string;
    facilityType: string;
    province: string;
    city: string;
    barangay: string;
    survivalRate: number;
    avgWeight: number;
}

interface HarvestState {
    dateFrom: string;
    dateTo: string;
    selectedProvince: string;
    selectedCity: string;
    selectedBarangay: string;
    selectedFacilityType: string;
    data: HarvestData[];
    isLoading: boolean;
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
    forecastedHarvestKilos: number;
    actualHarvestKilos: number;
    facilityType: 'fish_cage' | 'pond';
    distributionDate: string;
    province: string;
    city: string;
    barangay: string;
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

// Davao Region locations data (including Caraga Region provinces)
const locationData: LocationData = {
    provinces: ["Davao del Sur", "Davao del Norte", "Davao de Oro", "Davao Oriental", "Davao Occidental", "Agusan del Sur", "Surigao del Sur", "Bukidnon", "Compostela Valley", "Cotabato"],
    cities: {
        "Davao del Norte": ["Tagum City", "Panabo City", "Samal City", "Asuncion", "Braulio E. Dujali", "Carmen", "Kapalong", "New Corella", "San Isidro", "Santo Tomas", "Talaingod"],
        "Davao del Sur": ["Davao City", "Digos City", "Bansalan", "Hagonoy", "Kiblawan", "Magsaysay", "Malalag", "Matanao", "Padada", "Santa Cruz", "Sulop"],
        "Davao de Oro": ["Nabunturan", "Compostela", "Laak", "Mabini", "Maco", "Maragusan", "Mawab", "Monkayo", "Montevista", "New Bataan", "Pantukan"],
        "Davao Oriental": ["Mati City", "Baganga", "Banaybanay", "Boston", "Caraga", "Cateel", "Governor Generoso", "Lupon", "Manay", "San Isidro", "Tarragona"],
        "Davao Occidental": ["Malita", "Don Marcelino", "Jose Abad Santos", "Santa Maria"],
        "Agusan del Sur": ["Bayugan City", "Bunawan", "Esperanza", "La Paz", "Loreto", "Prosperidad", "Rosario", "San Francisco", "San Luis", "Santa Josefa", "Sibagat", "Talacogon", "Trento", "Veruela"],
        "Surigao del Sur": ["Bislig City", "Tandag City", "Barobo", "Bayabas", "Cagwait", "Cantilan", "Carmen", "Carrascal", "Cortes", "Hinatuan", "Lanuza", "Lianga", "Lingig", "Madrid", "Marihatag", "San Agustin", "San Miguel", "Tagbina", "Tago"],
        "Bukidnon": ["Malaybalay City", "Valencia City", "Baungon", "Cabanglasan", "Damulog", "Dangcagan", "Don Carlos", "Impasugong", "Kadingilan", "Kalilangan", "Kibawe", "Kitaotao", "Lantapan", "Libona", "Malitbog", "Manolo Fortich", "Maramag", "Pangantucan", "Quezon", "San Fernando", "Sumilao"],
        "Compostela Valley": ["Nabunturan", "Mabini", "Montevista", "New Bataan", "Pantukan", "Laak", "Maco", "Maragusan", "Mawab", "Monkayo", "Compostela"],
        "Cotabato": ["Kidapawan", "North Cotabato", "M'lang", "Makilala", "Magpet", "President Roxas", "Tulunan", "Antipas", "Arakan", "Banisilan", "Carmen", "Kabacan", "Libungan", "Matalam", "Pigcawayan", "Pikit", "Aleosan", "Carmen", "Kabacan"]
    },
    barangays: {
        "Tagum City": ["Apokon", "Bincungan", "La Filipina", "Magugpo East", "Magugpo North", "Magugpo Poblacion", "Magugpo South", "Mankilam", "Nueva Fuerza", "Pagsabangan", "San Agustin", "San Miguel", "Visayan Village", "Brgy. Busaon", "Brgy. Liboganon"],
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
        "Don Marcelino": ["Balasinon", "Dulian", "Kinanga", "New Katipunan", "Poblacion", "San Miguel", "Santa Rosa"],
        "Kidapawan": ["Brgy. Amas"],
        "North Cotabato": ["Brgy. Balogo"]
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

    const [activeTab, setActiveTab] = useState<'fingerlings' | 'leaderboard' | 'harvest'>('fingerlings');

    const [fingerlingsState, setFingerlingsState] = useState<FingerlingsState>({
        dateFrom: '2023-01-01',
        dateTo: '2025-12-31',
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

    const [harvestState, setHarvestState] = useState<HarvestState>({
        dateFrom: '2023-01-01',
        dateTo: '2025-12-31',
        selectedProvince: 'all',
        selectedCity: 'all',
        selectedBarangay: 'all',
        selectedFacilityType: 'all',
        data: [],
        isLoading: false
    });
    console.log("🚀 ~ DataVisualization ~ harvestState:", harvestState)

    // Fetch real harvest data from distribution API
    const fetchHarvestData = async (state: HarvestState): Promise<HarvestData[]> => {
        try {
            // Build query parameters - send all filters to API
            const params = new URLSearchParams();

            // Date filters
            if (state.dateFrom) {
                params.append('startDate', state.dateFrom);
            }
            if (state.dateTo) {
                params.append('endDate', state.dateTo);
            }

            // Location filters - send to API
            if (state.selectedProvince !== 'all') {
                params.append('province', state.selectedProvince);
            }
            if (state.selectedCity !== 'all' && state.selectedCity !== 'All Cities') {
                params.append('municipality', state.selectedCity);
            }
            if (state.selectedBarangay !== 'all' && state.selectedBarangay !== 'All Barangays') {
                params.append('barangay', state.selectedBarangay);
            }

            // Get more records for aggregation
            params.append('limit', '1000');

            const response = await fetch(`/api/distributions-data?${params.toString()}`);
            const result = await response.json();

            if (result.success && result.data.distributions) {
                const distributions = result.data.distributions;

                // Filter distributions with actualHarvestKilos > 0
                const harvestedDistributions = distributions.filter((dist: any) => {
                    const harvestKg = parseFloat(dist.actualHarvestKilos) || 0;
                    return harvestKg > 0;
                });

                console.log('Harvested distributions count:', harvestedDistributions.length);

                if (harvestedDistributions.length === 0) {
                    return [];
                }

                // Determine grouping level based on filters
                let groupingKey: 'province' | 'municipality' | 'barangay' | 'beneficiary';

                if (state.selectedBarangay !== 'all' && state.selectedBarangay !== 'All Barangays') {
                    // If specific barangay is selected, group by beneficiary
                    groupingKey = 'beneficiary';
                } else if (state.selectedCity !== 'all' && state.selectedCity !== 'All Cities') {
                    // If city is selected, group by barangay within that city
                    groupingKey = 'barangay';
                } else if (state.selectedProvince !== 'all') {
                    // If province is selected, group by municipality
                    groupingKey = 'municipality';
                } else {
                    // If "All Provinces" is selected, group by province
                    groupingKey = 'province';
                }

                const dataMap = new Map<string, {
                    tilapia: number;
                    bangus: number;
                    province: string;
                    municipality: string;
                    barangay: string;
                    count: number;
                    displayKey: string;
                }>();

                harvestedDistributions.forEach((dist: any) => {
                    // Use appropriate key based on grouping level
                    let key: string;
                    let normalizedKey: string;

                    if (groupingKey === 'beneficiary') {
                        // Group by beneficiary name when barangay is selected
                        key = dist.beneficiaryName || 'Unknown Beneficiary';
                        normalizedKey = key.toLowerCase().trim();
                    } else if (groupingKey === 'barangay') {
                        key = dist.barangay || dist.municipality || dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    } else if (groupingKey === 'municipality') {
                        key = dist.municipality || dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    } else {
                        key = dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    }

                    // Use normalized key for lookup but store original key for display
                    if (!dataMap.has(normalizedKey)) {
                        dataMap.set(normalizedKey, {
                            tilapia: 0,
                            bangus: 0,
                            province: dist.province || 'Unknown',
                            municipality: dist.municipality || 'Unknown',
                            barangay: dist.barangay || 'Various',
                            count: 0,
                            displayKey: key
                        });
                    }

                    const entry = dataMap.get(normalizedKey)!;
                    const harvestKg = parseFloat(dist.actualHarvestKilos) || 0;

                    // Case-insensitive species check
                    const speciesLower = (dist.species || '').toLowerCase();
                    if (speciesLower === 'tilapia' || speciesLower === 'red tilapia') {
                        entry.tilapia += harvestKg;
                    } else if (speciesLower === 'bangus') {
                        entry.bangus += harvestKg;
                    }

                    entry.count += 1;
                });

                // Convert to chart data format and filter out "Unknown" locations
                const chartData: HarvestData[] = Array.from(dataMap.entries())
                    .filter(([normalizedKey]) => !normalizedKey.includes('unknown'))
                    .map(([normalizedKey, value]) => ({
                        location: value.displayKey,
                        tilapia: Math.round(value.tilapia * 100) / 100,
                        bangus: Math.round(value.bangus * 100) / 100,
                        date: state.dateTo,
                        facilityType: state.selectedFacilityType === 'all_facilities' ? 'All Facilities' : state.selectedFacilityType.replace(/_/g, ' '),
                        province: value.province,
                        city: value.municipality,
                        barangay: value.barangay,
                        survivalRate: 0,
                        avgWeight: 0
                    }));

                // Sort by total harvest (descending)
                chartData.sort((a, b) => (b.tilapia + b.bangus) - (a.tilapia + a.bangus));

                // Debug log
                console.log('Harvest Data - groupingKey:', groupingKey);
                console.log('Harvest Data - chartData:', chartData);

                return chartData.slice(0, 12);
            }

            return [];
        } catch (error) {
            console.error('Error fetching harvest data:', error);
            return [];
        }
    };

    // Handle harvest comparison - Fetch real data from API
    const handleHarvestCompare = async () => {
        setHarvestState(prev => ({ ...prev, isLoading: true }));

        try {
            // Get current state to pass to fetchHarvestData
            const currentState = harvestState;
            const newData = await fetchHarvestData(currentState);
            setHarvestState(prev => ({
                ...prev,
                data: newData,
                isLoading: false
            }));
        } catch (error) {
            console.error('Error in handleHarvestCompare:', error);
            setHarvestState(prev => ({
                ...prev,
                data: [],
                isLoading: false
            }));
        }
    };

    // Handle province change in harvest section
    const handleHarvestProvinceChange = async (province: string) => {
        const newState = {
            ...harvestState,
            selectedProvince: province,
            selectedCity: 'all',
            selectedBarangay: 'all'
        };
        setHarvestState(prev => ({
            ...prev,
            selectedProvince: province,
            selectedCity: 'all',
            selectedBarangay: 'all',
            isLoading: true
        }));

        // Automatically fetch data with new province filter
        const newData = await fetchHarvestData(newState);
        setHarvestState(prev => ({
            ...prev,
            data: newData,
            isLoading: false
        }));
    };

    // Handle city change in harvest section
    const handleHarvestCityChange = async (city: string) => {
        const newState = {
            ...harvestState,
            selectedCity: city,
            selectedBarangay: 'all'
        };
        setHarvestState(prev => ({
            ...prev,
            selectedCity: city,
            selectedBarangay: 'all',
            isLoading: true
        }));

        // Automatically fetch data with new city filter
        const newData = await fetchHarvestData(newState);
        setHarvestState(prev => ({
            ...prev,
            data: newData,
            isLoading: false
        }));
    };

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

    // Fetch real beneficiary data from distribution API
    const fetchBeneficiaryData = async (): Promise<BeneficiaryData[]> => {
        try {
            // Build query parameters
            const params = new URLSearchParams();

            // Add species filter if not 'all'
            if (leaderboardState.selectedSpecies !== 'all') {
                params.append('species', leaderboardState.selectedSpecies === 'tilapia' ? 'Tilapia' : 'Bangus');
            }

            // Fetch a large limit to get all records for leaderboard
            params.append('limit', '1000');

            const response = await fetch(`/api/distributions-data?${params.toString()}`);
            const result = await response.json();

            if (result.success && result.data.distributions) {
                const distributions = result.data.distributions;

                // Group by beneficiary name to aggregate their total harvest
                const beneficiaryMap = new Map<string, {
                    totalActualHarvest: number;
                    totalForecastedHarvest: number;
                    totalFingerlings: number;
                    species: string;
                    location: string;
                    province: string;
                    barangay: string;
                    latestDate: string;
                    recordIds: number[];
                }>();

                distributions.forEach((dist: any) => {
                    const name = dist.beneficiaryName || 'Unknown';
                    const actualHarvestKg = parseFloat(dist.actualHarvestKilos) || 0;
                    const forecastedHarvestKg = parseFloat(dist.forecastedHarvestKilos) || 0;
                    const fingerlings = parseInt(dist.fingerlings) || 0;

                    if (!beneficiaryMap.has(name)) {
                        beneficiaryMap.set(name, {
                            totalActualHarvest: 0,
                            totalForecastedHarvest: 0,
                            totalFingerlings: 0,
                            species: dist.species || 'Tilapia',
                            location: dist.municipality || 'Unknown',
                            province: dist.province || 'Unknown',
                            barangay: dist.barangay || 'Unknown',
                            latestDate: dist.dateDistributed || new Date().toISOString(),
                            recordIds: []
                        });
                    }

                    const entry = beneficiaryMap.get(name)!;
                    entry.totalActualHarvest += actualHarvestKg;
                    entry.totalForecastedHarvest += forecastedHarvestKg;
                    entry.totalFingerlings += fingerlings;
                    entry.recordIds.push(dist.id);

                    // Keep the latest date
                    if (new Date(dist.dateDistributed) > new Date(entry.latestDate)) {
                        entry.latestDate = dist.dateDistributed;
                        entry.location = dist.municipality || entry.location;
                        entry.province = dist.province || entry.province;
                        entry.barangay = dist.barangay || entry.barangay;
                    }
                });

                // Transform aggregated data to BeneficiaryData format
                const beneficiaryData: BeneficiaryData[] = Array.from(beneficiaryMap.entries()).map(([name, data]) => ({
                    id: data.recordIds.join('-'),
                    name: name,
                    location: data.location,
                    species: (data.species?.toLowerCase() || 'tilapia') as 'tilapia' | 'bangus',
                    fingerlingsReceived: data.totalFingerlings,
                    forecastedHarvestKilos: Math.round(data.totalForecastedHarvest * 100) / 100,
                    actualHarvestKilos: Math.round(data.totalActualHarvest * 100) / 100,
                    facilityType: 'pond' as 'fish_cage' | 'pond',
                    distributionDate: new Date(data.latestDate).toISOString().split('T')[0],
                    province: data.province,
                    city: data.location,
                    barangay: data.barangay
                }));

                return beneficiaryData;
            }

            return [];
        } catch (error) {
            console.error('Error fetching beneficiary data:', error);
            return [];
        }
    };

    // Handle fingerlings comparison - Fetch real data from API with all filters
    const handleFingerlingsCompare = async () => {
        setFingerlingsState(prev => ({ ...prev, isLoading: true }));

        try {
            // Build query parameters for detailed data
            const detailParams = new URLSearchParams();

            if (fingerlingsState.dateFrom) {
                detailParams.append('startDate', fingerlingsState.dateFrom);
            }
            if (fingerlingsState.dateTo) {
                detailParams.append('endDate', fingerlingsState.dateTo);
            }
            if (fingerlingsState.selectedProvince !== 'all') {
                detailParams.append('province', fingerlingsState.selectedProvince);
            }
            if (fingerlingsState.selectedCity !== 'all' && fingerlingsState.selectedCity !== 'All Cities') {
                detailParams.append('municipality', fingerlingsState.selectedCity);
            }
            if (fingerlingsState.selectedBarangay !== 'all' && fingerlingsState.selectedBarangay !== 'All Barangays') {
                detailParams.append('barangay', fingerlingsState.selectedBarangay);
            }
            detailParams.append('limit', '1000'); // Get more records for aggregation

            // Fetch detailed distribution data
            const detailResponse = await fetch(`/api/distributions-data?${detailParams.toString()}`);
            const detailResult = await detailResponse.json();

            if (detailResult.success && detailResult.data.distributions) {
                const distributions = detailResult.data.distributions;

                // No need for client-side filtering since API already filtered by barangay
                const filteredDistributions = distributions;

                // Determine grouping level based on filters
                let groupingKey: 'province' | 'municipality' | 'barangay' | 'beneficiary';

                if (fingerlingsState.selectedBarangay !== 'all' && fingerlingsState.selectedBarangay !== 'All Barangays') {
                    // If specific barangay is selected, group by beneficiary
                    groupingKey = 'beneficiary';
                } else if (fingerlingsState.selectedCity !== 'all' && fingerlingsState.selectedCity !== 'All Cities') {
                    // If city is selected, group by barangay within that city
                    groupingKey = 'barangay';
                } else if (fingerlingsState.selectedProvince !== 'all') {
                    // If province is selected, group by municipality
                    groupingKey = 'municipality';
                } else {
                    // If "All Provinces" is selected, group by province
                    groupingKey = 'province';
                }

                // Group data based on the determined grouping level
                const dataMap = new Map<string, {
                    tilapia: number;
                    bangus: number;
                    province: string;
                    municipality: string;
                    barangay: string;
                    displayKey: string;
                }>();

                filteredDistributions.forEach((dist: any) => {
                    // Use appropriate key based on grouping level
                    let key: string;
                    let normalizedKey: string;

                    if (groupingKey === 'beneficiary') {
                        // Group by beneficiary name when barangay is selected
                        key = dist.beneficiaryName || 'Unknown Beneficiary';
                        normalizedKey = key.toLowerCase().trim();
                    } else if (groupingKey === 'barangay') {
                        key = dist.barangay || dist.municipality || dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    } else if (groupingKey === 'municipality') {
                        key = dist.municipality || dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    } else {
                        // Group by province
                        key = dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    }

                    // Use normalized key for lookup but store original key for display
                    if (!dataMap.has(normalizedKey)) {
                        dataMap.set(normalizedKey, {
                            tilapia: 0,
                            bangus: 0,
                            province: dist.province,
                            municipality: dist.municipality || 'Various',
                            barangay: dist.barangay || 'Various',
                            displayKey: key
                        });
                    }

                    const entry = dataMap.get(normalizedKey)!;
                    if (dist.species === 'Tilapia') {
                        entry.tilapia += dist.fingerlings || 0;
                    } else if (dist.species === 'Bangus') {
                        entry.bangus += dist.fingerlings || 0;
                    }
                });

                // Convert to chart data format and filter out "Unknown" locations
                const chartData: FingerlingsData[] = Array.from(dataMap.entries())
                    .filter(([normalizedKey]) => !normalizedKey.includes('unknown'))
                    .map(([, value]) => ({
                        location: value.displayKey,
                        tilapia: value.tilapia,
                        bangus: value.bangus,
                        date: fingerlingsState.dateTo,
                        facilityType: fingerlingsState.selectedFacilityType === 'all_facilities' ? 'All Facilities' : fingerlingsState.selectedFacilityType.replace(/_/g, ' '),
                        province: value.province,
                        city: value.municipality,
                        barangay: value.barangay
                    }));

                // Sort by total fingerlings (descending) and take top 12
                chartData.sort((a, b) => (b.tilapia + b.bangus) - (a.tilapia + a.bangus));
                const topData = chartData.slice(0, 12);

                setFingerlingsState(prev => ({
                    ...prev,
                    data: topData,
                    isLoading: false
                }));
            } else {
                // No data from API
                setFingerlingsState(prev => ({
                    ...prev,
                    data: [],
                    isLoading: false
                }));
            }
        } catch (error) {
            console.error('Error fetching fingerlings data:', error);
            // Return empty data on error
            setFingerlingsState(prev => ({
                ...prev,
                data: [],
                isLoading: false
            }));
        }
    };

    // Handle leaderboard refresh
    const handleLeaderboardRefresh = async () => {
        setLeaderboardState(prev => ({ ...prev, isLoading: true }));
        const newData = await fetchBeneficiaryData();
        setLeaderboardState(prev => ({
            ...prev,
            data: newData,
            isLoading: false
        }));
    };

    // Handle province change in fingerlings section
    const handleProvinceChange = async (province: string) => {
        const newState = {
            ...fingerlingsState,
            selectedProvince: province,
            selectedCity: 'all',
            selectedBarangay: 'all'
        };

        setFingerlingsState(prev => ({
            ...prev,
            selectedProvince: province,
            selectedCity: 'all',
            selectedBarangay: 'all',
            isLoading: true
        }));

        // Fetch data with the new state directly
        try {
            const detailParams = new URLSearchParams();

            if (newState.dateFrom) {
                detailParams.append('startDate', newState.dateFrom);
            }
            if (newState.dateTo) {
                detailParams.append('endDate', newState.dateTo);
            }
            if (newState.selectedProvince !== 'all') {
                detailParams.append('province', newState.selectedProvince);
            }
            if (newState.selectedCity !== 'all' && newState.selectedCity !== 'All Cities') {
                detailParams.append('municipality', newState.selectedCity);
            }
            if (newState.selectedBarangay !== 'all' && newState.selectedBarangay !== 'All Barangays') {
                detailParams.append('barangay', newState.selectedBarangay);
            }
            detailParams.append('limit', '1000');

            const detailResponse = await fetch(`/api/distributions-data?${detailParams.toString()}`);
            const detailResult = await detailResponse.json();

            if (detailResult.success && detailResult.data.distributions) {
                const distributions = detailResult.data.distributions;
                const filteredDistributions = distributions;

                let groupingKey: 'province' | 'municipality' | 'barangay' | 'beneficiary';

                if (newState.selectedBarangay !== 'all' && newState.selectedBarangay !== 'All Barangays') {
                    groupingKey = 'beneficiary';
                } else if (newState.selectedCity !== 'all' && newState.selectedCity !== 'All Cities') {
                    groupingKey = 'barangay';
                } else if (newState.selectedProvince !== 'all') {
                    groupingKey = 'municipality';
                } else {
                    groupingKey = 'province';
                }

                const dataMap = new Map<string, {
                    tilapia: number;
                    bangus: number;
                    province: string;
                    municipality: string;
                    barangay: string;
                    displayKey: string;
                }>();

                filteredDistributions.forEach((dist: any) => {
                    let key: string;
                    let normalizedKey: string;

                    if (groupingKey === 'beneficiary') {
                        key = dist.beneficiaryName || 'Unknown Beneficiary';
                        normalizedKey = key.toLowerCase().trim();
                    } else if (groupingKey === 'barangay') {
                        key = dist.barangay || dist.municipality || dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    } else if (groupingKey === 'municipality') {
                        key = dist.municipality || dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    } else {
                        key = dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    }

                    if (!dataMap.has(normalizedKey)) {
                        dataMap.set(normalizedKey, {
                            tilapia: 0,
                            bangus: 0,
                            province: dist.province,
                            municipality: dist.municipality || 'Various',
                            barangay: dist.barangay || 'Various',
                            displayKey: key
                        });
                    }

                    const entry = dataMap.get(normalizedKey)!;
                    if (dist.species === 'Tilapia') {
                        entry.tilapia += dist.fingerlings || 0;
                    } else if (dist.species === 'Bangus') {
                        entry.bangus += dist.fingerlings || 0;
                    }
                });

                const chartData: FingerlingsData[] = Array.from(dataMap.entries())
                    .filter(([normalizedKey]) => !normalizedKey.includes('unknown'))
                    .map(([normalizedKey, value]) => ({
                        location: value.displayKey,
                        tilapia: value.tilapia,
                        bangus: value.bangus,
                        date: newState.dateTo,
                        facilityType: newState.selectedFacilityType === 'all_facilities' ? 'All Facilities' : newState.selectedFacilityType.replace(/_/g, ' '),
                        province: value.province,
                        city: value.municipality,
                        barangay: value.barangay
                    }));

                chartData.sort((a, b) => (b.tilapia + b.bangus) - (a.tilapia + a.bangus));
                const topData = chartData.slice(0, 12);

                setFingerlingsState(prev => ({
                    ...prev,
                    data: topData,
                    isLoading: false
                }));
            } else {
                setFingerlingsState(prev => ({
                    ...prev,
                    data: [],
                    isLoading: false
                }));
            }
        } catch (error) {
            console.error('Error fetching fingerlings data:', error);
            setFingerlingsState(prev => ({
                ...prev,
                data: [],
                isLoading: false
            }));
        }
    };

    // Handle city change in fingerlings section
    const handleCityChange = async (city: string) => {
        const newState = {
            ...fingerlingsState,
            selectedCity: city,
            selectedBarangay: 'all'
        };

        setFingerlingsState(prev => ({
            ...prev,
            selectedCity: city,
            selectedBarangay: 'all',
            isLoading: true
        }));

        // Fetch data with the new state directly
        try {
            const detailParams = new URLSearchParams();

            if (newState.dateFrom) {
                detailParams.append('startDate', newState.dateFrom);
            }
            if (newState.dateTo) {
                detailParams.append('endDate', newState.dateTo);
            }
            if (newState.selectedProvince !== 'all') {
                detailParams.append('province', newState.selectedProvince);
            }
            if (newState.selectedCity !== 'all' && newState.selectedCity !== 'All Cities') {
                detailParams.append('municipality', newState.selectedCity);
            }
            if (newState.selectedBarangay !== 'all' && newState.selectedBarangay !== 'All Barangays') {
                detailParams.append('barangay', newState.selectedBarangay);
            }
            detailParams.append('limit', '1000');

            const detailResponse = await fetch(`/api/distributions-data?${detailParams.toString()}`);
            const detailResult = await detailResponse.json();

            if (detailResult.success && detailResult.data.distributions) {
                const distributions = detailResult.data.distributions;
                const filteredDistributions = distributions;

                let groupingKey: 'province' | 'municipality' | 'barangay' | 'beneficiary';

                if (newState.selectedBarangay !== 'all' && newState.selectedBarangay !== 'All Barangays') {
                    groupingKey = 'beneficiary';
                } else if (newState.selectedCity !== 'all' && newState.selectedCity !== 'All Cities') {
                    groupingKey = 'barangay';
                } else if (newState.selectedProvince !== 'all') {
                    groupingKey = 'municipality';
                } else {
                    groupingKey = 'province';
                }

                const dataMap = new Map<string, {
                    tilapia: number;
                    bangus: number;
                    province: string;
                    municipality: string;
                    barangay: string;
                    displayKey: string;
                }>();

                filteredDistributions.forEach((dist: any) => {
                    let key: string;
                    let normalizedKey: string;

                    if (groupingKey === 'beneficiary') {
                        key = dist.beneficiaryName || 'Unknown Beneficiary';
                        normalizedKey = key.toLowerCase().trim();
                    } else if (groupingKey === 'barangay') {
                        key = dist.barangay || dist.municipality || dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    } else if (groupingKey === 'municipality') {
                        key = dist.municipality || dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    } else {
                        key = dist.province;
                        normalizedKey = key.toLowerCase().trim();
                    }

                    if (!dataMap.has(normalizedKey)) {
                        dataMap.set(normalizedKey, {
                            tilapia: 0,
                            bangus: 0,
                            province: dist.province,
                            municipality: dist.municipality || 'Various',
                            barangay: dist.barangay || 'Various',
                            displayKey: key
                        });
                    }

                    const entry = dataMap.get(normalizedKey)!;
                    if (dist.species === 'Tilapia') {
                        entry.tilapia += dist.fingerlings || 0;
                    } else if (dist.species === 'Bangus') {
                        entry.bangus += dist.fingerlings || 0;
                    }
                });

                const chartData: FingerlingsData[] = Array.from(dataMap.entries())
                    .filter(([normalizedKey]) => !normalizedKey.includes('unknown'))
                    .map(([normalizedKey, value]) => ({
                        location: value.displayKey,
                        tilapia: value.tilapia,
                        bangus: value.bangus,
                        date: newState.dateTo,
                        facilityType: newState.selectedFacilityType === 'all_facilities' ? 'All Facilities' : newState.selectedFacilityType.replace(/_/g, ' '),
                        province: value.province,
                        city: value.municipality,
                        barangay: value.barangay
                    }));

                chartData.sort((a, b) => (b.tilapia + b.bangus) - (a.tilapia + a.bangus));
                const topData = chartData.slice(0, 12);

                setFingerlingsState(prev => ({
                    ...prev,
                    data: topData,
                    isLoading: false
                }));
            } else {
                setFingerlingsState(prev => ({
                    ...prev,
                    data: [],
                    isLoading: false
                }));
            }
        } catch (error) {
            console.error('Error fetching fingerlings data:', error);
            setFingerlingsState(prev => ({
                ...prev,
                data: [],
                isLoading: false
            }));
        }
    };

    // Initialize data
    useEffect(() => {
        handleFingerlingsCompare();
        handleLeaderboardRefresh();
        handleHarvestCompare();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter leaderboard data
    const filteredLeaderboardData = leaderboardState.data
        .filter(item =>
            (leaderboardState.selectedSpecies === 'all' || item.species === leaderboardState.selectedSpecies) &&
            (leaderboardState.selectedFacilityType === 'all' || item.facilityType === leaderboardState.selectedFacilityType)
        )
        .sort((a, b) => b.actualHarvestKilos - a.actualHarvestKilos)
        .slice(0, 10);
    console.log("🚀 ~ DataVisualization ~ filteredLeaderboardData:", filteredLeaderboardData)

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
                                    <h1 className="text-2xl font-bold text-gray-900">Data Visualization</h1>
                                </div>
                                <p className="text-gray-600">Comparative tools and fingerling distribution analysis for Davao Region</p>
                            </div>
                        </div>
                        {/* Tab Navigation */}
                        <div className="mb-6">
                            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
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
                                    onClick={() => setActiveTab('harvest')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'harvest'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <TrendingUp className="h-4 w-4" />
                                    Actual Harvest
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
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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
                                                onChange={async (e) => {
                                                    const barangay = e.target.value;
                                                    const newState = {
                                                        ...fingerlingsState,
                                                        selectedBarangay: barangay
                                                    };

                                                    setFingerlingsState(prev => ({
                                                        ...prev,
                                                        selectedBarangay: barangay,
                                                        isLoading: true
                                                    }));

                                                    // Fetch data with the new state directly
                                                    try {
                                                        const detailParams = new URLSearchParams();

                                                        if (newState.dateFrom) {
                                                            detailParams.append('startDate', newState.dateFrom);
                                                        }
                                                        if (newState.dateTo) {
                                                            detailParams.append('endDate', newState.dateTo);
                                                        }
                                                        if (newState.selectedProvince !== 'all') {
                                                            detailParams.append('province', newState.selectedProvince);
                                                        }
                                                        if (newState.selectedCity !== 'all' && newState.selectedCity !== 'All Cities') {
                                                            detailParams.append('municipality', newState.selectedCity);
                                                        }
                                                        if (newState.selectedBarangay !== 'all' && newState.selectedBarangay !== 'All Barangays') {
                                                            detailParams.append('barangay', newState.selectedBarangay);
                                                        }
                                                        detailParams.append('limit', '1000');

                                                        const detailResponse = await fetch(`/api/distributions-data?${detailParams.toString()}`);
                                                        const detailResult = await detailResponse.json();

                                                        if (detailResult.success && detailResult.data.distributions) {
                                                            const distributions = detailResult.data.distributions;
                                                            const filteredDistributions = distributions;

                                                            let groupingKey: 'province' | 'municipality' | 'barangay' | 'beneficiary';

                                                            if (newState.selectedBarangay !== 'all' && newState.selectedBarangay !== 'All Barangays') {
                                                                groupingKey = 'beneficiary';
                                                            } else if (newState.selectedCity !== 'all' && newState.selectedCity !== 'All Cities') {
                                                                groupingKey = 'barangay';
                                                            } else if (newState.selectedProvince !== 'all') {
                                                                groupingKey = 'municipality';
                                                            } else {
                                                                groupingKey = 'province';
                                                            }

                                                            const dataMap = new Map<string, {
                                                                tilapia: number;
                                                                bangus: number;
                                                                province: string;
                                                                municipality: string;
                                                                barangay: string;
                                                                displayKey: string;
                                                            }>();

                                                            filteredDistributions.forEach((dist: any) => {
                                                                let key: string;
                                                                let normalizedKey: string;

                                                                if (groupingKey === 'beneficiary') {
                                                                    key = dist.beneficiaryName || 'Unknown Beneficiary';
                                                                    normalizedKey = key.toLowerCase().trim();
                                                                } else if (groupingKey === 'barangay') {
                                                                    key = dist.barangay || dist.municipality || dist.province;
                                                                    normalizedKey = key.toLowerCase().trim();
                                                                } else if (groupingKey === 'municipality') {
                                                                    key = dist.municipality || dist.province;
                                                                    normalizedKey = key.toLowerCase().trim();
                                                                } else {
                                                                    key = dist.province;
                                                                    normalizedKey = key.toLowerCase().trim();
                                                                }

                                                                if (!dataMap.has(normalizedKey)) {
                                                                    dataMap.set(normalizedKey, {
                                                                        tilapia: 0,
                                                                        bangus: 0,
                                                                        province: dist.province,
                                                                        municipality: dist.municipality || 'Various',
                                                                        barangay: dist.barangay || 'Various',
                                                                        displayKey: key
                                                                    });
                                                                }

                                                                const entry = dataMap.get(normalizedKey)!;
                                                                if (dist.species === 'Tilapia') {
                                                                    entry.tilapia += dist.fingerlings || 0;
                                                                } else if (dist.species === 'Bangus') {
                                                                    entry.bangus += dist.fingerlings || 0;
                                                                }
                                                            });

                                                            const chartData: FingerlingsData[] = Array.from(dataMap.entries())
                                                                .filter(([normalizedKey]) => !normalizedKey.includes('unknown'))
                                                                .map(([normalizedKey, value]) => ({
                                                                    location: value.displayKey,
                                                                    tilapia: value.tilapia,
                                                                    bangus: value.bangus,
                                                                    date: newState.dateTo,
                                                                    facilityType: newState.selectedFacilityType === 'all_facilities' ? 'All Facilities' : newState.selectedFacilityType.replace(/_/g, ' '),
                                                                    province: value.province,
                                                                    city: value.municipality,
                                                                    barangay: value.barangay
                                                                }));

                                                            chartData.sort((a, b) => (b.tilapia + b.bangus) - (a.tilapia + a.bangus));
                                                            const topData = chartData.slice(0, 12);

                                                            setFingerlingsState(prev => ({
                                                                ...prev,
                                                                data: topData,
                                                                isLoading: false
                                                            }));
                                                        } else {
                                                            setFingerlingsState(prev => ({
                                                                ...prev,
                                                                data: [],
                                                                isLoading: false
                                                            }));
                                                        }
                                                    } catch (error) {
                                                        console.error('Error fetching fingerlings data:', error);
                                                        setFingerlingsState(prev => ({
                                                            ...prev,
                                                            data: [],
                                                            isLoading: false
                                                        }));
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {getAvailableBarangays(fingerlingsState.selectedCity).map(barangay => (
                                                    <option key={barangay} value={barangay}>{barangay}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* <div>
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
                                        </div> */}
                                    </div>

                                    {/* <div className="flex justify-end mb-6">
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
                                    </div> */}

                                    {/* Chart */}
                                    <div className="relative">
                                        {fingerlingsState.isLoading ? (
                                            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                                                <div className="text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                    <p className="text-gray-600">Loading fingerling distribution data...</p>
                                                </div>
                                            </div>
                                        ) : fingerlingsState.data.length === 0 ? (
                                            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                                <div className="text-center px-6">
                                                    <Fish className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Distribution Data Available</h3>
                                                    <p className="text-gray-600 mb-4">
                                                        There are no fingerling distribution records for the selected filters.
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Try adjusting your date range or location filters, or ensure that distribution data has been recorded in the system.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-[600px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={fingerlingsState.data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis dataKey="location" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} angle={-45} textAnchor="end" height={80} interval={0} />
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

                        {/* Actual Harvest Tab */}
                        {activeTab === 'harvest' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="h-5 w-5 text-blue-600" />
                                            <h2 className="text-xl font-semibold text-gray-900">Actual Harvest Analysis</h2>
                                        </div>
                                    </div>

                                    {/* Filters */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                                            <input
                                                type="date"
                                                value={harvestState.dateFrom}
                                                onChange={(e) => setHarvestState(prev => ({ ...prev, dateFrom: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                                            <input
                                                type="date"
                                                value={harvestState.dateTo}
                                                onChange={(e) => setHarvestState(prev => ({ ...prev, dateTo: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                                            <select
                                                value={harvestState.selectedProvince}
                                                onChange={(e) => handleHarvestProvinceChange(e.target.value)}
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
                                                value={harvestState.selectedCity}
                                                onChange={(e) => handleHarvestCityChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {getAvailableCities(harvestState.selectedProvince).map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                                            <select
                                                value={harvestState.selectedBarangay}
                                                onChange={async (e) => {
                                                    const barangay = e.target.value;
                                                    const newState = {
                                                        ...harvestState,
                                                        selectedBarangay: barangay
                                                    };
                                                    setHarvestState(prev => ({
                                                        ...prev,
                                                        selectedBarangay: barangay,
                                                        isLoading: true
                                                    }));

                                                    // Automatically fetch data with new barangay filter
                                                    const newData = await fetchHarvestData(newState);
                                                    setHarvestState(prev => ({
                                                        ...prev,
                                                        data: newData,
                                                        isLoading: false
                                                    }));
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {getAvailableBarangays(harvestState.selectedCity).map(barangay => (
                                                    <option key={barangay} value={barangay}>{barangay}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
                                            <select
                                                value={harvestState.selectedFacilityType}
                                                onChange={(e) => setHarvestState(prev => ({ ...prev, selectedFacilityType: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {facilityTypes.map(facility => (
                                                    <option key={facility} value={facility.toLowerCase().replace(/\s+/g, '_')}>{facility}</option>
                                                ))}
                                            </select>
                                        </div> */}
                                    </div>

                                    {/* <div className="flex justify-end mb-6">
                                        <button
                                            onClick={handleHarvestCompare}
                                            disabled={harvestState.isLoading}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center gap-2"
                                        >
                                            {harvestState.isLoading ? (
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
                                    </div> */}

                                    {/* Chart */}
                                    <div className="relative">
                                        {harvestState.isLoading ? (
                                            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                                                <div className="text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                    <p className="text-gray-600">Loading harvest data...</p>
                                                </div>
                                            </div>
                                        ) : harvestState.data.length === 0 ? (
                                            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                                <div className="text-center px-6">
                                                    <Scale className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Harvest Data Available</h3>
                                                    <p className="text-gray-600 mb-4">
                                                        There are no harvest records with actual harvest data for the selected filters.
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Try adjusting your date range or location filters, or ensure that harvest data has been recorded in the system.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-[600px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={harvestState.data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis dataKey="location" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} angle={-45} textAnchor="end" height={80} interval={0} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `${value.toLocaleString()} kg`} />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Legend />
                                                        <Bar dataKey="tilapia" fill="#10b981" name="Tilapia (kg)" radius={[4, 4, 0, 0]} minPointSize={5} />
                                                        <Bar dataKey="bangus" fill="#3b82f6" name="Bangus (kg)" radius={[4, 4, 0, 0]} minPointSize={5} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>

                                    {/* Summary Cards */}
                                    {!harvestState.isLoading && harvestState.data.length > 0 && (
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="bg-green-50 rounded-lg p-4">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {harvestState.data.reduce((sum, item) => sum + item.tilapia, 0).toLocaleString()} kg
                                                </div>
                                                <div className="text-sm text-green-800">Total Tilapia Harvest</div>
                                            </div>
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {harvestState.data.reduce((sum, item) => sum + item.bangus, 0).toLocaleString()} kg
                                                </div>
                                                <div className="text-sm text-blue-800">Total Bangus Harvest</div>
                                            </div>
                                            <div className="bg-teal-50 rounded-lg p-4">
                                                <div className="text-2xl font-bold text-teal-600">
                                                    {harvestState.data.reduce((sum, item) => sum + item.tilapia + item.bangus, 0).toLocaleString()} kg
                                                </div>
                                                <div className="text-sm text-teal-800">Total Harvest</div>
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
                                                                    <Fish className="h-3 w-3" />
                                                                    {beneficiary.species}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-gray-900">
                                                            {beneficiary.actualHarvestKilos.toLocaleString()} kg
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
