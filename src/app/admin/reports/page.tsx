"use client";
import React, { useState } from "react";
import { Users, Download, Filter, Calendar, ChevronDown, ChevronUp, RotateCcw, FileText, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import AsideNavigation from "../components/aside.navigation";

import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";

// TypeScript interfaces
interface ReportFilters {
    reportType: string;
    species: string;
    startDate: string;
    endDate: string;
    province?: string;
    city?: string;
    barangay?: string;
}

interface ReportData {
    id: string;
    date: string;
    reportType: string;
    species: string;
    count: number;
    status: string;
}

interface BatchData {
    id: string;
    batchNumber: string;
    species: string;
    quantity: number;
    dateCreated: string;
    expectedDistribution: string;
    status: string;
    staffName: string;
    staffRole: string;
}

interface DistributedBatchData {
    id: string;
    batchNumber: string;
    species: string;
    quantity: number;
    dateCreated: string;
    distributionDate: string;
    beneficiaryLocation: string;
    staffName: string;
    staffRole: string;
    status: string;
}

interface BeneficiaryData {
    id: string;
    province: string;
    city: string;
    barangay: string;
    beneficiaryCount: number;
    totalFingerlings: number;
    beneficiaryName: string;
}

const FullScreenLoader: React.FC = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

// Export to CSV utility function
const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes in CSV values
                return typeof value === 'string' && value.includes(',')
                    ? `"${value.replace(/"/g, '""')}"`
                    : value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Report Filters Component
const ReportFiltersComponent: React.FC<{ onApplyFilters: (reportType: string, filters: ReportFilters) => void }> = ({ onApplyFilters }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [filters, setFilters] = useState<ReportFilters>({
        reportType: "Fingerling Count",
        species: "All Species",
        startDate: "2025-04-30",
        endDate: "2025-05-30",
        province: "All Provinces",
        city: "All Cities",
        barangay: "All Barangays"
    });

    const handleFilterChange = (field: keyof ReportFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyFilters = () => {
        console.log("Applying filters:", filters);
        onApplyFilters(filters.reportType, filters);
    };

    const handleReset = () => {
        const resetFilters = {
            reportType: "Fingerling Count",
            species: "All Species",
            startDate: "2025-04-30",
            endDate: "2025-05-30",
            province: "All Provinces",
            city: "All Cities",
            barangay: "All Barangays"
        };
        setFilters(resetFilters);
        onApplyFilters("Fingerling Count", resetFilters);
    };

    const showLocationFilters = filters.reportType === "Beneficiaries Report";

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div
                className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    <span className="font-medium">Report Filters</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                ) : (
                    <ChevronDown className="h-5 w-5" />
                )}
            </div>

            {isExpanded && (
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Report Type */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <FileText className="h-4 w-4 mr-1 text-blue-600" />
                                Report Type
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.reportType}
                                    onChange={(e) => handleFilterChange('reportType', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                >
                                    <option value="Fingerling Count">Fingerling Count</option>
                                    <option value="Undistributed Batches">Undistributed Batches</option>
                                    <option value="Distributed Batches">Distributed Batches</option>
                                    <option value="Beneficiaries Report">Beneficiaries Report</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Species */}
                        {filters.reportType !== "Beneficiaries Report" && (
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Users className="h-4 w-4 mr-1 text-blue-600" />
                                    Species
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.species}
                                        onChange={(e) => handleFilterChange('species', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                    >
                                        <option value="All Species">All Species</option>
                                        <option value="Tilapia">Tilapia</option>
                                        <option value="Catfish">Catfish</option>
                                        <option value="Carp">Carp</option>
                                        <option value="Trout">Trout</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* Location Filters for Beneficiaries Report */}
                        {showLocationFilters && (
                            <>
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                                        Province
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.province}
                                            onChange={(e) => handleFilterChange('province', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                        >
                                            <option value="All Provinces">All Provinces</option>
                                            <option value="Laguna">Laguna</option>
                                            <option value="Batangas">Batangas</option>
                                            <option value="Cavite">Cavite</option>
                                            <option value="Rizal">Rizal</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                                        City
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.city}
                                            onChange={(e) => handleFilterChange('city', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                        >
                                            <option value="All Cities">All Cities</option>
                                            <option value="Los Baños">Los Baños</option>
                                            <option value="Calamba">Calamba</option>
                                            <option value="Santa Rosa">Santa Rosa</option>
                                            <option value="Biñan">Biñan</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Start Date */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                                Start Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                                End Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleApplyFilters}
                            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 focus:outline-none"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus:ring-4 focus:ring-gray-200 focus:outline-none"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Fingerling Count Report Component
const FingerlingsCountReportView: React.FC = () => {
    const handleExportCSV = () => {
        // Sample data for fingerling count report
        const data = [
            { date: "2025-05-30", species: "Tilapia", count: 1500 },
            { date: "2025-05-29", species: "Catfish", count: 850 },
            { date: "2025-05-28", species: "Carp", count: 1200 }
        ];
        exportToCSV(data, "fingerling_count_report");
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Report Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Fingerling Count Report</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Apr 30, 2025 - May 30, 2025</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-200 focus:outline-none"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </button>
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="p-6">
                <div className="text-center py-16">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No data found for the selected filters</h4>
                        <p className="text-gray-500 mb-6">
                            There are no fingerling count records available for the date range and filters you've selected.
                        </p>
                    </div>

                    {/* Empty State Table Structure */}
                    <div className="max-w-md mx-auto">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-left">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                                    <span className="text-xs font-medium text-gray-500 uppercase">Date</span>
                                    <span className="text-xs font-medium text-gray-500 uppercase">Fingerling Count</span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <div className="flex justify-between">
                                        <span>No data</span>
                                        <span>-</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm text-gray-500">
                            Try adjusting your date range or species filter to see available data.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Undistributed Batches Report Component (Updated with Staff Names)
const UndistributedBatchesReportView: React.FC = () => {
    const sampleBatchData: BatchData[] = [
        {
            id: "1",
            batchNumber: "BTH-2025-001",
            species: "Tilapia",
            quantity: 5000,
            dateCreated: "2025-04-15",
            expectedDistribution: "2025-05-15",
            status: "Overdue",
            staffName: "Maria Santos",
            staffRole: "Production Manager"
        },
        {
            id: "2",
            batchNumber: "BTH-2025-003",
            species: "Catfish",
            quantity: 3000,
            dateCreated: "2025-04-20",
            expectedDistribution: "2025-05-20",
            status: "Pending",
            staffName: "Juan Dela Cruz",
            staffRole: "Hatchery Supervisor"
        },
        {
            id: "3",
            batchNumber: "BTH-2025-005",
            species: "Carp",
            quantity: 2500,
            dateCreated: "2025-04-25",
            expectedDistribution: "2025-05-25",
            status: "Overdue",
            staffName: "Ana Rodriguez",
            staffRole: "Aquaculture Technician"
        },
        {
            id: "4",
            batchNumber: "BTH-2025-007",
            species: "Tilapia",
            quantity: 4000,
            dateCreated: "2025-04-28",
            expectedDistribution: "2025-05-28",
            status: "Pending",
            staffName: "Carlos Mendoza",
            staffRole: "Field Coordinator"
        }
    ];

    const handleExportCSV = () => {
        const csvData = sampleBatchData.map(batch => ({
            "Batch Number": batch.batchNumber,
            "Species": batch.species,
            "Quantity": batch.quantity,
            "Date Created": batch.dateCreated,
            "Expected Distribution": batch.expectedDistribution,
            "Status": batch.status,
            "Staff Name": batch.staffName,
            "Staff Role": batch.staffRole
        }));
        exportToCSV(csvData, "undistributed_batches_report");
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Report Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Undistributed Batches Report</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Batches pending distribution</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-200 focus:outline-none"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </button>
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Distribution</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sampleBatchData.map((batch) => (
                            <tr key={batch.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{batch.batchNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.species}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.quantity.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.dateCreated}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.expectedDistribution}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{batch.staffName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{batch.staffRole}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${batch.status === 'Overdue'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {batch.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// New Distributed Batches Report Component
const DistributedBatchesReportView: React.FC = () => {
    const sampleDistributedBatchData: DistributedBatchData[] = [
        {
            id: "1",
            batchNumber: "BTH-2025-002",
            species: "Tilapia",
            quantity: 6000,
            dateCreated: "2025-04-10",
            distributionDate: "2025-05-10",
            beneficiaryLocation: "Los Baños, Laguna",
            staffName: "Elena Reyes",
            staffRole: "Distribution Coordinator",
            status: "Completed"
        },
        {
            id: "2",
            batchNumber: "BTH-2025-004",
            species: "Catfish",
            quantity: 4500,
            dateCreated: "2025-04-18",
            distributionDate: "2025-05-18",
            beneficiaryLocation: "Calamba, Laguna",
            staffName: "Roberto Cruz",
            staffRole: "Field Operations Manager",
            status: "Completed"
        },
        {
            id: "3",
            batchNumber: "BTH-2025-006",
            species: "Carp",
            quantity: 3500,
            dateCreated: "2025-04-22",
            distributionDate: "2025-05-22",
            beneficiaryLocation: "Tanauan, Batangas",
            staffName: "Sofia Garcia",
            staffRole: "Logistics Supervisor",
            status: "Completed"
        },
        {
            id: "4",
            batchNumber: "BTH-2025-008",
            species: "Tilapia",
            quantity: 5500,
            dateCreated: "2025-04-26",
            distributionDate: "2025-05-26",
            beneficiaryLocation: "Santa Rosa, Laguna",
            staffName: "Miguel Torres",
            staffRole: "Community Liaison",
            status: "Completed"
        }
    ];

    const handleExportCSV = () => {
        const csvData = sampleDistributedBatchData.map(batch => ({
            "Batch Number": batch.batchNumber,
            "Species": batch.species,
            "Quantity": batch.quantity,
            "Date Created": batch.dateCreated,
            "Distribution Date": batch.distributionDate,
            "Beneficiary Location": batch.beneficiaryLocation,
            "Staff Name": batch.staffName,
            "Staff Role": batch.staffRole,
            "Status": batch.status
        }));
        exportToCSV(csvData, "distributed_batches_report");
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Report Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Distributed Batches Report</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Successfully distributed batches</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-200 focus:outline-none"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </button>
                    <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sampleDistributedBatchData.map((batch) => (
                            <tr key={batch.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{batch.batchNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.species}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.quantity.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.dateCreated}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.distributionDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.beneficiaryLocation}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{batch.staffName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{batch.staffRole}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        {batch.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Beneficiaries Report Component
const BeneficiariesReportView: React.FC = () => {
    const sampleBeneficiaryData: BeneficiaryData[] = [
        {
            id: "1",
            province: "Laguna",
            city: "Los Baños",
            barangay: "Baybayin",
            beneficiaryCount: 25,
            totalFingerlings: 12500,
            beneficiaryName: "Farmer's Association of Baybayin"
        },
        {
            id: "2",
            province: "Laguna",
            city: "Los Baños",
            barangay: "Bambang",
            beneficiaryCount: 18,
            totalFingerlings: 9000,
            beneficiaryName: "Bambang Aquaculture Cooperative"
        },
        {
            id: "3",
            province: "Laguna",
            city: "Calamba",
            barangay: "Parian",
            beneficiaryCount: 32,
            totalFingerlings: 16000,
            beneficiaryName: "Parian Fish Farmers Group"
        },
        {
            id: "4",
            province: "Batangas",
            city: "Tanauan",
            barangay: "Poblacion",
            beneficiaryCount: 22,
            totalFingerlings: 11000,
            beneficiaryName: "Tanauan Fishery Association"
        }
    ];

    const handleExportCSV = () => {
        const csvData = sampleBeneficiaryData.map(beneficiary => ({
            "Province": beneficiary.province,
            "City": beneficiary.city,
            "Barangay": beneficiary.barangay,
            "Beneficiary Count": beneficiary.beneficiaryCount,
            "Total Fingerlings": beneficiary.totalFingerlings,
            "Beneficiary Name": beneficiary.beneficiaryName
        }));
        exportToCSV(csvData, "beneficiaries_report");
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Report Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Beneficiaries Report</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Beneficiaries per Province, City, and Barangay</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-200 focus:outline-none"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </button>
                    <div className="p-2 bg-green-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Province</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary Count</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fingerlings</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sampleBeneficiaryData.map((beneficiary) => (
                            <tr key={beneficiary.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{beneficiary.province}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{beneficiary.city}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{beneficiary.barangay}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{beneficiary.beneficiaryName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{beneficiary.beneficiaryCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{beneficiary.totalFingerlings.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Main Report Display Component
const ReportDisplay: React.FC<{ reportType: string; filters: ReportFilters }> = ({ reportType, filters }) => {
    switch (reportType) {
        case "Fingerling Count":
            return <FingerlingsCountReportView />;
        case "Undistributed Batches":
            return <UndistributedBatchesReportView />;
        case "Distributed Batches":
            return <DistributedBatchesReportView />;
        case "Beneficiaries Report":
            return <BeneficiariesReportView />;
        default:
            return <FingerlingsCountReportView />;
    }
};

const Reports: React.FC = () => {
    const { isLoading, isAuthenticated, logout } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    const { unreadCount } = useNotification();
    const [currentReportType, setCurrentReportType] = useState<string>("Fingerling Count");
    const [currentFilters, setCurrentFilters] = useState<ReportFilters>({
        reportType: "Fingerling Count",
        species: "All Species",
        startDate: "2025-04-30",
        endDate: "2025-05-30"
    });

    const handleApplyFilters = (reportType: string, filters: ReportFilters) => {
        setCurrentReportType(reportType);
        setCurrentFilters(filters);
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
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
                                <p className="text-gray-600">Generate and analyze fingerling data reports</p>
                            </div>
                        </div>

                        {/* Date and Time Display */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center text-blue-700 mb-2 sm:mb-0">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span className="font-medium">Friday, May 30, 2025</span>
                            </div>
                            <div className="flex items-center text-blue-700">
                                <span className="font-medium">02:08:30 PM</span>
                            </div>
                        </div>

                        {/* Report Filters */}
                        <ReportFiltersComponent onApplyFilters={handleApplyFilters} />

                        {/* Report Display */}
                        <ReportDisplay reportType={currentReportType} filters={currentFilters} />
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
            <Reports />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;