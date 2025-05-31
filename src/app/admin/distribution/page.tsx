"use client";

import React, { useState } from "react";
import { Users, User, Calendar, MapPin, Building2, FileText, Save, AlertCircle, CheckCircle, X, Fish, Eye, Hash, ChevronDown, ChevronUp, Plus } from "lucide-react";
import AsideNavigation from "../components/aside.navigation";
import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";

const FullScreenLoader = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

// Types
interface DistributionForm {
    firstname: string;
    lastname: string;
    date: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
    facilityType: 'Fish Cage' | 'Pond' | '';
    details: string;
    batchId: string;
    fingerlingsCount: number;
}

interface Batch {
    id: string;
    name: string;
    totalFingerlings: number;
    remainingFingerlings: number;
}

interface Distribution {
    id: string;
    beneficiary: string;
    batchId: string;
    fingerlingsCount: number;
    location: string;
    facilityType: string;
    date: string;
    forecast: string;
    harvestDate: string;
}

interface FormErrors {
    [key: string]: string;
}

// Mock data for batches with more sample data
const mockBatches: Batch[] = [
    { id: "BATCH-001", name: "Tilapia Batch Jan 2024", totalFingerlings: 5000, remainingFingerlings: 3500 },
    { id: "BATCH-002", name: "Bangus Batch Feb 2024", totalFingerlings: 3000, remainingFingerlings: 2800 },
];

// Define type for locations
type LocationData = {
    [province: string]: {
        [city: string]: string[];
    };
};

