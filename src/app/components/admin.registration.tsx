"use client";

import { useState, ChangeEvent } from "react";

import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { AdminProps, FormErrorsState } from "./types/data.types";
import { validateForm } from "../validation/admin.validation";
import { initialState } from "./data/constant";

type AdminRegistrationProps = {
    userType: string;
};

const AdminRegistration: React.FC<AdminRegistrationProps> = (props) => {
    const router = useRouter();

    const [formData, setFormData] = useState<AdminProps>(initialState);
    const [errors, setErrors] = useState<FormErrorsState>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const validateFormAndUpdateErrors = async (): Promise<boolean> => {
        const { isValid, errors } = await validateForm(formData);
        setErrors(errors);
        return isValid;
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (await validateFormAndUpdateErrors()) {
            setIsSubmitting(true);

            setTimeout(() => {
                setIsSubmitting(false);
                setRegistrationSuccess(true);
            }, 1500);

            const loadingToastId = toast.loading("Registering your account...");

            try {
                setIsSubmitting(true);

                const payload = {
                    email: formData.email,
                    password: formData.password,
                    userType: props.userType,
                };

                if (props.userType === "admin") {
                    Object.assign(payload, {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                    });
                }

                const response = await axios.post("/api/user", payload);

                if (response.data.success) {
                    toast.dismiss(loadingToastId);
                    toast.success("Registration successful! Redirecting to login...", {
                        duration: 4000,
                        style: {
                            background: "#4CAF50",
                            color: "#FFFFFF",
                        },
                        icon: "👍",
                    });

                    setFormData(initialState);

                    setTimeout(() => {
                        router.push("/signin");
                    }, 3000);
                } else {
                    throw new Error(response.data.error || "Registration failed");
                }
            } catch (error: any) {
                console.error("Error submitting form:", error);

                toast.dismiss(loadingToastId);

                if (error.response && error.response.data) {
                    const errorMessage =
                        error.response.data.error || "Registration failed";

                    if (errorMessage.includes("Email already exists")) {
                        setErrors((prevErrors) => ({
                            ...prevErrors,
                            email:
                                "This email is already registered. Please use a different email or try to sign in.",
                        }));

                        toast.error("This email is already registered.", {
                            style: {
                                background: "#FF5252",
                                color: "#FFFFFF",
                            },
                            icon: "📧",
                        });
                    } else {
                        toast.error(`Registration failed: ${errorMessage}`, {
                            style: {
                                background: "#FF5252",
                                color: "#FFFFFF",
                            },
                        });
                    }
                } else if (error.message) {
                    toast.error(`Registration failed: ${error.message}`);
                } else {
                    toast.error("Registration failed. Please try again.");
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (registrationSuccess) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-8">
                <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto"></div>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">
                        Registration Successful!
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Your admin account has been created. An email has been sent to{" "}
                        {formData.email} with further instructions.
                    </p>
                    <button
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                        onClick={() => (window.location.href = "/admin/signin")}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-start">
                Admin Registration
            </h2>

            <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md text-sm ${errors.firstName ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {errors.firstName && (
                            <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md text-sm ${errors.lastName ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {errors.lastName && (
                            <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${errors.email ? "border-red-500" : "border-gray-300"
                            }`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md text-sm ${errors.password ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                        clipRule="evenodd"
                                    />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                        fillRule="evenodd"
                                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 8 characters and include uppercase,
                        lowercase, and numbers
                    </p>
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md text-sm ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                        clipRule="evenodd"
                                    />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                        fillRule="evenodd"
                                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                <div className="mb-6">
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            id="agreeToTerms"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="agreeToTerms"
                            className="ml-2 block text-sm text-gray-700"
                        >
                            I agree to the{" "}
                            <span className="text-blue-600 hover:underline cursor-pointer">
                                Terms and Conditions
                            </span>{" "}
                            and{" "}
                            <span className="text-blue-600 hover:underline cursor-pointer">
                                Privacy Policy
                            </span>
                        </label>
                    </div>
                    {errors.agreeToTerms && (
                        <p className="mt-1 text-xs text-red-500">{errors.agreeToTerms}</p>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
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
                            Processing...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </button>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <span className="text-blue-600 hover:underline cursor-pointer">
                            <Link href="/signin">Sign in</Link>
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminRegistration;
