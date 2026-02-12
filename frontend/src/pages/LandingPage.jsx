import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-wider">
                                TrackIT++
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero placeholder */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
                        Issue & Risk Governance Platform
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Track issues, manage risks, and govern your organization's workflow with enterprise-grade
                        audit logging and role-based access control.
                    </p>
                    <div className="mt-8 flex justify-center space-x-4">
                        <Link
                            to="/register"
                            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
