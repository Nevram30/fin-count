'use client'

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react'

import axios from 'axios'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

import { validateStaffForm } from '../validation/staff.validation'
import { FilePreviewForStaff, StaffFormErrors, StaffRegistrationForm } from './types/data.types'
import { InitialStaffFormState } from './data/constant'



interface GuidanceRegisterPageProps {
    userType: string
}

const StaffRegisterPage: React.FC<GuidanceRegisterPageProps> = (props) => {
    const router = useRouter()
    const [formData, setFormData] = useState<StaffRegistrationForm>(InitialStaffFormState);
    const [errors, setErrors] = useState<StaffFormErrors>({});
    const [filePreview, setFilePreview] = useState<FilePreviewForStaff>({
        profilePhoto: null
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    useEffect(() => {
        return () => {
            if (filePreview.profilePhoto) {
                URL.revokeObjectURL(filePreview.profilePhoto);
            }
        };
    }, [filePreview]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error when field is edited
        if (errors[name as keyof StaffRegistrationForm]) {
            setErrors({
                ...errors,
                [name]: undefined
            });
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;

        if (files && files.length > 0) {
            const file = files[0];
            setFormData({
                ...formData,
                [name]: file
            });

            // Generate preview
            const fileUrl = URL.createObjectURL(file);
            setFilePreview({
                ...filePreview,
                [name]: fileUrl
            });

            // Clear error
            if (errors[name as keyof StaffRegistrationForm]) {
                setErrors({
                    ...errors,
                    [name]: undefined
                });
            }
        }
    };

    const validateForm = async (): Promise<boolean> => {
        const validationErrors = await validateStaffForm(formData);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isValid = await validateForm();
        if (!isValid) {
            return;
        }

        const loadingToastId = toast.loading('Registering your account...');

        try {
            setIsSubmitting(true);

            const payload = {
                email: formData.email,
                password: formData.password,
                userType: props.userType
            };

            if (props.userType === 'guidance') {
                Object.assign(payload, {
                    fullName: formData.fullName,
                    username: formData.username,
                    phoneNumber: formData.phoneNumber,
                    profilePhoto: filePreview.profilePhoto
                });
            }

            const response = await axios.post('/api/user', payload);

            if (response.data.success) {

                toast.dismiss(loadingToastId);

                toast.success('Registration successful! Redirecting to login...', {
                    duration: 4000,
                    style: {
                        background: '#4CAF50',
                        color: '#FFFFFF',
                    },
                    icon: '👍',
                });

                setFormData(InitialStaffFormState);

                if (filePreview.profilePhoto) {
                    URL.revokeObjectURL(filePreview.profilePhoto);
                }

                setFilePreview({
                    profilePhoto: null
                });

                // Redirect to exam after a brief delay to allow the user to see the success message
                setTimeout(() => {
                    router.push('/signin');
                }, 3000);
            } else {
                throw new Error(response.data.error || 'Registration failed');
            }
        } catch (error: any) {

            console.error('Error submitting form:', error);

            toast.dismiss(loadingToastId);

            if (error.response && error.response.data) {
                const errorMessage = error.response.data.error || 'Registration failed';

                if (errorMessage.includes('Email already exists')) {
                    setErrors(prevErrors => ({
                        ...prevErrors,
                        email: 'This email is already registered. Please use a different email or try to sign in.'
                    }));

                    toast.error('This email is already registered.', {
                        style: {
                            background: '#FF5252',
                            color: '#FFFFFF',
                        },
                        icon: '📧',
                    });
                } else {
                    toast.error(`Registration failed: ${errorMessage}`, {
                        style: {
                            background: '#FF5252',
                            color: '#FFFFFF',
                        },
                    });
                }
            } else if (error.message) {
                toast.error(`Registration failed: ${error.message}`);
            } else {
                toast.error('Registration failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Guidance Counselor Registration</h2>
                    <p className="text-gray-600 text-center mb-6">
                        Complete the form below to register as a guidance counselor
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'}`}
                                placeholder="Enter your full name"
                            />
                            {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'}`}
                                placeholder="Choose a username"
                            />
                            {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'}`}
                                placeholder="Enter your email address"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.phoneNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'}`}
                                placeholder="Enter your phone number"
                            />
                            {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'}`}
                                    placeholder="Create a password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                            <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters with uppercase, lowercase, and numbers</p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'}`}
                                placeholder="Confirm your password"
                            />
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                        </div>

                        {/* Profile Photo */}
                        <div className="pt-4 border-t border-gray-200">
                            <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700 mb-1">Profile Photo *</label>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="file"
                                    id="profilePhoto"
                                    name="profilePhoto"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.profilePhoto ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'}`}
                                />
                                {filePreview.profilePhoto && (
                                    <div className="relative h-16 w-16 rounded-full overflow-hidden border border-gray-300">
                                        <Image
                                            src={filePreview.profilePhoto}
                                            alt="Profile preview"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>
                            {errors.profilePhoto && <p className="mt-1 text-sm text-red-500">{errors.profilePhoto}</p>}
                            <p className="mt-1 text-xs text-gray-500">Upload a professional photo (JPG, PNG, max 2MB)</p>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition duration-300 shadow-md flex items-center justify-center disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Registering...
                                    </>
                                ) : "Register as Guidance Counselor"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default StaffRegisterPage