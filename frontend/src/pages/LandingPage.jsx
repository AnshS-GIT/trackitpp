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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Navbar */}
            <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl">🛡️</span>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                TrackIT<span className="text-blue-600">++</span>
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mb-8">
                        Enterprise-Grade Governance Platform
                    </div>

                    {/* Headline */}
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                        TrackIT++ —{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Secure Multi-Tenant
                        </span>{" "}
                        Issue & Collaboration Platform
                    </h2>

                    {/* Subtitle */}
                    <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Built for teams that need{" "}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">multi-tenancy</span> with
                        full organization isolation,{" "}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">role-based access control</span> to
                        enforce permissions at every level, and{" "}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">immutable audit logging</span> for
                        complete operational transparency.
                    </p>

                    {/* CTAs */}
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                        >
                            Get Started
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            Login
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Multi-Tenant Isolation
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Role-Based Access
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Immutable Audit Logs
                        </span>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section header */}
                    <div className="text-center mb-16">
                        <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                            Core Features
                        </h3>
                        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Everything you need to manage issues, enforce governance, and maintain accountability.
                        </p>
                    </div>

                    {/* Feature grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Multi-Tenant Organizations</h4>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Create and join isolated organizations. Each tenant operates independently with its own data, members, and configuration.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Role-Based Access Control</h4>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Fine-grained permissions with Owner, Admin, Manager, Engineer, and Auditor roles. Every action is permissioned.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Issue Lifecycle Management</h4>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Track issues from creation to closure with status workflows, priority levels, and assignment management.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Immutable Audit Logging</h4>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Every action is recorded — assignments, status changes, and membership events — providing a tamper-proof audit trail.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Invite & Collaboration</h4>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Onboard team members via invite codes or direct invitations. Manage roles and visibility per organization.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Contribution Recognition</h4>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Engineers can submit proof-of-work for resolved issues. Reviewers accept contributions, building a visible track record.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
