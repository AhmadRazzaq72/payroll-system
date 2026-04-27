import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 px-6 py-12">
      <div className="max-w-5xl w-full bg-white/30 backdrop-blur-md shadow-2xl border border-white/20 rounded-3xl flex flex-col lg:flex-row items-center overflow-hidden animate-fadeIn">
        
        {/* Text Section */}
        <div className="w-full lg:w-1/2 p-10 text-center lg:text-left">
          <h1 className="text-5xl font-bold text-red-500 mb-4">404 - Not Found</h1>
          <h2 className="text-2xl font-semibold text-blue-900 mb-3">Oops! This page doesn’t exist.</h2>
          <p className="text-gray-700 mb-6">
            The page you are looking for might have been removed, renamed, or is temporarily unavailable.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full text-sm transition-all shadow-md"
          >
            Back to Homepage
          </button>
        </div>

        {/* Image Section */}
        <div className="w-full lg:w-1/2">
          <img
            src="https://undraw.co/api/illustrations/87b51814-8a0f-4f80-98a4-4feff2c5f7bb" // Free 404 image from undraw.co
            alt="404 Illustration"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
