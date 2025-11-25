import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-euro-50 border-t border-euro-100 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-euro-400">
        <div className="mb-4 md:mb-0">
          <p>&copy; 2025 EuroStudy Estimate. All rights reserved.</p>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-euro-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-euro-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-euro-600 transition-colors">Data Sources</a>
        </div>
      </div>
    </footer>
  );
};
