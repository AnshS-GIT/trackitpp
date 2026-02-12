import { Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Issues from "../pages/Issues";
import MyIssues from "../pages/MyIssues";
import PendingIssues from "../pages/PendingIssues";
import ClosedIssues from "../pages/ClosedIssues";
import Profile from "../pages/Profile";
import AuditLogs from "../pages/AuditLogs";
import CreateIssue from "../pages/CreateIssue";
import Organizations from "../pages/Organizations";
import JoinOrganization from "../pages/JoinOrganization";
import NotFound from "../pages/NotFound";

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
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
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
        path="/issues/pending"
        element={
          <ProtectedRoute>
            <PendingIssues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/issues/closed"
        element={
          <ProtectedRoute>
            <ClosedIssues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/issues/create"
        element={
          <ProtectedRoute>
            <CreateIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations"
        element={
          <ProtectedRoute>
            <Organizations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/join"
        element={
          <ProtectedRoute>
            <JoinOrganization />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
