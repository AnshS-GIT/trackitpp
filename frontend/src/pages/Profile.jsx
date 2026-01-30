import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { fetchIssues } from "../api/issues";
import { getUser } from "../utils/auth";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = getUser();
                setUser(currentUser);

                const data = await fetchIssues();
                setIssues(data);
            } catch (err) {
                setError("Failed to load profile data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const getSubtitle = () => {
        if (!user) return "";
        switch (user.role) {
            case "ENGINEER":
                return "Your work and contributions";
            case "MANAGER":
            case "ADMIN":
                return "Your responsibilities and oversight";
            case "AUDITOR":
                return "Read-only system access";
            default:
                return "User Profile";
        }
    };

    const calculateStats = () => {
        const total = issues.length;
        const pending = issues.filter((i) =>
            ["OPEN", "IN_PROGRESS"].includes(i.status)
        ).length;
        const closed = issues.filter((i) =>
            ["RESOLVED", "CLOSED"].includes(i.status)
        ).length;

        return { total, pending, closed };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <AdminLayout>
                <div className="p-8 text-gray-500">Loading profile...</div>
            </AdminLayout>
        );
    }

    if (!user) {
        return (
            <AdminLayout>
                <div className="p-8 text-red-500">Error loading user profile.</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="bg-gray-800 h-32"></div>
                    <div className="px-6 pb-6">
                        <div className="relative flex items-end -mt-12 mb-4">
                            <div className="h-24 w-24 rounded-full ring-4 ring-white bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4 mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>
                        <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {user.role}
                            </span>
                            <p className="mt-2 text-sm text-gray-600">
                                {getSubtitle()}
                            </p>
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-600 font-medium">{error}</p>}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Issues
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {stats.total}
                        </dd>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            Pending Issues
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-amber-600">
                            {stats.pending}
                        </dd>
                        <p className="mt-1 text-xs text-amber-500">Open & In Progress</p>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            Closed Issues
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600">
                            {stats.closed}
                        </dd>
                        <p className="mt-1 text-xs text-green-500">Resolved & Closed</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
