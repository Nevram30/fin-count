"use client";

import React, { useState, useId, FormEvent } from "react";

import Link from "next/link";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { CircleCheck, Eye, EyeOff } from "lucide-react";

import { LoginState } from "./state";
import { FormErrors, FormState } from "./types";
import { NoteOneFeature } from "../components/ui/note";
import { validateForm, loginSchema } from "../validation/loginSchema";
import Image from "next/image";
import Logo from "../../../public/image/logo.png";

const LoginPage: React.FC = () => {
    const ids = {
        password: useId(),
        email: useId(),
    };

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<FormState>(LoginState);
    const [errors, setErrors] = useState<FormErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });

        // Clear errors when field is edited
        if (errors[name as keyof typeof errors]) {
            setErrors({
                ...errors,
                [name]: undefined,
            });
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { email, password } = formData;

        const validationResult = await validateForm(loginSchema, {
            email,
            password,
        });

        if (!validationResult.isValid) {
            setErrors({
                ...errors,
                ...validationResult.errors,
            });
            return;
        }

        setIsLoading(true);

        try {
            // Attempt to sign in with credentials
            const response = await signIn("credentials", {
                redirect: false,
                ...formData,
            });

            if ((response as any).error) {
                setIsLoading(false);
                try {
                    const jsonError = JSON.parse((response as any).error);

                    // Check for specific error structure
                    if (
                        jsonError.success === false &&
                        jsonError.error &&
                        typeof jsonError.error === "object"
                    ) {
                        if (jsonError.error.password) {
                            const passwordError = jsonError.error.password;
                            setErrors({
                                ...errors,
                                password: passwordError,
                            });
                        } else {
                            // Handle other field errors
                            const newErrors: FormErrors = { ...errors };
                            let hasSetError = false;

                            // Map any other field errors to the form
                            for (const field in jsonError.error) {
                                if (field in newErrors) {
                                    newErrors[field as keyof FormErrors] = jsonError.error[field];
                                    hasSetError = true;
                                }
                            }

                            setErrors(newErrors);

                            // Show generic error toast if no specific field errors were set
                            if (!hasSetError) {
                                toast.error("Login failed. Please check your credentials.", {
                                    duration: 4000,
                                });

                                setErrors({
                                    ...errors,
                                    general:
                                        "Login failed. Please check your credentials and try again.",
                                });
                            }
                        }
                    } else {
                        setErrors({
                            ...errors,
                            general:
                                "Login failed. Please check your credentials and try again.",
                        });
                    }
                } catch (parseError) {
                    // Handle case where error is not JSON
                    toast.error("Login failed. Please try again.", {
                        duration: 4000,
                    });

                    setErrors({
                        ...errors,
                        general:
                            "Login failed. Please check your credentials and try again.",
                    });
                }
                return;
            }

            setIsLoading(false);

            toast.success("Login successful!", {
                duration: 3000,
            });
        } catch (error: any) {
            toast.error("Login failed. Please try again.", {
                duration: 4000,
            });
            setErrors({
                ...errors,
                general: "Login failed. Please check your credentials and try again.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <div className="flex flex-col justify-start mb-2">
                        <div className="w-32 h-32 rounded-full flex items-start justify-start">
                            <Image
                                src={Logo}
                                alt="FinCount Logo"
                                width={100}
                                height={100}
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            FinCount
                        </h2>
                    </div>

                    {/* <div>
                        <NoteOneFeature description="Only administrators can create new accounts. Please contact your system administrator if you need access." />
                    </div> */}

                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {errors.general}
                        </div>
                    )}

                    <p className="text-gray-600 mb-8 text-lg">Log in to access your account</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor={ids.email}
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email Address
                            </label>
                            <input
                                id={ids.email}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.email
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200"
                                    }`}
                                placeholder="your.email@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label
                                    htmlFor={ids.password}
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id={ids.password}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.password
                                        ? "border-red-500 focus:ring-red-200"
                                        : "border-gray-300 focus:ring-blue-200"
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="rememberMe"
                                className="ml-2 block text-sm text-gray-700"
                            >
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 mr-3 text-white"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Logging In...
                                </>
                            ) : (
                                "Log In"
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="hidden md:flex md:w-1/2 text-black flex-col bg-gradient-to-br from-blue-400 via-blue-500 to-blue-900 justify-center items-center p-10">
                <div className="max-w-md">
                    <div className="w-16 h-1 bg-white mb-8"></div>

                    <p className="text-4xl text-white font-semibold marker:mb-8">
                        Welcome to finCount
                    </p>
                    <p className="text-white mb-8 pt-4">
                        Your Automated fingerling Counting with Descriptive and Predictive Analytics
                    </p>
                    <div className="space-y-6 text-lg text-white font-medium">
                        <div className="flex items-start">
                            <CircleCheck className="h-6 w-6 mr-3 mt-1" />
                            <p>Real-time fingerling counting</p>
                        </div>

                        <div className="flex items-start">
                            <CircleCheck className="h-6 w-6 mr-3 mt-1" />
                            <p>Accurate harvest tracking</p>
                        </div>

                        <div className="flex items-start">
                            <CircleCheck className="h-6 w-6 mr-3 mt-1" />
                            <p>Comprehensive reporting</p>
                        </div>

                        <div className="flex items-start">
                            <CircleCheck className="h-6 w-6 mr-3 mt-1" />
                            <p>Real-time Forecasting and Trends Analytics</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

