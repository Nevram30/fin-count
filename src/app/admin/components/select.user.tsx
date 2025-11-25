"use client";

import React, { useState, ChangeEvent } from "react";


import AdminRegistration from "./admin.registration";
import StaffRegisterPage from "./staff.registration";

const UserSelectPage = () => {
    const [selectedUserType, setSelectedUserType] = useState<string>("");
    const handleUserTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedUserType(e.target.value);
    };

    return (
        <div className="flex flex-col">
            <main className="flex items-start justify-start p-4">
                <div className="w-full overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="flex flex-col justify-center px-1 py-1 w-full">
                            <div className="space-y-6">
                                <div className="relative">
                                    <label
                                        htmlFor="userType"
                                        className="block text-md font-medium text-gray-700 mb-2"
                                    >
                                        User as:
                                    </label>

                                    <select
                                        id="userType"
                                        value={selectedUserType}
                                        onChange={handleUserTypeChange}
                                        className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                    >
                                        <option value="">-- Add users role --</option>
                                        <option value="admin">admin</option>
                                    </select>

                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 pt-6">
                                        <svg
                                            className="h-5 w-5 text-gray-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {selectedUserType && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            Selected role: <span className="font-medium">{selectedUserType}</span>
                                        </p>
                                    </div>
                                )}

                                {selectedUserType === "admin" ? (
                                    <AdminRegistration userType={selectedUserType} />
                                ) : selectedUserType === "staff" ? (
                                    <StaffRegisterPage userType={selectedUserType} />
                                ) : null}

                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserSelectPage;