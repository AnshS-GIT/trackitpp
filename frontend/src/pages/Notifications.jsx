import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { getMyInvitations, acceptInvitation, declineInvitation } from "../api/invitations";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../context/ToastContext";

export default function Notifications() {
    const toast = useToast();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // tracks which invitation is being acted on

    useEffect(() => {
        loadInvitations();
    }, []);

    const loadInvitations = async () => {
        try {
            const res = await getMyInvitations();
            setInvitations(res.data || []);
        } catch (err) {
            // Global interceptor handles errors
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        setActionLoading(id);
        try {
            await acceptInvitation(id);
            toast.success("Invitation accepted! You have joined the organization.");
            setInvitations((prev) => prev.filter((inv) => inv.id !== id));
        } catch (err) {
            // Global handled
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async (id) => {
        setActionLoading(id);
        try {
            await declineInvitation(id);
            toast.info("Invitation declined.");
            setInvitations((prev) => prev.filter((inv) => inv.id !== id));
        } catch (err) {
            // Global handled
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Notifications
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Pending organization invitations
                    </p>
                </div>

                {loading ? (
                    <LoadingSpinner message="Loading notifications..." />
                ) : invitations.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
                        <div className="text-5xl mb-4">🔔</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No pending invitations
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            When someone invites you to an organization, it will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {invitations.map((inv) => (
                            <div
                                key={inv.id}
                                className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 flex items-center justify-between border-l-4 border-blue-500"
                            >
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                        {inv.organization.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Invited by{" "}
                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                            {inv.invitedBy.name}
                                        </span>{" "}
                                        ({inv.invitedBy.email})
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                            Role: {inv.role}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(inv.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleDecline(inv.id)}
                                        disabled={actionLoading === inv.id}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                    >
                                        {actionLoading === inv.id ? "..." : "Decline"}
                                    </button>
                                    <button
                                        onClick={() => handleAccept(inv.id)}
                                        disabled={actionLoading === inv.id}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                                    >
                                        {actionLoading === inv.id && (
                                            <svg
                                                className="animate-spin h-4 w-4 text-white"
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
                                        )}
                                        Accept
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
