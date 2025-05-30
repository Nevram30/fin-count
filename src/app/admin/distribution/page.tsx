"use client";

import React, { useState } from "react";
import { Users, User, Calendar, MapPin, Building2, FileText, Save, AlertCircle, CheckCircle } from "lucide-react";
import AsideNavigation from "../components/aside.navigation";
import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";

// Types
interface DistributionForm {
    firstname: string;
    lastname: string;
    date: string;
    location: string;
    facilityType: 'Fish Cage' | 'Pond' | '';
    details: string;
}

interface FormErrors {
    firstname?: string;
    lastname?: string;
    date?: string;
    location?: string;
    facilityType?: string;
    details?: string;
}

const FullScreenLoader = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

const Distribution: React.FC = () => {
    const { isLoading, isAuthenticated, logout } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    const { unreadCount } = useNotification();

    // Form state
    const [formData, setFormData] = useState<DistributionForm>({
        firstname: '',
        lastname: '',
        date: '',
        location: 'Prk',
        facilityType: '',
        details: ''
    });

    // Form validation and UI state
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Location options
    const locationOptions = [
        'Prk',
        'Northern Region',
        'Southern Region',
        'Eastern Region',
        'Western Region',
        'Central Region',
        'Coastal Area'
    ];

    // Handle input changes
    const handleInputChange = (field: keyof DistributionForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    // Handle facility type radio change
    const handleFacilityTypeChange = (value: 'Fish Cage' | 'Pond') => {
        setFormData(prev => ({
            ...prev,
            facilityType: value
        }));

        if (errors.facilityType) {
            setErrors(prev => ({
                ...prev,
                facilityType: undefined
            }));
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.firstname.trim()) {
            newErrors.firstname = 'Firstname is required';
        }

        if (!formData.lastname.trim()) {
            newErrors.lastname = 'Lastname is required';
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        if (!formData.location) {
            newErrors.location = 'Location is required';
        }

        if (!formData.facilityType) {
            newErrors.facilityType = 'Facility type is required';
        }

        if (!formData.details.trim()) {
            newErrors.details = 'Details are required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success message
            setShowSuccess(true);

            // Reset form after success
            setTimeout(() => {
                setFormData({
                    firstname: '',
                    lastname: '',
                    date: '',
                    location: 'Prk',
                    facilityType: '',
                    details: ''
                });
                setShowSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Error saving distribution:', error);
        } finally {
            setIsSubmitting(false);
        }
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
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        {/* Success Message */}
                        {showSuccess && (
                            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <p className="text-green-800 font-medium">Distribution saved successfully!</p>
                            </div>
                        )}

                        {/* New Distribution Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                        <Users className="h-4 w-4 text-white" />
                                    </div>
                                    <h1 className="text-xl font-semibold text-gray-900">New Distribution</h1>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* First Row - Firstname and Location */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Firstname */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                <User className="h-4 w-4" />
                                                Firstname
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.firstname}
                                                onChange={(e) => handleInputChange('firstname', e.target.value)}
                                                placeholder="Enter firstname"
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.firstname ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {errors.firstname && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm text-red-600">{errors.firstname}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                <MapPin className="h-4 w-4" />
                                                Location
                                            </label>
                                            <select
                                                value={formData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            >
                                                {locationOptions.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                            {errors.location && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm text-red-600">{errors.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Second Row - Lastname and Facility Type */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Lastname */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                <User className="h-4 w-4" />
                                                Lastname
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.lastname}
                                                onChange={(e) => handleInputChange('lastname', e.target.value)}
                                                placeholder="Enter lastname"
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.lastname ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {errors.lastname && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm text-red-600">{errors.lastname}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Facility Type */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                                <Building2 className="h-4 w-4" />
                                                Facility Type
                                            </label>
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="facilityType"
                                                        value="Fish Cage"
                                                        checked={formData.facilityType === 'Fish Cage'}
                                                        onChange={() => handleFacilityTypeChange('Fish Cage')}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">Fish Cage</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="facilityType"
                                                        value="Pond"
                                                        checked={formData.facilityType === 'Pond'}
                                                        onChange={() => handleFacilityTypeChange('Pond')}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">Pond</span>
                                                </label>
                                            </div>
                                            {errors.facilityType && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm text-red-600">{errors.facilityType}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Third Row - Date and Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Date */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                <Calendar className="h-4 w-4" />
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => handleInputChange('date', e.target.value)}
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {errors.date && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm text-red-600">{errors.date}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                <FileText className="h-4 w-4" />
                                                Details
                                            </label>
                                            <textarea
                                                value={formData.details}
                                                onChange={(e) => handleInputChange('details', e.target.value)}
                                                placeholder="Enter additional details"
                                                rows={4}
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${errors.details ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {errors.details && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm text-red-600">{errors.details}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-center pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg transition-colors duration-300 flex items-center gap-2 font-medium"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Save Distribution
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
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
            <Distribution />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;