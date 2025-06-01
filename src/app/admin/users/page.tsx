"use client";
import FullScreenLoader from "@/app/components/ui/fullscreen.loader";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";
import { Users, Edit, Trash2, Mail, Shield, User, Calendar } from "lucide-react";
import React, { useState, useEffect } from "react";
import AsideNavigation from "../components/aside.navigation";
import { LogoutProvider } from "@/app/context/logout";
import { LogoutModal } from "@/app/components/logout.modal";
import SelectUser from "../components/select.user";

interface User {
    id: number;
    name: string;
    email: string;
    userType: string;
    status: string;
    username?: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
    updatedAt: string;
}

interface UsersResponse {
    success: boolean;
    data: {
        users: User[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalUsers: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    };
}

const UsersTable: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });

    const fetchUsers = async (page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/user?page=${page}&limit=10`);

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const result: UsersResponse = await response.json();

            if (result.success) {
                setUsers(result.data.users);
                setPagination(result.data.pagination);
            } else {
                throw new Error('Failed to load users');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getRoleBadgeColor = (userType: string) => {
        switch (userType.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'staff':
                return 'bg-yellow-100 text-yellow-800';
            case 'student':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800';
    };

    const handleEdit = (userId: number) => {
        // Implement edit functionality - could open a modal or navigate to edit page
        console.log('Edit user:', userId);
        // Example: router.push(`/admin/users/${userId}/edit`);
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`/api/user/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            const result = await response.json();

            if (result.success) {
                // Refresh the users list
                fetchUsers(pagination.currentPage);
                // Show success message (you might want to use a toast notification)
                alert('User deleted successfully');
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (err) {
            alert('Error deleting user: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                    <div className="text-red-500 mb-4">
                        <Users className="h-12 w-12 mx-auto mb-2" />
                        <h3 className="text-lg font-medium">Error Loading Users</h3>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                    <button
                        onClick={() => fetchUsers()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                            <Users className="h-5 w-5 mr-2" />
                            Existing Users
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage and view all registered users in the system
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: {pagination.totalUsers} users
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Additional Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-500" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <Mail className="h-3 w-3 mr-1" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.userType)}`}>
                                        <Shield className="h-3 w-3 mr-1" />
                                        {user.userType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                                        <div className={`h-1.5 w-1.5 rounded-full mr-1 ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.userType === 'staff' && user.username && (
                                        <div className="space-y-1">
                                            <div>@{user.username}</div>
                                            {user.phoneNumber && (
                                                <div className="text-xs text-gray-400">{user.phoneNumber}</div>
                                            )}
                                        </div>
                                    )}
                                    {user.userType === 'admin' && user.firstName && (
                                        <div className="text-xs text-gray-400">
                                            Admin Profile
                                        </div>
                                    )}
                                    {user.userType === 'student' && (
                                        <div className="text-xs text-gray-400">
                                            Student Account
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(user.id)}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150"
                                            title="Edit user"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                                            title="Delete user"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && !loading && !error && (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">Get started by adding your first user above.</p>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => fetchUsers(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchUsers(pagination.currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                                    <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalUsers} total users)
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => fetchUsers(pagination.currentPage - 1)}
                                        disabled={!pagination.hasPrevPage}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => fetchUsers(pagination.currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AddUserPage: React.FC = () => {
    const { isLoading, isAuthenticated, logout } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    const { unreadCount } = useNotification();

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
                <main className="col-start-1 sm:col-start-1 md:col-start-1 lg:col-start-2 xl:col-start-2 col-span-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-5 pt-20 pb-8 sm:px-6 sm:py-8">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Admin Panel</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-sm text-blue-600">User Management</span>
                            </div>
                        </div>

                        {/* Add New User Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-5 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-700">
                                    Add New User
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Select user role and fill in the details to create a new user account
                                </p>
                            </div>
                            <SelectUser />
                        </div>

                        {/* Existing Users Table */}
                        <UsersTable />
                    </div>
                </main>
            </div>
        </>
    );
};

// Main App Component with LogoutProvider wrapper
const App: React.FC = () => {
    return (
        <LogoutProvider>
            <AddUserPage />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;