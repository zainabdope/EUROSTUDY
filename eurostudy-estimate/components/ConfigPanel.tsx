import React, { useState, useEffect, useRef } from 'react';
import { UserConfig } from '../types';
import { EUROPEAN_COUNTRIES, SUPPORTED_CURRENCIES, STATIC_COST_PROFILES } from '../constants';
import { Info, Download, Loader2, MapPin, Calendar, BookOpen, Search, X, Briefcase, Building2, Coins, Globe2, AlertTriangle, Sun } from 'lucide-react';

interface ConfigPanelProps {
  config: UserConfig;
  onConfigChange: (newConfig: UserConfig) => void;
  onSubmit: () => void;
  onDownloadPdf: () => void;
  isLoading: boolean;
  countryDescription?: string;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onConfigChange,
  onSubmit,
  onDownloadPdf,
  isLoading,
  countryDescription,
}) => {
  
  // Local state for autocomplete
  const [countrySearch, setCountrySearch] = useState(config.country);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search
  const filteredCountries = EUROPEAN_COUNTRIES.filter(c => 
    c.label.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Update defaults when Country, Origin, or City Tier changes
  useEffect(() => {
    const profile = STATIC_COST_PROFILES[config.country] || STATIC_COST_PROFILES['default'];
    if (profile) {
      // 1. Determine max legal hours based on Origin (Visa Rules)
      const maxLegalHours = config.studentOrigin === 'EU' ? profile.partTimeWork.maxHoursEu : profile.partTimeWork.maxHoursNonEu;
      
      // 2. Determine Wage based on City Tier (Local Economics)
      let wageMultiplier = 1.0;
      if (config.cityTier === 'Big City') wageMultiplier = 1.2;     // +20% for major hubs
      if (config.cityTier === 'Small Town') wageMultiplier = 0.9;   // -10% for smaller towns
      
      const baseWage = profile.partTimeWork.avgStudentWage;
      const minWage = profile.partTimeWork.minWage;
      
      // Ensure wage is at least minimum wage, rounded to nearest 0.50
      const adjustedWage = Math.max(
        minWage, 
        Math.round(baseWage * wageMultiplier * 2) / 2
      );

      // Update config
      onConfigChange({
        ...config,
        hourlyWage: adjustedWage,
        // Always enforce legal limit. 
        // If user had 0 (no work), set to maxLegal to show potential. 
        // If user had value > maxLegal, clamp it.
        workHoursPerWeek: Math.min(config.workHoursPerWeek, maxLegalHours)
      });
    }
  }, [config.country, config.studentOrigin, config.cityTier]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
        // Reset search to currently selected country if invalid
        const isValid = EUROPEAN_COUNTRIES.some(c => c.value.toLowerCase() === countrySearch.toLowerCase());
        if (!isValid) {
          setCountrySearch(config.country);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [countrySearch, config.country]);

  // Handle Country Selection
  const selectCountry = (countryValue: string) => {
    onConfigChange({ ...config, country: countryValue });
    setCountrySearch(countryValue);
    setIsCountryOpen(false);
  };

  // Handle Course Level Change with Default Duration Logic
  const handleCourseLevelChange = (level: UserConfig['courseLevel']) => {
    let defaultDuration = config.durationYears;

    switch (level) {
      case 'Undergraduate':
        defaultDuration = 3;
        break;
      case 'Masters':
        defaultDuration = 2;
        break;
      case 'PhD':
        defaultDuration = 4;
        break;
      case 'Short-term':
        defaultDuration = 0.5; // 6 months
        break;
      case 'Language Course':
        defaultDuration = 0.25; // 3 months
        break;
    }

    onConfigChange({ 
      ...config, 
      courseLevel: level,
      durationYears: defaultDuration
    });
  };

  const handleChange = (field: keyof UserConfig, value: any) => {
    onConfigChange({ ...config, [field]: value });
  };

  const courseLevels: Array<UserConfig['courseLevel']> = ['Undergraduate', 'Masters', 'PhD', 'Short-term', 'Language Course'];
  const cityTiers: Array<UserConfig['cityTier']> = ['Big City', 'Mid-sized', 'Small Town'];

  // Get current profile for max sliders
  const currentProfile = STATIC_COST_PROFILES[config.country] || STATIC_COST_PROFILES['default'];
  const maxAllowedHours = config.studentOrigin === 'EU' ? currentProfile.partTimeWork.maxHoursEu : currentProfile.partTimeWork.maxHoursNonEu;

  // Calculate annual income based on semester vs holiday work
  const semesterWeeks = 38;
  const semesterIncome = config.workHoursPerWeek * config.hourlyWage * semesterWeeks;
  
  // Assumes Full-time work (40h) during holidays
  const holidayHours = 40; 
  const holidayIncome = holidayHours * config.hourlyWage * config.holidayWorkWeeks;
  
  const totalYearlyIncome = semesterIncome + holidayIncome;
  const avgMonthlyIncome = totalYearlyIncome / 12;

  const isAtMaxLimit = config.workHoursPerWeek >= maxAllowedHours;

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Configuration Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-euro-100 overflow-hidden p-6 md:p-8 space-y-6 flex-1">
        
        {/* Header with Currency Selector */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-serif font-bold text-euro-900">Configure Plan</h2>
            <p className="text-sm text-euro-500 mt-1">Customize your study parameters.</p>
          </div>
          
          <div className="relative">
             <select 
               value={config.targetCurrency}
               onChange={(e) => handleChange('targetCurrency', e.target.value)}
               className="appearance-none bg-euro-50 border border-euro-200 text-euro-900 text-sm font-bold rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-blue"
             >
               {SUPPORTED_CURRENCIES.map(c => (
                 <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
               ))}
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-euro-500">
               <Coins className="h-3 w-3" />
             </div>
          </div>
        </div>

        {/* Country Autocomplete */}
        <div className="space-y-2 relative" ref={dropdownRef}>
          <label className="flex items-center text-sm font-semibold text-euro-900 gap-2">
            <MapPin className="h-4 w-4 text-euro-500" />
            Destination Country
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-euro-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3.5 text-base border border-euro-200 bg-euro-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue sm:text-sm rounded-xl transition-all text-euro-900 font-medium placeholder-euro-400"
              placeholder="Type to search (e.g. Germany)"
              value={countrySearch}
              onChange={(e) => {
                setCountrySearch(e.target.value);
                setIsCountryOpen(true);
              }}
              onFocus={() => setIsCountryOpen(true)}
            />
            {countrySearch && (
              <button 
                onClick={() => {
                  setCountrySearch('');
                  setIsCountryOpen(true);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-euro-400 hover:text-euro-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {isCountryOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-euro-100">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => (
                    <div
                      key={c.value}
                      className={`cursor-pointer select-none relative py-3 pl-10 pr-4 hover:bg-euro-50 transition-colors ${
                        config.country === c.value ? 'bg-blue-50 text-brand-blue font-medium' : 'text-euro-900'
                      }`}
                      onClick={() => selectCountry(c.value)}
                    >
                      <span className="block truncate">{c.label}</span>
                      {config.country === c.value && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-blue">
                          <MapPin className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="cursor-default select-none relative py-3 px-4 text-euro-500 italic">
                    No countries found
                  </div>
                )}
              </div>
            )}
          </div>
          
          {countryDescription && (
            <div className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
               <Info className="h-4 w-4 flex-shrink-0 text-brand-blue mt-0.5" />
               <p className="text-xs text-euro-700 leading-relaxed">{countryDescription}</p>
            </div>
          )}
        </div>

        {/* Student Origin Toggle */}
        <div className="space-y-2">
           <label className="flex items-center text-sm font-semibold text-euro-900 gap-2">
            <Globe2 className="h-4 w-4 text-euro-500" />
            Student Citizenship
          </label>
          <div className="flex bg-euro-50 p-1 rounded-lg border border-euro-200">
             <button
                onClick={() => handleChange('studentOrigin', 'EU')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                  config.studentOrigin === 'EU'
                    ? 'bg-white text-brand-blue shadow-sm border border-euro-100'
                    : 'text-euro-600 hover:text-euro-900 hover:bg-euro-100'
                }`}
              >
                EU/EEA Citizen
              </button>
              <button
                onClick={() => handleChange('studentOrigin', 'Non-EU')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                  config.studentOrigin === 'Non-EU'
                    ? 'bg-white text-brand-blue shadow-sm border border-euro-100'
                    : 'text-euro-600 hover:text-euro-900 hover:bg-euro-100'
                }`}
              >
                Non-EU / International
              </button>
          </div>
          <p className="text-[10px] text-euro-500 pl-1">Determines tuition fees, visa & work rights.</p>
        </div>

        {/* City Tier Selection */}
        <div className="space-y-2">
           <label className="flex items-center text-sm font-semibold text-euro-900 gap-2">
            <Building2 className="h-4 w-4 text-euro-500" />
            Living Location Tier
          </label>
          <div className="flex bg-euro-50 p-1 rounded-lg border border-euro-200">
            {cityTiers.map((tier) => (
              <button
                key={tier}
                onClick={() => handleChange('cityTier', tier)}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                  config.cityTier === tier
                    ? 'bg-white text-euro-900 shadow-sm border border-euro-100'
                    : 'text-euro-600 hover:text-euro-900 hover:bg-euro-100'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-euro-500 pl-1">Adjusts rent, food costs, and student wages.</p>
        </div>

        {/* Course Level */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-euro-900 gap-2">
            <BookOpen className="h-4 w-4 text-euro-500" />
            Course Level
          </label>
          <div className="flex flex-wrap gap-2">
            {courseLevels.map((level) => (
              <button
                key={level}
                onClick={() => handleCourseLevelChange(level)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  config.courseLevel === level
                    ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
                    : 'bg-white text-euro-700 border-euro-200 hover:border-euro-300 hover:bg-euro-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-euro-900 gap-2">
             <Calendar className="h-4 w-4 text-euro-500" />
             Duration
          </label>
          <div className="flex items-center gap-4 p-3 border border-euro-100 rounded-xl bg-euro-50/30">
            <div className="flex-1">
               <input
                type="number"
                min="0.1"
                max="8"
                step="0.1"
                className="block w-full text-center py-1 text-lg font-bold text-euro-900 bg-transparent border-b-2 border-euro-200 focus:border-brand-blue focus:outline-none transition-colors"
                value={config.durationYears}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    handleChange('durationYears', val);
                  }
                }}
              />
            </div>
            <div className="flex flex-col justify-center items-start w-24">
               <span className="text-sm font-medium text-euro-900">Years</span>
               <span className="text-[10px] text-euro-500">
                 {config.durationYears < 1 
                   ? `(${Math.round(config.durationYears * 12)} months)`
                   : `(${config.durationYears * 12} months)`}
               </span>
            </div>
          </div>
        </div>

        {/* Work Offset Calculator */}
        <div className="space-y-3 pt-4 border-t border-euro-100">
          <label className="flex items-center justify-between text-sm font-semibold text-euro-900">
            <div className="flex items-center gap-2">
               <Briefcase className="h-4 w-4 text-euro-500" />
               Part-time Work Plan
            </div>
            {avgMonthlyIncome > 0 && (
               <span className="text-green-700 font-bold text-xs bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                 + ~€{Math.round(avgMonthlyIncome)}/mo
               </span>
            )}
          </label>
          
          <div className="bg-euro-50 rounded-xl p-3 border border-euro-200 space-y-4">
             {/* Semester Work Slider */}
             <div>
                <div className="flex justify-between text-xs mb-1">
                   <span className="text-euro-600 font-medium">Semester Hours (Weekly)</span>
                   <div className="flex items-center gap-1">
                      <span className="font-bold text-euro-900">{config.workHoursPerWeek}h</span>
                      <span className="text-[10px] text-euro-500 font-medium">/ {maxAllowedHours}h max</span>
                   </div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={maxAllowedHours} 
                  step="1"
                  value={config.workHoursPerWeek}
                  onChange={(e) => handleChange('workHoursPerWeek', Math.min(parseInt(e.target.value), maxAllowedHours))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isAtMaxLimit ? 'bg-orange-200 accent-orange-500' : 'bg-euro-200 accent-brand-blue'}`}
                />
                
                {/* Warning Banner */}
                {isAtMaxLimit && (
                  <div className="flex items-start gap-2 mt-2 p-2 bg-orange-50 border border-orange-100 rounded text-[10px] text-orange-800 leading-tight">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Visa Limit Reached:</strong> {config.studentOrigin} students in {config.country} are legally capped at {maxAllowedHours}h/week during the semester.
                    </span>
                  </div>
                )}
             </div>

             {/* Holiday Work Slider */}
             <div className="pt-2 border-t border-euro-200/50">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-yellow-100 rounded text-yellow-600">
                      <Sun className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-bold text-euro-800">Holiday Full-Time Work</span>
                 </div>
                 
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-euro-600 font-medium">Weeks per Year (Full-time 40h)</span>
                   <span className="font-bold text-euro-900">{config.holidayWorkWeeks} weeks</span>
                </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="18" 
                   step="1"
                   value={config.holidayWorkWeeks}
                   onChange={(e) => handleChange('holidayWorkWeeks', parseInt(e.target.value))}
                   className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-euro-200 accent-yellow-500"
                 />
                 <p className="text-[9px] text-euro-500 mt-1">Universities typically have 14-18 weeks of lecture-free time per year.</p>
             </div>
             
             {/* Hourly Wage Input */}
             <div className="flex items-center gap-3 pt-2 border-t border-euro-200/50">
                <span className="text-xs text-euro-700 font-bold flex-1">Hourly Wage (€)</span>
                <input 
                   type="number" 
                   min="0"
                   className="w-20 px-2 py-1 text-right text-sm font-bold text-euro-900 border border-euro-300 rounded-md focus:ring-2 focus:ring-brand-blue outline-none"
                   value={config.hourlyWage}
                   onChange={(e) => handleChange('hourlyWage', parseFloat(e.target.value))}
                />
             </div>
             <p className="text-[10px] text-euro-500 italic">Wage automatically adjusted for {config.cityTier.toLowerCase()} standards.</p>
          </div>
        </div>
        
        {/* Calculate Button */}
         <button
          onClick={onSubmit}
          disabled={isLoading}
          className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform duration-200 ${
            isLoading ? 'opacity-80 cursor-wait bg-euro-700' : 'bg-euro-900 hover:bg-euro-800 focus:ring-2 focus:ring-offset-2 focus:ring-euro-500'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Updating Estimates...
            </>
          ) : (
            'Reset to Defaults'
          )}
        </button>

      </div>

      {/* Lead Capture Card */}
      <div className="bg-brand-blue rounded-2xl shadow-lg p-6 md:p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/10 rounded-lg">
             <Download className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif">Get Detailed Report</h3>
            <p className="text-xs text-blue-100">PDF breakdown + Email copy</p>
          </div>
        </div>

        <div className="space-y-3">
          <input
              type="text"
              placeholder="Your Name (Optional)"
              className="block w-full px-4 py-3 border border-blue-400/30 rounded-xl text-sm bg-blue-800/40 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:border-transparent transition-all backdrop-blur-sm"
              value={config.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <input
              type="email"
              placeholder="student@example.com"
              className="block w-full px-4 py-3 border border-blue-400/30 rounded-xl text-sm bg-blue-800/40 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:border-transparent transition-all backdrop-blur-sm"
              value={config.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
            />
             <button
              onClick={onDownloadPdf}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-blue-900/20 text-sm font-bold text-brand-blue bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-blue focus:ring-white transition-all mt-2"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </button>
            <p className="text-center text-[10px] text-blue-200 pt-2">
              We respect your privacy.
            </p>
        </div>
      </div>
    </div>
  );
};