// Davao Region locations data
const davaoRegionLocations = {
    "Davao del Norte": {
        "Tagum City": ["Apokon", "Bincungan", "La Filipina", "Magugpo East", "Magugpo North", "Magugpo Poblacion", "Magugpo South", "Mankilam", "Nueva Fuerza", "Pagsabangan", "San Agustin", "San Miguel", "Visayan Village"],
        "Panabo City": ["A.O. Floirendo", "Cagangohan", "Datu Abdul Dadia", "Gredu", "J.P. Laurel", "Kasilak", "Kauswagan", "Little Panay", "Mabunao", "Malativas", "Nanyo", "New Malaga", "New Malitbog", "New Pandan", "Quezon", "San Francisco", "San Nicolas", "San Pedro", "San Roque", "San Vicente", "Santo Niño", "Waterfall"],
        "Samal City": ["Adecor", "Anonang", "Aumbay", "Babak", "Caliclic", "Camudmud", "Cawag", "Cogon", "Dadiangas", "Guilon", "Kanaan", "Kinawitnon", "Licoan", "Limao", "Miranda", "Pangubatan", "Penaplata", "Peñaplata", "Poblacion", "San Isidro", "San Miguel", "San Remigio", "Sion", "Tagbaobo", "Tagpopongan", "Tambo", "Tokawal"],
        "Asuncion": ["Bapa", "Candiis", "Concepcion", "New Corella", "Poblacion", "San Vicente", "Sonlon", "Tubalan"],
        "Braulio E. Dujali": ["Cabidianan", "Datu Balong", "Magsaysay", "New Katipunan", "Poblacion", "Tanglaw", "Tibal-og", "Tres de Mayo"],
        "Carmen": ["Alejal", "Asuncion", "Bincungan", "Carmen", "Ising", "Mabuhay", "Mabini", "Poblacion", "San Agustin"],
        "Kapalong": ["Gupitan", "Kauswagan", "Lacson", "Maduao", "New Katipunan", "Poblacion", "San Isidro", "Santo Niño", "Tampa"],
        "New Corella": ["Canaan", "Central", "Dacudao", "Don Marcelino", "Jose Rizal", "Kipalili", "Macopa", "Malinao", "Mesalay", "New Bohol", "New Leyte", "New Visayas", "Poblacion", "San Roque"],
        "San Isidro": ["Dalisay", "Dapco", "Kauswagan", "Kipalili", "Lumayag", "New Katipunan", "New Panay", "Poblacion", "San Juan", "Santo Niño"],
        "Santo Tomas": ["Bobongon", "Casoon", "Esperanza", "Kinamayan", "Magwawa", "Magugpo", "New Carmen", "New Oregon", "Pangi", "Poblacion", "Salvacion", "Tibanban"],
        "Talaingod": ["Dagohoy", "Datu Salumay", "Datu Taghoy", "Datu Davao", "Palma Gil", "Poblacion", "Santo Niño"]
    },
    "Davao del Sur": {
        "Davao City": ["Agdao", "Alambre", "Atan-awe", "Bago Aplaya", "Bago Gallera", "Baliok", "Biao Escuela", "Biao Guianga", "Biao Joaquin", "Binugao", "Buhangin", "Bunawan", "Cabantian", "Cadalian", "Calinan", "Carmen", "Catalunan Grande", "Catalunan Pequeño", "Catitipan", "Central Business District", "Daliao", "Dumoy", "Eden", "Fatima", "Indangan", "Lamanan", "Lampianao", "Leon Garcia", "Ma-a", "Maa", "Magsaysay", "Mahayag", "Malabog", "Manambulan", "Mandug", "Marilog", "Matina Aplaya", "Matina Crossing", "Matina Pangi", "Mintal", "Mulig", "New Carmen", "New Valencia", "Pampanga", "Panacan", "Paquibato", "Paradise Embac", "Riverside", "Salapawan", "San Antonio", "Sirawan", "Sirao", "Tacunan", "Tagluno", "Tagurano", "Talomo", "Tamayong", "Tamugan", "Tapak", "Tawan-tawan", "Tibuloy", "Tibungco", "Toril", "Tugbok", "Waan", "Wines"],
        "Digos City": ["Aplaya", "Balabag", "Biao", "Binaton", "Cogon", "Colorado", "Dulangan", "Goma", "Igpit", "Kapatagan", "Kiagot", "Mahayahay", "Matti", "Meta", "Palili", "Poblacion", "San Agustin", "San Jose", "San Miguel", "Sinawilan", "Soong", "Tres de Mayo", "Zone I", "Zone II", "Zone III"],
        "Bansalan": ["Anonang", "Bitaug", "Darapuay", "Dolo", "Kinuskusan", "Libertad", "Linawan", "Mabini", "Mabunga", "Managa", "Marber", "New Clarin", "Poblacion", "Siblag", "Tinongcop"],
        "Hagonoy": ["Balutakay", "Clib", "Guihing", "Hagonoy", "Kiagot", "La Union", "Leling", "Mabini", "Mahayag", "Paligue", "Poblacion", "Sacub", "San Guillermo", "San Isidro", "Sinawilan", "Tologan"],
        "Kiblawan": ["Abnayan", "Basiawan", "Datu Davao", "Datu Dani", "Datu Dinggay", "Datu Kali", "Datu Ladayon", "Datu Mandac", "Datu Matumtum", "Datu Sharif", "Mabuhay", "Poblacion"],
        "Magsaysay": ["Buca", "Dolo", "Kisante", "Mabini", "Maharlika", "Malawanit", "New Katipunan", "New Lebanon", "Pisan", "Poblacion", "Riverside", "San Miguel", "Tacul"],
        "Malalag": ["Buas", "Datu Hamaw", "Kibuaya", "Loma", "Mabini", "Malalag", "Malalag Cogon", "New Iloilo", "New Opon", "Piao", "Poblacion", "San Agustin", "Tubalan"],
        "Matanao": ["Asbang", "Asinan", "Biao", "Colonsabak", "Kisante", "La Suerte", "Managa", "New Panay", "Patpat", "Poblacion", "Sagangon", "Sinawilan", "Tanama"],
        "Padada": ["Almendras", "Cebolin", "Dacudao", "Danlugan", "Don Marcelino", "Kiblagan", "Lalayag", "Lanuro", "Lower Katipunan", "Mabini", "Magsaysay", "Matiao", "New Cebu", "New Leyte", "Panalum", "Poblacion", "Tamayong", "Tulogan", "Upper Katipunan"],
        "Santa Cruz": ["Astorga", "Bato", "Bololmala", "Colorado", "Coronon", "Darong", "Inawayan", "Matutum", "Poblacion", "Sibulan", "Talagutong", "Tibolo"],
        "Sulop": ["Bolitoc", "Bugac", "Camanchiles", "Dasay", "Kauswagan", "Luma", "Mabuhay", "Malonoy", "Poblacion", "Kamanga", "Katipunan"]
    },
    "Davao de Oro": {
        "Nabunturan": ["Anislagan", "Antequera", "Basak", "Cabidianan", "Katipunan", "Magading", "Magsaysay", "Nabunturan", "Pandasan", "Poblacion", "San Vicente"],
        "Compostela": ["Bagongsilang", "Gabi", "Lagab", "Mangayon", "Mapaca", "Ngan", "New Leyte", "New Panay", "Osmeña", "Poblacion", "Siocon"],
        "Laak": ["Kapatagan", "Laak", "Magsaysay", "Malamodao", "Poblacion", "San Vicente", "Sua-on"],
        "Mabini": ["Anitapan", "Cadunan", "Kahayag", "Mabini", "Pindasan", "Poblacion", "Sawangan"],
        "Maco": ["Binuangan", "Elizalde", "Gubatan", "Kinuban", "Maco", "Masara", "New Bataan", "Pamintaran", "Poblacion"],
        "Maragusan": ["Bagong Silang", "Coronobe", "Lahi", "Magcagong", "Malatagao", "Maragusan", "New Albay", "Paligue", "Poblacion", "Tagbaobo"],
        "Mawab": ["Bawani", "Concepcion", "Hubang", "Kapisanan", "Mabuhay", "Mawab", "Nueva Visayas", "Poblacion", "Salvacion"],
        "Monkayo": ["Awao", "Banlag", "Casoon", "Manat", "Monkayo", "Mount Diwata", "Naboc", "New Visayas", "Poblacion", "San Vicente", "Tubo-tubo"],
        "Montevista": ["Banlag", "Linoan", "Macopa", "Montevista", "New Katipunan", "New Sibonga", "Palma Gil", "Poblacion"],
        "New Bataan": ["Andap", "Cabinuangan", "Fatima", "Kapatagan", "Katipunan", "New Bataan", "Poblacion", "Siocon"],
        "Pantukan": ["Bongabong", "Las Arenas", "Magnaga", "Napnapan", "Pantukan", "Poblacion", "Tambongon", "Tibagon"]
    },
    "Davao Oriental": {
        "Mati City": ["Badas", "Bobon", "Buso", "Central", "Dahican", "Danao", "Don Enrique Lopez", "Don Martin Marundan", "Langka", "Lawigan", "Libudon", "Lupon", "Matiao", "Mayo", "Sainz", "Taguibo", "Tagum"],
        "Baganga": ["Banaybanay", "Batawan", "Bobonao", "Campawan", "Caraga", "Dapnan", "Lambajon", "Poblacion", "Tokoton"],
        "Banaybanay": ["Cabangcalan", "Caganganan", "Calubcub", "Causwagan", "Mahayag", "Maputi", "Mogbongcogon", "Pindasan", "Poblacion", "San Vicente", "Sua-on"],
        "Boston": ["Caatuan", "Poblacion", "Salamague"],
        "Caraga": ["Caraga", "Pichon", "Poblacion", "Santiago", "Sobrecarey", "Sunrise Village"],
        "Cateel": ["Aliwagwag", "Bagumbayan", "Dapnan", "Hermosa", "Poblacion", "Taocanga"],
        "Governor Generoso": ["Bislig", "Jovellar", "Malita", "Poblacion", "Sigaboy", "Tibanban"],
        "Lupon": ["Baracatan", "Guhian", "Libudon", "Mahan-ub", "Poblacion", "San Isidro", "San Roque", "Tagugpo"],
        "Manay": ["Behia", "Lambajon", "Libjo", "Poblacion", "Sendangan", "Taocanga"],
        "San Isidro": ["Batawan", "Bobon", "Cagdianao", "Dapnan", "Isidro", "Poblacion"],
        "Tarragona": ["Casoon", "Jovellar", "Kabuaya", "Limot", "Maganda", "Poblacion", "Tandawan"]
    },
    "Davao Occidental": {
        "Malita": ["Bolitoc", "Bolontoy", "Culaman", "Dapitan", "Don Narciso Ramos", "Happy Valley", "Kiokong", "Lawa-an", "Little Baguio", "Poblacion", "Sarmiento"],
        "Don Marcelino": ["Balasinon", "Dulian", "Kinanga", "New Katipunan", "Poblacion", "San Miguel", "Santa Rosa"],
        "Jose Abad Santos": ["Caburan", "Katipunan", "Linao", "Poblacion", "Sarangani"],
        "Santa Maria": ["Basiawan", "Kibleg", "Lalab", "New Dumanjug", "Poblacion", "Tuyan"]
    }
};

