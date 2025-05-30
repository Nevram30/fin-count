"use client";
import React, { useState } from "react";
import { Users, Download, Filter, Calendar, ChevronDown, ChevronUp, RotateCcw, FileText } from "lucide-react";
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
}

interface ReportData {
    id: string;
    date: string;
    reportType: string;
    species: string;
    count: number;
    status: string;
}

const FullScreenLoader: React.FC = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

// Report Filters Component
const ReportFiltersComponent: React.FC<{ onApplyFilters: (reportType: string) => void }> = ({ onApplyFilters }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [filters, setFilters] = useState<ReportFilters>({
        reportType: "Fingerling Count",
        species: "All Species",
        startDate: "2025-04-30",
        endDate: "2025-05-30"
    });

    const handleFilterChange = (field: keyof ReportFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyFilters = () => {
        console.log("Applying filters:", filters);
        onApplyFilters(filters.reportType);
    };

    const handleReset = () => {
        setFilters({
            reportType: "Fingerling Count",
            species: "All Species",
            startDate: "2025-04-30",
            endDate: "2025-05-30"
        });
        onApplyFilters("Fingerling Count");
    };

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
                                    <option value="Growth Report">Growth Report</option>
                                    <option value="Mortality Report">Mortality Report</option>
                                    <option value="Feeding Report">Feeding Report</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Species */}
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
                <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
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
                            Try adjusting your date range or report type to see available data.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sample Report Data Table (Hidden when showing fingerling count report)
const ReportDataTable: React.FC<{ showFingerlingsReport: boolean }> = ({ showFingerlingsReport }) => {
    const sampleData: ReportData[] = [
        {
            id: "1",
            date: "2025-05-30",
            reportType: "Growth Report",
            species: "Tilapia",
            count: 1500,
            status: "Completed"
        },
        {
            id: "2",
            date: "2025-05-29",
            reportType: "Mortality Report",
            species: "Catfish",
            count: 850,
            status: "Completed"
        },
        {
            id: "3",
            date: "2025-05-28",
            reportType: "Feeding Report",
            species: "Tilapia",
            count: 1200,
            status: "In Progress"
        }
    ];

    if (showFingerlingsReport) {
        return <FingerlingsCountReportView />;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Report Data</h3>
                <p className="text-sm text-gray-600 mt-1">Recent report entries based on your filters</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sampleData.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.reportType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.species}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.count.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${row.status === 'Completed'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {row.status}
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

const Reports: React.FC = () => {
    const { isLoading, isAuthenticated, logout } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    const { unreadCount } = useNotification();
    const [showFingerlingsReport, setShowFingerlingsReport] = useState<boolean>(true);

    const handleExportReport = () => {
        // Add export functionality here
        console.log("Exporting report...");
        // You can implement CSV, PDF, or Excel export here
    };

    const handleApplyFilters = (reportType: string) => {
        // Show fingerling count report when that report type is selected
        setShowFingerlingsReport(reportType === "Fingerling Count");
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
                <div className="col-start-2 col-span-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
                                <p className="text-gray-600">Generate and analyze fingerling data reports</p>
                            </div>
                            <button
                                onClick={handleExportReport}
                                className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 focus:outline-none"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Report
                            </button>
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

                        {/* Report Data Table or Fingerling Count Report */}
                        <ReportDataTable showFingerlingsReport={showFingerlingsReport} />
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