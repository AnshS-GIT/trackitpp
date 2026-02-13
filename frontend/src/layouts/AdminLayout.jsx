import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, logout } from "../utils/auth";
import { useEffect, useState } from "react";
import { getMyOrganizations } from "../api/organizations";
import { getMyInvitations } from "../api/invitations";
import { useTheme } from "../context/ThemeContext";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState(localStorage.getItem("activeOrgId") || "");
  const [activeOrgVisibility, setActiveOrgVisibility] = useState(null);
  const [invitationCount, setInvitationCount] = useState(0);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
              setActiveOrgVisibility(orgs[0].visibility);
              if (currentStoredId !== defaultOrgId) {
                window.location.reload();
              }
            } else {
              setActiveOrgId(currentStoredId);
              setActiveOrgVisibility(activeOrg.visibility);
            }
          }

          // Fetch invitation count
          try {
            const invRes = await getMyInvitations();
            const invitations = invRes.data || [];
            setInvitationCount(invitations.length);
          } catch (invErr) {
            // Silently fail — notifications are non-critical
          }
        }
      } catch (err) {

      }
    };
    fetchOrgs();
  }, []);

  const handleOrgChange = (e) => {
    const newOrgId = e.target.value;
    localStorage.setItem("activeOrgId", newOrgId);
    setActiveOrgId(newOrgId);
    window.location.reload();
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-gray-900 text-white dark:bg-gray-700"
      : "text-gray-300 hover:bg-gray-700 hover:text-white";
  };

  const showAuditLogs = user && ["ADMIN", "AUDITOR"].includes(user.role);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 dark:bg-gray-950 flex-shrink-0">
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
                className="w-full bg-gray-700 dark:bg-gray-800 text-white text-xs rounded border-none focus:ring-1 focus:ring-indigo-500 py-1"
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
            to="/dashboard"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/dashboard")}`}
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


          {!(user?.role === "MEMBER" && activeOrgVisibility === "PRIVATE") && (
            <Link
              to="/organizations"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/organizations")}`}
            >
              Organizations
            </Link>
          )}

          <Link
            to="/notifications"
            className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${isActive("/notifications")}`}
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
            </span>
            {invitationCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {invitationCount}
              </span>
            )}
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
              onClick={toggleTheme}
              className="w-full group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors mb-2"
            >
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
              <div className={`relative w-10 h-5 rounded-full transition-colors ${theme === "dark" ? "bg-blue-600" : "bg-gray-600"}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`} />
              </div>
            </button>
            <button
              onClick={logout}
              className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </aside>


      <main className="flex-1 p-8 overflow-auto bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {children}
      </main>
    </div>
  );
}
