"use client";
import React, { useState, useEffect } from "react";
import { Users, TrendingUp, Calendar, MapPin, Fish, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip, Area, AreaChart, LineChart, Line } from "recharts";
import AsideNavigation from "../components/aside.navigation";
import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";

// Types
interface PredictionItem {
    date: string;
    predicted_harvest: number;
    input_features: Record<string, any>;
    confidence_lower: number;
    confidence_upper: number;
}

interface ModelInfo {
    model_name: string;
    species: string;
    version: string;
    last_trained: string;
    features_used: string[];
    parameters?: {
        survival_rate: number;
        avg_body_weight: number;
    };
}

interface PredictionMetadata {
    province: string;
    city: string;
    barangay?: string;
    date_from: string;
    date_to: string;
    prediction_count: number;
    total_distributions?: number;
    total_fingerlings?: number;
    total_predicted_harvest?: number;
    request_id: string;
    timestamp: string;
    calculation_method?: string;
}

interface PredictionResponse {
    success: boolean;
    predictions: PredictionItem[];
    model_info: ModelInfo;
    metadata: PredictionMetadata;
}

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
        dateFrom: "2025-11-01",
        dateTo: "2026-02-01",
        species: "Red Tilapia",
        province: "all",
        city: "all",
        barangay: "all",
        facilityType: "Fish Cage"
    });

    // Forecast data state
    const [forecastData, setForecastData] = useState<ForecastData[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [predictionResponse, setPredictionResponse] = useState<PredictionResponse | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);


    // Davao Region locations data
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
            "Tagum City": ["Apokon", "Bincungan", "La Filipina", "Magugpo East", "Magugpo North", "Magugpo Poblacion", "Magugpo South", "Mankilam", "Nueva Fuerza", "Pagsabangan", "San Agustin", "San Miguel", "Visayan Village", "Busaon", "Liboganon"],
            "Panabo City": ["A.O. Floirendo", "Cagangohan", "Datu Abdul Dadia", "Gredu", "J.P. Laurel", "Kasilak", "Kauswagan", "Little Panay", "Mabunao", "Malativas", "Nanyo", "New Malaga", "New Malitbog", "New Pandan", "Quezon", "San Francisco", "San Nicolas", "San Pedro", "San Roque", "San Vicente", "Santo Niño", "Waterfall"],
            "Samal City": ["Adecor", "Anonang", "Aumbay", "Babak", "Caliclic", "Camudmud", "Cawag", "Cogon", "Dadiangas", "Guilon", "Kanaan", "Kinawitnon", "Licoan", "Limao", "Miranda", "Pangubatan", "Penaplata", "Poblacion", "San Isidro", "San Miguel", "San Remigio", "Sion", "Tagbaobo", "Tagpopongan", "Tambo", "Tokawal"],
            "Davao City": ["Agdao", "Alambre", "Atan-awe", "Bago Aplaya", "Bago Gallera", "Baliok", "Biao Escuela", "Biao Guianga", "Biao Joaquin", "Binugao", "Buhangin", "Bunawan", "Cabantian", "Cadalian", "Calinan", "Carmen", "Catalunan Grande", "Catalunan Pequeño", "Catitipan", "Central Business District", "Daliao", "Dumoy", "Eden", "Fatima", "Indangan", "Lamanan", "Lampianao", "Leon Garcia", "Ma-a", "Maa", "Magsaysay", "Mahayag", "Malabog", "Manambulan", "Mandug", "Marilog", "Matina Aplaya", "Matina Crossing", "Matina Pangi", "Mintal", "Mulig", "New Carmen", "New Valencia", "Pampanga", "Panacan", "Paquibato", "Paradise Embac", "Riverside", "Salapawan", "San Antonio", "Sirawan", "Sirao", "Tacunan", "Tagluno", "Tagurano", "Talomo", "Tamayong", "Tamugan", "Tapak", "Tawan-tawan", "Tibuloy", "Tibungco", "Toril", "Tugbok", "Waan", "Wines"],
            "Digos City": ["Aplaya", "Balabag", "Biao", "Binaton", "Cogon", "Colorado", "Dulangan", "Goma", "Igpit", "Kapatagan", "Kiagot", "Mahayahay", "Matti", "Meta", "Palili", "Poblacion", "San Agustin", "San Jose", "San Miguel", "Sinawilan", "Soong", "Tres de Mayo", "Zone I", "Zone II", "Zone III"],
            "Mati City": ["Badas", "Bobon", "Buso", "Central", "Dahican", "Danao", "Don Enrique Lopez", "Don Martin Marundan", "Langka", "Lawigan", "Libudon", "Lupon", "Matiao", "Mayo", "Sainz", "Taguibo", "Tagum"],
            "Nabunturan": ["Anislagan", "Antequera", "Basak", "Cabidianan", "Katipunan", "Magading", "Magsaysay", "Nabunturan", "Pandasan", "Poblacion", "San Vicente"],
            "Malita": ["Bolitoc", "Bolontoy", "Culaman", "Dapitan", "Don Narciso Ramos", "Happy Valley", "Kiokong", "Lawa-an", "Little Baguio", "Poblacion", "Sarmiento"],
            "Asuncion": ["Bapa", "Candiis", "Concepcion", "New Corella", "Poblacion", "San Vicente", "Sonlon", "Tubalan"],
            "Braulio E. Dujali": ["Cabidianan", "Datu Balong", "Magsaysay", "New Katipunan", "Poblacion", "Tanglaw", "Tibal-og", "Tres de Mayo"],
            "Cagwait": ["Bagsac", "Basyagan", "Bolod", "East Cabagtas", "East Tupa", "La Purisima", "Magroyong", "Pili", "Tan-awan", "Tupaz "],
            "Carmen": ["Alejal", "Asuncion", "Bincungan", "Carmen", "Ising", "Mabuhay", "Mabini", "Poblacion", "San Agustin"],
            "Bansalan": ["Anonang", "Bitaug", "Darapuay", "Dolo", "Kinuskusan", "Libertad", "Linawan", "Mabini", "Mabunga", "Managa", "Marber", "New Clarin", "Poblacion", "Siblag", "Tinongcop"],
            "Compostela": ["Bagongsilang", "Gabi", "Lagab", "Mangayon", "Mapaca", "Ngan", "New Leyte", "New Panay", "Osmeña", "Poblacion", "Siocon"],
            "Mabini": ["Anitapan", "Cabuyan", "Cuambog", "Del Pilar", "Golden Valley", "Libodon", "Pangibiran", "Pindasan", "San Antonio", "Tagnanan"],
            "Kiblawan": ["Abnate","Bagong Negros","Bagong Silang","Bagumbayan","Balasiao","Bonifacio","Bunot","Cogon-Bacaca","Dapok","Ihan","Kibongbong","Kimlawis","Kisulan","Lati-an","Manual","Maraga-a","Molopolo","New Sibonga","Panaglib","Pasig","Poblacion","Pocaleel","San Isidro","San Jose","San Pedro","Santo Niño","Tacub","Tacul","Waterfall","Bulol-Salo"],
            "Magsaysay": ["Poblacion","Bacungan","Balnate","Barayong","Blocon","Dalawinon","Dalumay","Glamang","Kanapolo","Kasuga","Lower Bala","Mabini","Malawanit","Malongon","New Ilocos","New Opon","San Isidro","San Miguel","Tacul","Tagaytay","Upper Bala","Maibo"],
            "Malalag": ["Bagumbayan","Baybay","Bolton","Bulacan","Caputian","Ibo","Kiblagon","Lapu-Lapu","Mabini","New Baclayon","Pitu","Poblacion","Rizal","San Isidro","Tagansule"],
            "Matanao": ["Asbang","Asinan","Bagumbayan","Bangkal","Buas","Buri","Cabligan (Managa)","Camanchiles","Ceboza","Colonsabak","Dongan-Pekong","Kabasagan","Kapok","Kauswagan","Kibao","La Suerte","Langa-an","Lower Marber","Manga","New Katipunan","New Murcia","New Visayas","Poblacion","Saub","San Jose","San Miguel","San Vicente","Savoy","Sinaragan","Sinawilan","Tamlangon","Tibongbong","Towak"],
            "Padada": ["Almendras (Poblacion)","Don Sergio Osmeña, Sr.","Harada Butai","Lower Katipunan","Lower Limonzo","Lower Malinao","N C Ordaneza (Poblacion)","Northern Paligue","Palili","Piape","Punta Piape","Quirino (Poblacion)","San Isidro","Southern Paligue","Tulugan","Upper Limonzo","Upper Malinao"],
            "Santa Cruz": ["Astorga","Bato","Coronon","Darong","Inawayan","Jose Rizal","Matutungan","Melilia","Zone I (Poblacion)","Zone II (Poblacion)","Zone III (Poblacion)","Zone IV (Poblacion)","Sibulan","Sinoron","Tagabuli","Tibolo","Tuban","Saliducon"],
            "Sulop": ["Balasinon","Buguis","Carre","Clib","Harada Butai","Katipunan","Kiblagon","Labon","Laperas","Lapla","Litos","Luparan","McKinley","New Cebu","Osmeña","Palili","Parame","Poblacion","Roxas","Solongvale","Tagolilong","Tala-o","Talas","Tanwalang","Waterfall"],
            "Kapalong": ["Semong", "Florida", "Gabuyan", "Gupitan", "Capungagan", "Katipunan", "Luna", "Mabantao", "Mamacao", "Pag-asa", "Maniki (Poblacion)", "Sampao", "Sua-on", "Tiburcia"],
            "New Corella": ["Cabidianan", "Carcor", "Del Monte", "Del Pilar", "El Salvador", "Limba-an", "Macgum", "Mambing", "Mesaoy", "New Bohol", "New Cortez", "New Sambog", "Patrocenio", "Poblacion", "San Roque", "Santa Cruz", "Santa Fe", "Santo Niño", "Suawon", "San Jose"],
            "San Isidro": ["Dacudao", "Datu Balong", "Igangon", "Kipalili", "Libuton", "Linao", "Mamangan", "Monte Dujali", "Pinamuno", "Sabangan", "San Miguel", "Santo Niño", "Sawata (Poblacion)"],
            "Santo Tomas": ["Balagunan", "Bobongon", "Casig-Ang", "Esperanza", "Kimamon", "Kinamayan", "La Libertad", "Lungaog", "Magwawa", "New Katipunan", "New Visayas", "Pantaron", "Salvacion", "San Jose", "San Miguel", "San Vicente", "Talomo", "Tibal-og", "Tulalian"],
            "Talaingod": ["Dagohoy", "Palma Gil", "Santo Niño"],
            "Baganga": ["Banaybanay", "Batawan", "Bobonao", "Campawan", "Caraga", "Dapnan", "Lambajon", "Poblacion", "Tokoton"],
            "Don Marcelino": ["Balasinon", "Dulian", "Kinanga", "New Katipunan", "Poblacion", "San Miguel", "Santa Rosa"],
            "Kidapawan": ["Amas"],
            "North Cotabato": ["Balogo"]
        }
    };

    // Options for dropdowns
    const speciesOptions = [
        "Red Tilapia",
        "Bangus",
    ];

    // Real-time validation whenever dates or species change
    useEffect(() => {
        const validation = validateDateRange();
        if (!validation.isValid) {
            setValidationError(validation.errorMessage);
        } else {
            setValidationError(null);
        }
    }, [formData.dateFrom, formData.dateTo, formData.species]);

    // Handle form input changes
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Reset dependent fields when parent changes
            if (field === 'province') {
                newData.city = 'all';
                newData.barangay = 'all';
            } else if (field === 'city') {
                newData.barangay = 'all';
            }

            // Note: Removed automatic date adjustment when species changes
            // Users can now freely select any date range up to 12 months

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


    /**
     * Fetches and aggregates distribution data by geographic level
     * 
     * This function is the core of the geographic filtering system. It:
     * 1. Queries the distributions API based on selected filters (province, city, barangay)
     * 2. Aggregates the forecasted harvest data by month
     * 3. Returns trend data for display in the charts
     * 
     * HOW FILTERING WORKS:
     * - Province Level: Shows total forecast for ALL cities in the selected province
     * - City Level: Shows total forecast for ALL barangays in the selected city
     * - Barangay Level: Shows forecast for the SPECIFIC selected barangay
     * 
     * The filters cascade down:
     * - If you select "Davao del Norte" and "Tagum City", it shows data for Tagum City only
     * - If you select "Davao del Norte", "Tagum City", and "Apokon", it shows data for Apokon only
     * 
     * @param level - The geographic level to fetch data for ('province' | 'city' | 'barangay')
     * @returns Promise<TrendData[]> - Array of monthly aggregated trend data
     */
    const fetchTrendDataForLevel = async (level: 'province' | 'city' | 'barangay'): Promise<TrendData[]> => {
        try {
            // Step 1: Build base query parameters
            // These parameters are always included regardless of the level
            const params = new URLSearchParams({
                species: formData.species === "Red Tilapia" ? "Tilapia" : formData.species,
                startDate: formData.dateFrom,
                endDate: formData.dateTo,
                limit: "1000" // Get all records for aggregation
            });

            // Step 2: Add location filters based on the selected level
            // The filtering logic cascades down from province → city → barangay
            
            /**
             * PROVINCE LEVEL FILTERING:
             * - If user selects "Davao del Norte", it fetches ALL distributions in that province
             * - This includes all cities (Tagum, Panabo, etc.) and all barangays within them
             * - Example: "Davao del Norte" → Shows combined data from Tagum + Panabo + all other cities
             */
            if (level === 'province' && formData.province !== 'all') {
                params.append('province', formData.province);
            } 
            
            /**
             * CITY LEVEL FILTERING:
             * - If user selects "Davao del Norte" + "Tagum City", it fetches distributions in Tagum City only
             * - This includes ALL barangays within Tagum City (Apokon, Bincungan, etc.)
             * - Example: "Tagum City" → Shows combined data from Apokon + Bincungan + all other barangays in Tagum
             */
            else if (level === 'city') {
                if (formData.province !== 'all') {
                    params.append('province', formData.province);
                }
                if (formData.city !== 'all' && formData.city !== 'All Cities') {
                    params.append('municipality', formData.city);
                }
            } 
            
            /**
             * BARANGAY LEVEL FILTERING:
             * - If user selects "Davao del Norte" + "Tagum City" + "Apokon", it fetches distributions in Apokon only
             * - This shows data for ONLY that specific barangay
             * - Example: "Apokon" → Shows data only from Apokon barangay in Tagum City
             */
            else if (level === 'barangay') {
                if (formData.province !== 'all') {
                    params.append('province', formData.province);
                }
                if (formData.city !== 'all' && formData.city !== 'All Cities') {
                    params.append('municipality', formData.city);
                }
                // Add barangay filter if a specific barangay is selected
                if (formData.barangay && formData.barangay !== 'all' && formData.barangay !== 'All Barangays') {
                    params.append('barangay', formData.barangay);
                }
            }

            // Step 3: Fetch distribution data from the API
            console.log(`Fetching ${level} trend data with params:`, params.toString());
            const response = await fetch(`/api/distributions-data?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch distribution data');
            }

            const result = await response.json();

            if (!result.success || !result.data.distributions) {
                throw new Error('Invalid response from distributions API');
            }

            const distributions = result.data.distributions;

            /**
             * Step 4: AGGREGATE DATA BY MONTH
             * 
             * This is where the magic happens! The function takes all the distributions
             * (based on your filters) and groups them by month, then sums up the forecasted harvest.
             * 
             * Example:
             * If you selected "Davao del Norte" → "Tagum City", and there are:
             * - 3 distributions in Apokon barangay in November with forecasts: 50kg, 75kg, 100kg
             * - 2 distributions in Bincungan barangay in November with forecasts: 80kg, 120kg
             * 
             * The result for November would be: 50 + 75 + 100 + 80 + 120 = 425kg total
             * 
             * This happens for each month in your selected date range.
             */
            const monthlyData = new Map<string, { total: number, count: number }>();

            distributions.forEach((dist: any) => {
                const date = new Date(dist.dateDistributed);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                // Get the forecasted harvest value (was calculated when distribution was created)
                const harvestValue = dist.forecastedHarvestKilos || 0;

                if (monthlyData.has(monthKey)) {
                    // Add to existing month's total
                    const existing = monthlyData.get(monthKey)!;
                    existing.total += harvestValue;
                    existing.count += 1;
                } else {
                    // Create new month entry
                    monthlyData.set(monthKey, { total: harvestValue, count: 1 });
                }
            });

            // Generate date range and fill in data
            const dates = getDateRange(formData.dateFrom, formData.dateTo);
            const data: TrendData[] = dates.map(date => {
                const dateObj = new Date(date);
                const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
                const monthData = monthlyData.get(monthKey);

                // Location string based on level
                const locationString = level === 'province' ? formData.province :
                    level === 'city' ? `${formData.city}, ${formData.province}` :
                        `${formData.barangay}, ${formData.city}, ${formData.province}`;

                return {
                    month: dateObj.toLocaleDateString('en-US', { month: 'short' }),
                    date,
                    value: monthData ? Math.round(monthData.total) : 0,
                    species: formData.species,
                    location: locationString
                };
            });

            return data;
        } catch (error) {
            console.error(`Error fetching trend data for ${level}:`, error);
            // Return empty data on error
            return getDateRange(formData.dateFrom, formData.dateTo).map(date => {
                const dateObj = new Date(date);
                const locationString = level === 'province' ? formData.province :
                    level === 'city' ? `${formData.city}, ${formData.province}` :
                        `${formData.barangay}, ${formData.city}, ${formData.province}`;

                return {
                    month: dateObj.toLocaleDateString('en-US', { month: 'short' }),
                    date,
                    value: 0,
                    species: formData.species,
                    location: locationString
                };
            });
        }
    };

    // Validate date range - maximum 1 year (12 months) for all species
    const validateDateRange = (): { isValid: boolean; errorMessage: string } => {
        const startDate = new Date(formData.dateFrom);
        const endDate = new Date(formData.dateTo);

        // Check if end date is before start date
        if (endDate < startDate) {
            return {
                isValid: false,
                errorMessage: 'Error: End date must be after start date.'
            };
        }

        // Calculate the difference in months (inclusive of both start and end months)
        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
            (endDate.getMonth() - startDate.getMonth()) + 1;

        console.log('Validation Check:', {
            species: formData.species,
            dateFrom: formData.dateFrom,
            dateTo: formData.dateTo,
            monthsDiff: monthsDiff
        });

        // Check maximum 12 months limit for all species
        if (monthsDiff > 12) {
            return {
                isValid: false,
                errorMessage: `Error: Date range cannot exceed 12 months. Current selection: ${monthsDiff} months.`
            };
        }

        return { isValid: true, errorMessage: '' };
    };

    // Handle forecast generation
    const handleGenerateForecast = async () => {
        // Validate date range before proceeding
        const validation = validateDateRange();
        if (!validation.isValid) {
            setApiError(validation.errorMessage);
            return;
        }

        setIsGenerating(true);
        setApiError(null);

        try {
            // Call the calculated forecast API (uses real database data)
            const response = await fetch('/api/forecast/calculated', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    species: formData.species,
                    dateFrom: formData.dateFrom,
                    dateTo: formData.dateTo,
                    province: formData.province,
                    city: formData.city,
                    barangay: formData.barangay,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch predictions');
            }

            const result = await response.json();

            if (!result.success || !result.predictions) {
                throw new Error('Invalid response from prediction API');
            }

            const apiData: PredictionResponse = result;
            setPredictionResponse(apiData);

            // Transform API data to chart format
            const transformedData: ForecastData[] = apiData.predictions.map((pred) => {
                const dateObj = new Date(pred.date);
                const monthIndex = dateObj.getMonth();
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                // Use actual harvest data from database if available
                const historical = Math.round((pred as any).actual_harvest || 0);

                // Calculate confidence percentage from confidence bounds
                const confidenceRange = pred.confidence_upper - pred.confidence_lower;
                const confidencePercent = Math.round(100 - (confidenceRange / pred.predicted_harvest * 100));

                return {
                    month: months[monthIndex],
                    date: pred.date,
                    predicted: Math.round(pred.predicted_harvest),
                    historical,
                    confidence: Math.max(75, Math.min(95, confidencePercent)), // Clamp between 75-95%
                    species: formData.species,
                    location: `${formData.city}, ${formData.province}`
                };
            });

            setForecastData(transformedData);
            setShowResults(true);

        } catch (error) {
            console.error('Error generating forecast:', error);
            setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
            setShowResults(false);
        } finally {
            setIsGenerating(false);
        }
    };

    // Get available cities based on selected province
    const getAvailableCities = () => {
        if (formData.province === 'all' || !locationData.cities[formData.province]) {
            return ["All Cities"];
        }
        return ["All Cities", ...locationData.cities[formData.province]];
    };

    // Get available barangays based on selected city
    const getAvailableBarangays = () => {
        if (formData.city === 'all' || formData.city === 'All Cities' || !locationData.barangays[formData.city]) {
            return ["All Barangays"];
        }
        return ["All Barangays", ...locationData.barangays[formData.city]];
    };

    // Generate dynamic titles based on selected parameters
    const getParameterBasedTitle = () => {
        return `${formData.species}`;
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
                            <p className="text-gray-600">Generate Harvest Forecasts Actual vs Forecast Over Time</p>
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
                                            <MapPin className="h-4 w-4" />
                                            Province:
                                        </label>
                                        <select
                                            value={formData.province}
                                            onChange={(e) => handleInputChange('province', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="all">All Provinces</option>
                                            {locationData.provinces.map(province => (
                                                <option key={province} value={province}>{province}</option>
                                            ))}
                                        </select>
                                    </div>

                                </div>

                                {/* Location Hierarchy */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

                                {/* Validation Warning - Show above Generate Button */}
                                {validationError && (
                                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <div>
                                                <h4 className="text-amber-800 font-semibold mb-1">Invalid Date Range</h4>
                                                <p className="text-amber-700 text-sm">{validationError}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Generate Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleGenerateForecast}
                                        disabled={isGenerating || !!validationError}
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
                                {!showResults && !apiError && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                        <p className="text-blue-800 text-sm">
                                            Configure your forecasting parameters and click "Generate Forecast" to view predictions and trend analysis
                                        </p>
                                    </div>
                                )}

                                {/* Error Message */}
                                {apiError && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <h4 className="text-red-800 font-semibold mb-1">Error Generating Forecast</h4>
                                                <p className="text-red-700 text-sm">{apiError}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ============================================
                            RESULTS SECTION
                            ============================================
                            This section displays all forecast results after successful generation.
                            Shows only when showResults is true and predictionResponse is available.
                        */}
                        {showResults && predictionResponse && (
                            <>
                                {/* Summary Statistics */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {forecastData.reduce((sum, item) => sum + item.predicted, 0).toLocaleString()} kg
                                            </div>
                                            <div className="text-sm text-blue-800">Total Predicted Harvest</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {predictionResponse.metadata.total_fingerlings?.toLocaleString() || 0}
                                            </div>
                                            <div className="text-sm text-purple-800">Total Fingerlings</div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-green-600">
                                                {forecastData.reduce((sum, item) => sum + item.historical, 0).toLocaleString()} kg
                                            </div>
                                            <div className="text-sm text-green-800">Actual Harvest</div>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {forecastData.length}
                                            </div>
                                            <div className="text-sm text-orange-800">Months Forecasted</div>
                                        </div>
                                    </div>
                                </div>

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
                                                        <Tooltip formatter={(value) => [`${value} kg`, 'Harvest']} />
                                                        <Legend />
                                                        <Bar dataKey="predicted" fill="#3B82F6" name="Predicted Harvest (kg)" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Harvest Trend</h3>
                                            <p className="text-sm text-gray-600 mb-4">{getParameterBasedTitle()}</p>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={forecastData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <Tooltip formatter={(value) => [`${value} kg`, 'Harvest']} />
                                                        <Legend />
                                                        <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={3} name="Predicted Harvest (kg)" />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div> */}

                                {/* Forecast Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Actual vs Forecast Over Time</h3>
                                        <p className="text-sm text-gray-600 mb-4">{getParameterBasedTitle()}</p>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={forecastData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis />
                                                    <Tooltip 
                                                        formatter={(value) => [`${value?.toLocaleString()} kg`, '']}
                                                        labelFormatter={(label) => `Month: ${label}`}
                                                    />
                                                    <Legend />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="predicted" 
                                                        stroke="#3B82F6" 
                                                        strokeWidth={3}
                                                        name="Forecast" 
                                                        dot={{ r: 4 }}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="historical" 
                                                        stroke="#10B981" 
                                                        strokeWidth={3}
                                                        name="Actual" 
                                                        dot={{ r: 4 }}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    {/* 
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
                                    </div> */}
                                </div>
                            </>
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
