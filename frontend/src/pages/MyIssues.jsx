import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { fetchIssues } from "../api/issues";
import { getMyOrganizations } from "../api/organizations";
import { getUser } from "../utils/auth";

export default function MyIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");
    const [currentUser, setCurrentUser] = useState(null);
    const [orgName, setOrgName] = useState("");

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    /* Reset page when tab changes? 
       Note: Tabs are client-side filters on the FETCHED page. 
       Use case: User fetches page 1. It has 10 items. 
       User clicks "Open". It shows only open items FROM PAGE 1.
       This is consistent with Issues.jsx.
       Specific requirement: "Reset page to 1 when filters/search change".
       Here tabs act as filters.
    */
    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const user = getUser();
                setCurrentUser(user);

                const activeOrgId = localStorage.getItem("activeOrgId");
                if (activeOrgId) {
                    const orgsRes = await getMyOrganizations();
                    const orgs = orgsRes.data?.data || orgsRes.data || [];
                    const org = orgs.find(o => o.id === activeOrgId);
                    if (org) setOrgName(org.name);
                }

                const response = await fetchIssues(page, limit);

                if (response.data) {
                    setIssues(response.data);
                    if (response.pagination) {
                        setTotalPages(response.pagination.totalPages);
                        setTotalItems(response.pagination.total);
                    }
                } else {
                    setIssues(Array.isArray(response) ? response : []);
                }
            } catch (err) {
                setError("Failed to load your issues");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [page, limit]);

    const getSubtitle = () => {
        if (!currentUser) return "";
        switch (currentUser.role) {
            case "ENGINEER":
                return "Issues assigned to or created by you";
            case "MANAGER":
            case "ADMIN":
                return "Issues you are responsible for";
            case "AUDITOR":
                return "Issues visible to you";
            default:
                return "Issues assigned to or created by you";
        }
    };

    const filteredIssues = issues.filter((issue) => {
        if (activeTab === "ALL") return true;
        if (activeTab === "OPEN") return issue.status === "OPEN";
        if (activeTab === "IN_PROGRESS") return issue.status === "IN_PROGRESS";
        if (activeTab === "CLOSED") return issue.status === "RESOLVED" || issue.status === "CLOSED";
        return true;
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

    const tabs = [
        { id: "ALL", label: "All" },
        { id: "OPEN", label: "Open" },
        { id: "IN_PROGRESS", label: "In Progress" },
        { id: "CLOSED", label: "Closed" },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Issues</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        {getSubtitle()} {orgName && `• ${orgName}`}
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }
                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                import LoadingSpinner from "../components/LoadingSpinner";
                // ... imports

                // inside component return
                {loading && <LoadingSpinner message="Loading your issues..." />}
                {error && <p className="text-red-600 font-medium">{error}</p>}

                {!loading && !error && filteredIssues.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No issues found matching assignment or criteria.</p>
                    </div>
                )}

                {!loading && !error && filteredIssues.length > 0 && (
                    <>
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

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow mt-4">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing page <span className="font-medium">{page}</span> of{" "}
                                        <span className="font-medium">{totalPages}</span> ({totalItems} total issues)
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {!error && Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === p
                                                    ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
