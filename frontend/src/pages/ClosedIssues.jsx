import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { fetchIssues } from "../api/issues";
import { getMyOrganizations } from "../api/organizations";

export default function ClosedIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [orgName, setOrgName] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const activeOrgId = localStorage.getItem("activeOrgId");
                if (activeOrgId) {
                    const orgsRes = await getMyOrganizations();
                    const org = orgsRes.data.find(o => o.id === activeOrgId);
                    if (org) setOrgName(org.name);
                }
                const data = await fetchIssues();
                setIssues(data);
            } catch (err) {
                setError("Failed to load closed issues");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const filteredIssues = issues.filter((issue) => {
        return issue.status === "RESOLVED" || issue.status === "CLOSED";
    });

    const getStatusBadge = (status) => {
        const styles = {
            OPEN: "bg-blue-100 text-blue-800",
            IN_PROGRESS: "bg-amber-100 text-amber-800",
            RESOLVED: "bg-green-100 text-green-800",
            CLOSED: "bg-slate-100 text-slate-800",
        };
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"
                    }`}
            >
                {status.replace("_", " ")}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            HIGH: "bg-red-100 text-red-800",
            MEDIUM: "bg-yellow-100 text-yellow-800",
            LOW: "bg-green-100 text-green-800",
        };
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority] || "bg-gray-100 text-gray-800"
                    }`}
            >
                {priority}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Closed Issues</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Issues that have been resolved or closed {orgName && `at ${orgName}`}
                    </p>
                </div>

                {loading && <p className="text-gray-500">Loading issues...</p>}
                {error && <p className="text-red-600 font-medium">{error}</p>}

                {!loading && !error && filteredIssues.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No closed issues found.</p>
                    </div>
                )}

                {!loading && !error && filteredIssues.length > 0 && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredIssues.map((issue) => (
                                        <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {issue.title}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(issue.status)}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPriorityBadge(issue.priority)}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {issue.createdBy?.name || "Unknown"}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {issue.assignedTo?.name || "Unassigned"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