// Mobile Card Component for Distribution
const DistributionCard: React.FC<{ distribution: Distribution; onViewDetails: () => void }> = ({
    distribution,
    onViewDetails
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{distribution.beneficiary}</h3>
                    <p className="text-sm font-mono text-blue-600">{distribution.batchId}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onViewDetails}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                        title={isExpanded ? "Show Less" : "Show More"}
                    >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <span className="text-gray-500">Fingerlings:</span>
                    <p className="font-medium text-gray-900">{distribution.fingerlingsCount.toLocaleString()}</p>
                </div>
                <div>
                    <span className="text-gray-500">Facility:</span>
                    <p className="font-medium text-gray-900">{distribution.facilityType}</p>
                </div>
                <div>
                    <span className="text-gray-500">Date:</span>
                    <p className="font-medium text-gray-900">{distribution.date}</p>
                </div>
                <div>
                    <span className="text-gray-500">Harvest:</span>
                    <p className="font-medium text-green-600">{distribution.harvestDate}</p>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="text-gray-500">Location:</span>
                            <p className="font-medium text-gray-900 mt-1">{distribution.location}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Forecast Date:</span>
                            <p className="font-medium text-amber-600">{distribution.forecast}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Distribution Form Modal Component
const DistributionFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (distribution: Distribution) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<DistributionForm>({
        firstname: '',
        lastname: '',
        date: '',
        province: '',
        city: '',
        barangay: '',
        street: '',
        facilityType: '',
        details: '',
        batchId: '',
        fingerlingsCount: 0
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

    if (!isOpen) return null;

    // Get available cities based on selected province
    const getAvailableCities = () => {
        if (!formData.province || !(formData.province in davaoRegionLocations)) return [];
        const province = formData.province as keyof typeof davaoRegionLocations;
        return Object.keys(davaoRegionLocations[province]);
    };

    // Get available barangays based on selected city
    const getAvailableBarangays = () => {
        if (!formData.province || !formData.city) return [];
        const province = davaoRegionLocations[formData.province as keyof typeof davaoRegionLocations];
        return province && formData.city in province ? province[formData.city as keyof typeof province] : [];
    };

    // Handle input changes
    const handleInputChange = (field: keyof DistributionForm, value: string | number) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Reset dependent fields when parent location changes
            if (field === 'province') {
                newData.city = '';
                newData.barangay = '';
            } else if (field === 'city') {
                newData.barangay = '';
            }

            return newData;
        });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Handle batch selection
    const handleBatchChange = (batchId: string) => {
        const batch = mockBatches.find(b => b.id === batchId);
        setSelectedBatch(batch || null);
        handleInputChange('batchId', batchId);

        // Automatically set fingerlings count to remaining fingerlings in the batch
        if (batch) {
            handleInputChange('fingerlingsCount', batch.remainingFingerlings);
        } else {
            handleInputChange('fingerlingsCount', 0);
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.firstname.trim()) newErrors.firstname = 'Firstname is required';
        if (!formData.lastname.trim()) newErrors.lastname = 'Lastname is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.province) newErrors.province = 'Province is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.barangay) newErrors.barangay = 'Barangay is required';
        if (!formData.street.trim()) newErrors.street = 'Street/Purok is required';
        if (!formData.facilityType) newErrors.facilityType = 'Facility type is required';
        if (!formData.details.trim()) newErrors.details = 'Details are required';
        if (!formData.batchId) newErrors.batchId = 'Batch ID is required';
        if (!formData.fingerlingsCount || formData.fingerlingsCount <= 0) {
            newErrors.fingerlingsCount = 'Please select a valid batch to auto-assign fingerlings';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Calculate forecast and harvest dates
    const calculateDates = (distributionDate: string) => {
        const date = new Date(distributionDate);
        const forecastDate = new Date(date);
        forecastDate.setMonth(date.getMonth() + 3); // 3 months for forecast

        const harvestDate = new Date(date);
        harvestDate.setMonth(date.getMonth() + 6); // 6 months for harvest

        return {
            forecast: forecastDate.toISOString().split('T')[0],
            harvest: harvestDate.toISOString().split('T')[0]
        };
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const dates = calculateDates(formData.date);
            const location = `${formData.street}, ${formData.barangay}, ${formData.city}, ${formData.province}`;

            const newDistribution: Distribution = {
                id: `DIST-${Date.now()}`,
                beneficiary: `${formData.firstname} ${formData.lastname}`,
                batchId: formData.batchId,
                fingerlingsCount: formData.fingerlingsCount,
                location,
                facilityType: formData.facilityType,
                date: formData.date,
                forecast: dates.forecast,
                harvestDate: dates.harvest
            };

            // Update batch remaining fingerlings
            if (selectedBatch) {
                selectedBatch.remainingFingerlings -= formData.fingerlingsCount;
            }

            onSave(newDistribution);

            // Reset form
            setFormData({
                firstname: '', lastname: '', date: '', province: '', city: '',
                barangay: '', street: '', facilityType: '', details: '',
                batchId: '', fingerlingsCount: 0
            });
            setSelectedBatch(null);
            setErrors({});
            onClose();

        } catch (error) {
            console.error('Error saving distribution:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">New Fingerling Distribution</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Batch Selection */}
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                Batch Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch ID</label>
                                    <select
                                        value={formData.batchId}
                                        onChange={(e) => handleBatchChange(e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.batchId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select a batch</option>
                                        {mockBatches.map(batch => (
                                            <option key={batch.id} value={batch.id}>
                                                {batch.id} - {batch.name} (Available: {batch.remainingFingerlings})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.batchId && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.batchId}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Fish className="h-4 w-4" />
                                        Fingerlings Count (Auto-filled)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.fingerlingsCount || ''}
                                            readOnly
                                            placeholder="Will be auto-filled when batch is selected"
                                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                        />
                                        {selectedBatch && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                    {selectedBatch && (
                                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4" />
                                            Automatically assigned: {selectedBatch.remainingFingerlings} fingerlings
                                        </p>
                                    )}
                                    {!selectedBatch && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Select a batch to automatically fill fingerlings count
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Beneficiary Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Beneficiary Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Firstname</label>
                                    <input
                                        type="text"
                                        value={formData.firstname}
                                        onChange={(e) => handleInputChange('firstname', e.target.value)}
                                        placeholder="Enter firstname"
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstname ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.firstname && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.firstname}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Lastname</label>
                                    <input
                                        type="text"
                                        value={formData.lastname}
                                        onChange={(e) => handleInputChange('lastname', e.target.value)}
                                        placeholder="Enter lastname"
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastname ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.lastname && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.lastname}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Location Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                                    <select
                                        value={formData.province}
                                        onChange={(e) => handleInputChange('province', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.province ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select province</option>
                                        {Object.keys(davaoRegionLocations).map(province => (
                                            <option key={province} value={province}>{province}</option>
                                        ))}
                                    </select>
                                    {errors.province && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.province}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <select
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        disabled={!formData.province}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            } ${!formData.province ? 'bg-gray-100' : ''}`}
                                    >
                                        <option value="">Select city</option>
                                        {getAvailableCities().map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    {errors.city && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.city}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
                                    <select
                                        value={formData.barangay}
                                        onChange={(e) => handleInputChange('barangay', e.target.value)}
                                        disabled={!formData.city}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.barangay ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            } ${!formData.city ? 'bg-gray-100' : ''}`}
                                    >
                                        <option value="">Select barangay</option>
                                        {getAvailableBarangays().map((barangay: string): JSX.Element => (
                                            <option key={barangay} value={barangay}>{barangay}</option>
                                        ))}
                                    </select>
                                    {errors.barangay && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.barangay}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Street / Purok</label>
                                    <input
                                        type="text"
                                        value={formData.street}
                                        onChange={(e) => handleInputChange('street', e.target.value)}
                                        placeholder="Enter street or purok"
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.street && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.street}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Facility and Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                    <Building2 className="h-4 w-4" />
                                    Facility Type
                                </label>
                                <div className="space-y-3">
                                    {['Fish Cage', 'Pond'].map(type => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="facilityType"
                                                value={type}
                                                checked={formData.facilityType === type}
                                                onChange={(e) => handleInputChange('facilityType', e.target.value)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.facilityType && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-600">{errors.facilityType}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="h-4 w-4" />
                                    Distribution Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                />
                                {errors.date && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-600">{errors.date}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FileText className="h-4 w-4" />
                                Additional Details
                            </label>
                            <textarea
                                value={formData.details}
                                onChange={(e) => handleInputChange('details', e.target.value)}
                                placeholder="Enter additional details about the distribution"
                                rows={4}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.details ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                            />
                            {errors.details && (
                                <div className="flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-red-600">{errors.details}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                onClick={onClose}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-3 rounded-lg transition-colors duration-300 flex items-center gap-3 font-semibold"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Saving Distribution...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Save Distribution
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DistributionForm: React.FC = () => {
    const { unreadCount } = useNotification();
    const { isLoading, isAuthenticated, logout } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    // State management
    const [distributions, setDistributions] = useState<Distribution[]>([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

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

    // Handle saving new distribution
    const handleSaveDistribution = (newDistribution: Distribution) => {
        setDistributions(prev => [...prev, newDistribution]);
        setShowSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    };

    // Open detail modal
    const openDetailModal = (distribution: Distribution) => {
        setSelectedDistribution(distribution);
        setShowDetailModal(true);
    };

    return (
        <>
            <AsideNavigation onLogout={logout} unreadNotificationCount={unreadCount} />
            <div className="grid grid-cols-6 p-5 bg-gradient-to-br from-gray-50 to-emerald-50 min-h-screen">
                <div className="col-start-1 sm:col-start-1 md:col-start-1 lg:col-start-2 xl:col-start-2 col-span-6 overflow-y-auto px-0 pt-14 pb-8 sm:px-6 sm:py-8 w-full">

                    {/* Success Message */}
                    {showSuccess && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <p className="text-green-800 font-medium">Distribution saved successfully!</p>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                        <Fish className="h-5 w-5 text-white" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900">Fingerling Distributions</h1>
                                </div>
                                <button
                                    onClick={() => setShowFormModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300 flex items-center gap-2 font-semibold"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add New Distribution
                                </button>
                            </div>

                            {/* Distribution Table/List */}
                            {distributions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Fish className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Distributions Yet</h3>
                                    <p className="text-gray-500 mb-6">Start by adding your first fingerling distribution</p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table - Hidden on mobile */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <table className="w-full table-auto">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Beneficiary</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Batch ID</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Fingerlings</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Facility</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Forecast</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Harvest</th>
                                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {distributions.map((dist) => (
                                                    <tr key={dist.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{dist.beneficiary}</td>
                                                        <td className="px-4 py-3 text-sm text-blue-600 font-mono">{dist.batchId}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{dist.fingerlingsCount.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={dist.location}>
                                                            {dist.location}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{dist.facilityType}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{dist.date}</td>
                                                        <td className="px-4 py-3 text-sm text-amber-600">{dist.forecast}</td>
                                                        <td className="px-4 py-3 text-sm text-green-600">{dist.harvestDate}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => openDetailModal(dist)}
                                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Tablet Table - Condensed version */}
                                    <div className="hidden md:block lg:hidden overflow-x-auto">
                                        <table className="w-full table-auto">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Beneficiary</th>
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Batch</th>
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Count</th>
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Facility</th>
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Harvest</th>
                                                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {distributions.map((dist) => (
                                                    <tr key={dist.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-3 text-sm text-gray-900 font-medium">{dist.beneficiary}</td>
                                                        <td className="px-3 py-3 text-sm text-blue-600 font-mono">{dist.batchId}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{dist.fingerlingsCount.toLocaleString()}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{dist.facilityType}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{dist.date}</td>
                                                        <td className="px-3 py-3 text-sm text-green-600">{dist.harvestDate}</td>
                                                        <td className="px-3 py-3 text-center">
                                                            <button
                                                                onClick={() => openDetailModal(dist)}
                                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards - Shown only on mobile */}
                                    <div className="block md:hidden">
                                        {distributions.map((dist) => (
                                            <DistributionCard
                                                key={dist.id}
                                                distribution={dist}
                                                onViewDetails={() => openDetailModal(dist)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Form Modal */}
                    <DistributionFormModal
                        isOpen={showFormModal}
                        onClose={() => setShowFormModal(false)}
                        onSave={handleSaveDistribution}
                    />

                    {/* Detail Modal */}
                    {showDetailModal && selectedDistribution && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <User className="h-6 w-6" />
                                            Distribution Details
                                        </h3>
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">Beneficiary Information</h4>
                                            <p className="text-blue-800"><strong>Name:</strong> {selectedDistribution.beneficiary}</p>
                                            <p className="text-blue-800"><strong>Location:</strong> {selectedDistribution.location}</p>
                                            <p className="text-blue-800"><strong>Facility Type:</strong> {selectedDistribution.facilityType}</p>
                                        </div>

                                        <div className="bg-green-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-green-900 mb-2">Distribution Details</h4>
                                            <p className="text-green-800"><strong>Batch ID:</strong> {selectedDistribution.batchId}</p>
                                            <p className="text-green-800"><strong>Fingerlings Count:</strong> {selectedDistribution.fingerlingsCount.toLocaleString()}</p>
                                            <p className="text-green-800"><strong>Distribution Date:</strong> {selectedDistribution.date}</p>
                                        </div>

                                        <div className="bg-amber-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-amber-900 mb-2">Timeline</h4>
                                            <p className="text-amber-800"><strong>Forecast Date:</strong> {selectedDistribution.forecast}</p>
                                            <p className="text-amber-800"><strong>Expected Harvest:</strong> {selectedDistribution.harvestDate}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-6">
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// Main App Component with LogoutProvider wrapper
const App: React.FC = () => {
    return (
        <LogoutProvider>
            <DistributionForm />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;