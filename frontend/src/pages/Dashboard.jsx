import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { fetchIssues } from "../api/issues";
import { getUser } from "../utils/auth";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const currentUser = getUser();
        setUser(currentUser);

        const issues = await fetchIssues();

        // Calculate statistics from role-filtered issues
        const statistics = {
          total: issues.length,
          open: issues.filter((i) => i.status === "OPEN").length,
          inProgress: issues.filter((i) => i.status === "IN_PROGRESS").length,
          closed: issues.filter((i) => i.status === "CLOSED").length,
        };

        setStats(statistics);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const StatCard = ({ title, value, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {value}
            </dd>
          </div>
          <div className={`flex-shrink-0 ${color}`}>
            <div className="rounded-md p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            {user?.role === "ENGINEER"
              ? "Overview of your assigned and created issues"
              : "Enterprise Issue & Risk Management Overview"}
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading dashboard...</p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Issues" value={stats.total} color="bg-blue-600" />
              <StatCard title="Open" value={stats.open} color="bg-amber-600" />
              <StatCard title="In Progress" value={stats.inProgress} color="bg-indigo-600" />
              <StatCard title="Closed" value={stats.closed} color="bg-green-600" />
            </div>

            {stats.total === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No issues</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user?.role === "ENGINEER"
                    ? "You have no issues assigned or created yet."
                    : "Get started by creating a new issue."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
