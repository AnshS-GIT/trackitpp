import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-200">404</h1>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
                <p className="text-gray-600 mt-2 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
