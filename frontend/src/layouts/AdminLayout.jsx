import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, logout } from "../utils/auth";
import { useEffect, useState } from "react";
import { getMyOrganizations } from "../api/organizations";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState(localStorage.getItem("activeOrgId") || "");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const currentUser = getUser();
        setUser(currentUser);
        if (currentUser) {
          const res = await getMyOrganizations();
          const orgs = res.data?.data || res.data || [];
          setOrganizations(orgs);

          // Default selection logic
          if (orgs.length > 0) {
            const currentStoredId = localStorage.getItem("activeOrgId");
            const activeOrg = orgs.find(o => o.id === currentStoredId);

            if (!currentStoredId || !activeOrg) {
              const defaultOrgId = orgs[0].id;
              localStorage.setItem("activeOrgId", defaultOrgId);
              setActiveOrgId(defaultOrgId);
              if (currentStoredId !== defaultOrgId) {
                window.location.reload();
              }
            } else {
              setActiveOrgId(currentStoredId);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch organizations", err);
      }
    };
    fetchOrgs();
  }, []);

  const handleOrgChange = (e) => {
    const newOrgId = e.target.value;
    localStorage.setItem("activeOrgId", newOrgId);
    setActiveOrgId(newOrgId);
    window.location.reload(); // Reload to refresh data with new org context
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-gray-900 text-white"
      : "text-gray-300 hover:bg-gray-700 hover:text-white";
  };

  const showAuditLogs = user && ["ADMIN", "AUDITOR"].includes(user.role);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white tracking-wider">TrackIT++</h2>
          <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">
            {user?.role || "Guest"}
          </p>

          {organizations.length > 0 && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Organization
              </label>
              <select
                value={activeOrgId}
                onChange={handleOrgChange}
                className="w-full bg-gray-700 text-white text-xs rounded border-none focus:ring-1 focus:ring-indigo-500 py-1"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link
            to="/"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/")}`}
          >
            Dashboard
          </Link>
          <Link
            to="/my-issues"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/my-issues")}`}
          >
            My Issues
          </Link>
          <Link
            to="/issues/pending"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/issues/pending")}`}
          >
            Pending Issues
          </Link>
          <Link
            to="/issues/closed"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/issues/closed")}`}
          >
            Closed Issues
          </Link>
          <Link
            to="/issues"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/issues")}`}
          >
            Issues Management
          </Link>

          {showAuditLogs && (
            <Link
              to="/audit-logs"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/audit-logs")}`}
            >
              System Audit Logs
            </Link>
          )}

          <Link
            to="/organizations"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/organizations")}`}
          >
            Organizations
          </Link>

          <Link
            to="/issues/create"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white`}
          >
            + Create Issue
          </Link>

          <Link
            to="/profile"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/profile")}`}
          >
            Profile
          </Link>

          <div className="pt-8 mt-8 border-t border-gray-700">
            <button
              onClick={logout}
              className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
