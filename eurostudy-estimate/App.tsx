import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ConfigPanel } from './components/ConfigPanel';
import { ResultPanel } from './components/ResultPanel';
import { UserConfig, CostBreakdown } from './types';
import { DEFAULT_COST_DATA } from './constants';
import { fetchCountryCostData } from './services/geminiService';
import { generatePDF } from './utils/pdfGenerator';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<UserConfig>({
    country: 'Austria',
    studentOrigin: 'Non-EU', // Default assumption for international tool
    courseLevel: 'Undergraduate',
    durationYears: 3,
    cityTier: 'Mid-sized',
    targetCurrency: 'EUR',
    workHoursPerWeek: 0,
    hourlyWage: 12, 
    holidayWorkWeeks: 0, // Default to 0 weeks of holiday work
    name: '',
    email: ''
  });

  const [costData, setCostData] = useState<CostBreakdown>(DEFAULT_COST_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-update estimate when critical config changes (Instant Switching)
  useEffect(() => {
    handleFetchEstimate();
  }, [config.country, config.courseLevel, config.durationYears, config.studentOrigin]);

  const handleFetchEstimate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCountryCostData(
        config.country,
        config.courseLevel,
        config.durationYears,
        config.studentOrigin
      );
      setCostData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch estimates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
      generatePDF(costData, config);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-euro-800 bg-gray-50">
      <Header />

      <main className="flex-grow flex flex-col items-center">
        {/* Sub-header / Breadcrumb area */}
        <div className="w-full bg-white border-b border-euro-100 py-3 mb-6">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-xl font-bold text-euro-900 tracking-tight">EuroStudy Cost Estimator</h1>
              <div className="flex items-center gap-2">
                 <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-400"></span>
                 <span className="text-xs font-medium text-euro-500 border border-green-200 bg-green-50 px-2 py-0.5 rounded-full">Official Data Sources</span>
              </div>
           </div>
        </div>

        {/* Main Content Grid */}
        <div className="w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 pb-12">
           {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}
            
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full">
            {/* Left Col: Config */}
            <div className="lg:col-span-4 xl:col-span-3">
              <ConfigPanel 
                config={config} 
                onConfigChange={setConfig} 
                onSubmit={handleFetchEstimate}
                onDownloadPdf={handleDownload}
                isLoading={isLoading}
                countryDescription={costData.description}
              />
            </div>

            {/* Right Col: Results */}
            <div className="lg:col-span-8 xl:col-span-9 h-full">
              <ResultPanel data={costData} config={config} />
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;