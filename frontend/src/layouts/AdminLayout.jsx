import { Link, useLocation } from "react-router-dom";
import { getUser, logout } from "../utils/auth";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

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
