import { Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Issues from "../pages/Issues";
import MyIssues from "../pages/MyIssues";
import AuditLogs from "../pages/AuditLogs";

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/issues"
        element={
          <ProtectedRoute>
            <Issues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-issues"
        element={
          <ProtectedRoute>
            <MyIssues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <AuditLogs />
          </ProtectedRoute>
        }
      />

      {/* Catch all redirect to home (which then redirects to login if needed) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
