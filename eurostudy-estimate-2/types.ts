export interface UserConfig {
  country: string;
  studentOrigin: 'EU' | 'Non-EU';
  courseLevel: 'Undergraduate' | 'Masters' | 'PhD' | 'Short-term' | 'Language Course';
  durationYears: number;
  cityTier: 'Big City' | 'Mid-sized' | 'Small Town';
  targetCurrency: string;
  workHoursPerWeek: number;
  hourlyWage: number;
  holidayWorkWeeks: number; // Replaces includeHolidayWork to allow specific duration
  name?: string;
  email?: string;
}

export interface OfficialCountryData {
  country: string;
  fundingProof: {
    preferredMethod: string;
    amountEuro: number;
    details: string;
    officialLink: string;
  };
  visaFeeEuro: number;
  workRights: {
    allowed: boolean;
    maxHours: string;
    notes: string;
  };
}

export interface CostBreakdown {
  countryName: string;
  currencySymbol: string;
  exchangeRates: Record<string, number>;
  
  // New Tuition Section
  tuitionYearly: number;
  tuitionDetails: string;

  oneTimeCosts: {
    visaAdmin: number;
    blockedAccount: number;
    flightTravel: number;
    testsAdmissions: number;
    deposit: number;
  };
  recurringCosts: {
    housingMonthly: number;
    insuranceMonthly: number;
    foodMonthly: number;
    transportMonthly: number;
    miscMonthly: number;
  };
  partTimeWork: {
    canWork: boolean;
    regulations: string;
    avgStudentWage: number;
    minWage: number;
    legalMaxHours: number;
  };
  highlights: string[];
  description: string;
  housingRange: string;
  officialData?: OfficialCountryData;
  auditLog: string[]; // New field for data verification messages
}

export interface CountryOption {
  value: string;
  label: string;
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
}

export interface StaticCostProfile extends Omit<CostBreakdown, 'countryName' | 'exchangeRates' | 'officialData' | 'currencySymbol' | 'tuitionYearly' | 'tuitionDetails' | 'partTimeWork' | 'auditLog'> {
  tuitionYearly: {
    eu: number;
    nonEu: number;
    details: string;
  };
  partTimeWork: {
    canWork: boolean;
    regulations: string;
    minWage: number;
    avgStudentWage: number;
    maxHoursEu: number;
    maxHoursNonEu: number;
  };
}