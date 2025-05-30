"use client";

import { FC } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminRegistration from "@/app/components/admin.registration";

type UserType = "admin"

const REGISTRATION_COMPONENTS: Record<UserType, FC<{ userType: string }>> = {
    admin: AdminRegistration,
};

// Helper function to format user type display text
const formatUserType = (type: string): string => {
    if (type === "guidance") return "Guidance Counselor";
    return type.charAt(0).toUpperCase() + type.slice(1);
};

// Extracted invalid user type component for better organization
const InvalidUserType: FC<{ userType: string }> = ({ userType }) => (
    <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid User Type</h2>
        <p className="mb-4">The user type "{userType}" is not recognized.</p>
        <Link
            href="/select-user"
            className="text-blue-600 hover:text-blue-800 font-medium"
        >
            ← Return to user selection
        </Link>
    </div>
);

// Extracted user type banner component for better organization
const UserTypeBanner: FC<{ userType: string }> = ({ userType }) => (
    <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg border border-blue-100 flex items-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <span>
                You are registering as a <strong>{formatUserType(userType)}</strong>
            </span>
        </div>
    </div>
);

export default function RegisterPage() {
    // Destructure userType from params for cleaner code
    const { userType } = useParams() as { userType: string };
    // Look up the appropriate registration component
    const RegistrationComponent = REGISTRATION_COMPONENTS[userType as UserType];

    return (
        <div className="p-4">
            {userType && <UserTypeBanner userType={userType} />}
            {RegistrationComponent ? (
                <RegistrationComponent userType={userType} />
            ) : (
                <InvalidUserType userType={userType} />
            )}
        </div>
    );
}
