import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-7xl">🛒</span>
        <h1 className="text-4xl font-bold text-gray-800 mt-4">404</h1>
        <p className="text-gray-500 mt-2 text-lg">Oops! Page not found.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">Back to Home</Link>
      </div>
    </div>
  );
}
