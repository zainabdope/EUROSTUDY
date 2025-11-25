import React from 'react';
import { Menu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-euro-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
            <span className="text-4xl leading-none filter drop-shadow-sm group-hover:drop-shadow-md transition-all">
              🇪🇺
            </span>
            <span className="font-serif text-xl font-bold text-euro-900 tracking-tight">
              EuroStudy Estimate
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-euro-600 hover:text-euro-900 font-medium transition-colors">
              Calculator
            </a>
            <a href="#" className="text-euro-600 hover:text-euro-900 font-medium transition-colors">
              Blog
            </a>
            <a href="#" className="text-euro-600 hover:text-euro-900 font-medium transition-colors">
              About
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-euro-500 hover:text-euro-900 p-2">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};