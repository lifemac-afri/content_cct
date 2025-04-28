import React from "react";
import { FaSync } from "react-icons/fa";

const ErrorDisplay = ({ message, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h2>
        <p className="text-gray-700 mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full"
        >
          <FaSync className="mr-2" />
          Retry
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;