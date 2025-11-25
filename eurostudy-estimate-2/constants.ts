import { CountryOption, CostBreakdown, CurrencyOption, OfficialCountryData, StaticCostProfile } from './types';

export const EUROPEAN_COUNTRIES: CountryOption[] = [
  { value: 'Austria', label: '🇦🇹 Austria' },
  { value: 'Belgium', label: '🇧🇪 Belgium' },
  { value: 'Bulgaria', label: '🇧🇬 Bulgaria' },
  { value: 'Croatia', label: '🇭🇷 Croatia' },
  { value: 'Cyprus', label: '🇨🇾 Cyprus' },
  { value: 'Czech Republic', label: '🇨🇿 Czech Republic' },
  { value: 'Denmark', label: '🇩🇰 Denmark' },
  { value: 'Estonia', label: '🇪🇪 Estonia' },
  { value: 'Finland', label: '🇫🇮 Finland' },
  { value: 'France', label: '🇫🇷 France' },
  { value: 'Germany', label: '🇩🇪 Germany' },
  { value: 'Greece', label: '🇬🇷 Greece' },
  { value: 'Hungary', label: '🇭🇺 Hungary' },
  { value: 'Ireland', label: '🇮🇪 Ireland' },
  { value: 'Italy', label: '🇮🇹 Italy' },
  { value: 'Latvia', label: '🇱🇻 Latvia' },
  { value: 'Lithuania', label: '🇱🇹 Lithuania' },
  { value: 'Luxembourg', label: '🇱🇺 Luxembourg' },
  { value: 'Malta', label: '🇲🇹 Malta' },
  { value: 'Netherlands', label: '🇳🇱 Netherlands' },
  { value: 'Norway', label: '🇳🇴 Norway' },
  { value: 'Poland', label: '🇵🇱 Poland' },
  { value: 'Portugal', label: '🇵🇹 Portugal' },
  { value: 'Romania', label: '🇷🇴 Romania' },
  { value: 'Slovakia', label: '🇸🇰 Slovakia' },
  { value: 'Slovenia', label: '🇸🇮 Slovenia' },
  { value: 'Spain', label: '🇪🇸 Spain' },
  { value: 'Sweden', label: '🇸🇪 Sweden' },
  { value: 'Switzerland', label: '🇨🇭 Switzerland' },
  { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
];

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
  { code: 'PKR', symbol: 'Rs', label: 'Pakistani Rupee (PKR)' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira (NGN)' },
];

export const CITY_TIER_MULTIPLIERS = {
  'Big City': 1.35,   // e.g. Munich, Paris, Amsterdam
  'Mid-sized': 1.0,   // e.g. Graz, Lyon, Rotterdam
  'Small Town': 0.85, // e.g. Leoben, Poitiers (Adjusted to be less aggressive drop)
};

export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  'EUR': 1,
  'USD': 1.08,
  'GBP': 0.85,
  'INR': 90.5,
  'PKR': 300.5,
  'NGN': 1600,
};

// Strict list of countries that require a Blocked Account (Deposit) style proof
export const BLOCKED_ACCOUNT_COUNTRIES = [
  'Germany',
  'Austria', 
  'Netherlands', 
  'Finland', 
  'Denmark', 
  'Norway', 
  'Sweden', 
  'Switzerland'
];

// Official Data to override AI Hallucinations
export const OFFICIAL_COUNTRY_DATA: Record<string, OfficialCountryData> = {
  'Germany': {
    country: 'Germany',
    fundingProof: {
      preferredMethod: 'Blocked Account (Sperrkonto)',
      amountEuro: 11208,
      details: 'Must deposit €11,208/yr (~€934/mo) into a blocked account.',
      officialLink: 'https://www.auswaertiges-amt.de/en/visa-service/visabestimmungen-node/sperrkonto-seite'
    },
    visaFeeEuro: 75,
    workRights: {
      allowed: true,
      maxHours: '120 full days / 240 half days per year',
      notes: 'Approx 20h/week. Self-employment restricted.'
    }
  },
  'Austria': {
    country: 'Austria',
    fundingProof: {
      preferredMethod: 'Bank Statement / Deposit',
      amountEuro: 13000, 
      details: 'Under 24: ~€670/mo. Over 24: ~€1,100/mo. Access to funds required.',
      officialLink: 'https://oead.at/en/to-austria/entry-and-residence'
    },
    visaFeeEuro: 160,
    workRights: {
      allowed: true,
      maxHours: '20 hours per week',
      notes: 'Requires a work permit (AMS) from the employer.'
    }
  },
  'Netherlands': {
    country: 'Netherlands',
    fundingProof: {
      preferredMethod: 'University Transfer / Deposit',
      amountEuro: 14616,
      details: 'University applies for you. Proof of ~€1,218/mo required.',
      officialLink: 'https://ind.nl/en/residence-permits/study/study-at-university-or-higher-professional-education'
    },
    visaFeeEuro: 210,
    workRights: {
      allowed: true,
      maxHours: '16 hours per week',
      notes: 'Employer needs work permit (TWV). Internship pay often tax-free.'
    }
  },
  'France': {
    country: 'France',
    fundingProof: {
      preferredMethod: 'Bank Statement',
      amountEuro: 7380,
      details: 'Must prove minimum €615/month for the year.',
      officialLink: 'https://france-visas.gouv.fr/en_US/web/france-visas'
    },
    visaFeeEuro: 99, 
    workRights: {
      allowed: true,
      maxHours: '964 hours per year',
      notes: 'Can work 60% of legal year (~20h/week).'
    }
  },
  'Ireland': {
    country: 'Ireland',
    fundingProof: {
      preferredMethod: 'Education Bond / Bank Statement',
      amountEuro: 10000, 
      details: 'Access to €10,000 + proof of fees paid.',
      officialLink: 'https://www.irishimmigration.ie/coming-to-study-in-ireland/'
    },
    visaFeeEuro: 100,
    workRights: {
      allowed: true,
      maxHours: '20h/week term-time, 40h/week holidays',
      notes: 'Automatic right to work for degree students.'
    }
  },
  'Belgium': {
    country: 'Belgium',
    fundingProof: {
      preferredMethod: 'Solvency / Financial Proof',
      amountEuro: 10000, 
      details: 'Proof of solvency required. Approx €830/month + fees.',
      officialLink: 'https://dofi.ibz.be/en'
    },
    visaFeeEuro: 180,
    workRights: {
      allowed: true,
      maxHours: '20h/week',
      notes: 'Allowed during semester. Unlimited during holidays.'
    }
  },
  'Spain': {
    country: 'Spain',
    fundingProof: {
      preferredMethod: 'Bank Statement',
      amountEuro: 7200, 
      details: '100% of IPREM index (approx €600/mo).',
      officialLink: 'https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Visado-de-estudios.aspx'
    },
    visaFeeEuro: 80, 
    workRights: {
      allowed: true,
      maxHours: '30 hours per week',
      notes: 'Work must not overlap with study hours.'
    }
  },
  'Italy': {
    country: 'Italy',
    fundingProof: {
      preferredMethod: 'Bank Statement',
      amountEuro: 6500, 
      details: 'Min €6,500/year (~€540/mo).',
      officialLink: 'https://vistoperitalia.esteri.it/home/en'
    },
    visaFeeEuro: 50,
    workRights: {
      allowed: true,
      maxHours: '20 hours per week',
      notes: 'Max 1,040 hours per year.'
    }
  },
  'Poland': {
    country: 'Poland',
    fundingProof: {
      preferredMethod: 'Bank Statement / Traveller Cheques',
      amountEuro: 8500, 
      details: 'Cost of living (~776 PLN/mo) + Return ticket + Rent.',
      officialLink: 'https://www.gov.pl/web/diplomacy/visas'
    },
    visaFeeEuro: 80,
    workRights: {
      allowed: true,
      maxHours: 'Unlimited',
      notes: 'Full-time students with residency permit can work without permit.'
    }
  },
  'Portugal': {
    country: 'Portugal',
    fundingProof: {
      preferredMethod: 'Bank Statement',
      amountEuro: 9840, 
      details: 'Based on minimum wage (~€820x12).',
      officialLink: 'https://imigrante.sef.pt/en/solicitar/estudar/'
    },
    visaFeeEuro: 90,
    workRights: {
      allowed: true,
      maxHours: '20 hours per week',
      notes: 'Need to notify SEF.'
    }
  },
  'Czech Republic': {
    country: 'Czech Republic',
    fundingProof: {
      preferredMethod: 'Bank Statement',
      amountEuro: 5000, 
      details: 'Approx 110,000 CZK per year.',
      officialLink: 'https://www.mvcr.cz/mvcren/article/proof-of-funds-for-the-purposes-of-a-long-term-residence.aspx'
    },
    visaFeeEuro: 100,
    workRights: {
      allowed: true,
      maxHours: 'Unlimited',
      notes: 'If enrolled in accredited university program.'
    }
  },
  'Hungary': {
    country: 'Hungary',
    fundingProof: {
      preferredMethod: 'Bank Statement',
      amountEuro: 3000,
      details: 'Must show access to funds for duration. ~€250/mo minimum.',
      officialLink: 'http://www.bmbah.hu/index.php?lang=en'
    },
    visaFeeEuro: 60,
    workRights: {
      allowed: true,
      maxHours: '24 hours per week',
      notes: '30h/week (term time), 66 days/yr outside term.'
    }
  },
  'Sweden': {
    country: 'Sweden',
    fundingProof: {
      preferredMethod: 'Bank Statement (Deposit)',
      amountEuro: 10000, 
      details: 'Must show ~9,450 SEK/month for duration.',
      officialLink: 'https://www.migrationsverket.se/English/Private-individuals/Studying-in-Sweden.html'
    },
    visaFeeEuro: 140,
    workRights: {
      allowed: true,
      maxHours: 'Unlimited',
      notes: 'As long as studies are the main focus.'
    }
  },
  'Finland': {
    country: 'Finland',
    fundingProof: {
      preferredMethod: 'Bank Statement (Deposit)',
      amountEuro: 6720, 
      details: '€560 per month for the year.',
      officialLink: 'https://migri.fi/en/studying-in-finland'
    },
    visaFeeEuro: 350,
    workRights: {
      allowed: true,
      maxHours: '30 hours per week',
      notes: 'Increased from 25h to 30h recently.'
    }
  },
  'Norway': {
    country: 'Norway',
    fundingProof: {
      preferredMethod: 'Deposit in Norwegian Bank',
      amountEuro: 13500,
      details: 'Must transfer ~151,690 NOK to a Norwegian account.',
      officialLink: 'https://www.udi.no/en/want-to-apply/studies/'
    },
    visaFeeEuro: 540,
    workRights: {
      allowed: true,
      maxHours: '20 hours per week',
      notes: 'Full-time during holidays.'
    }
  },
  'Denmark': {
    country: 'Denmark',
    fundingProof: {
      preferredMethod: 'Bank Statement',
      amountEuro: 11000,
      details: 'Equivalent of ~€900/month.',
      officialLink: 'https://www.nyidanmark.dk/en-GB'
    },
    visaFeeEuro: 255,
    workRights: {
      allowed: true,
      maxHours: '20 hours per week',
      notes: 'Full-time during June, July, August.'
    }
  },
  'Switzerland': {
    country: 'Switzerland',
    fundingProof: {
      preferredMethod: 'Bank Statement (Swiss Bank)',
      amountEuro: 22000, 
      details: 'CHF 21,000 at start of year.',
      officialLink: 'https://www.ch.ch/en/foreign-nationals-in-switzerland/entry-and-stay/visa-procedure-entry/'
    },
    visaFeeEuro: 80,
    workRights: {
      allowed: true,
      maxHours: '15 hours per week',
      notes: 'Only after 6 months for non-EU students.'
    }
  },
  'United Kingdom': {
     country: 'United Kingdom',
     fundingProof: {
       preferredMethod: 'Bank Statement',
       amountEuro: 12000, // Approx £9,207 outside London, £12,006 London
       details: 'Min £1,023/mo (outside London) or £1,334/mo (London) for 9 months.',
       officialLink: 'https://www.gov.uk/student-visa/money'
     },
     visaFeeEuro: 575, // £490
     workRights: {
       allowed: true,
       maxHours: '20 hours per week',
       notes: 'Term-time. Full-time during vacations.'
     }
  }
};

// Static cost profiles with Tuition Data
export const STATIC_COST_PROFILES: Record<string, StaticCostProfile> = {
  'Austria': {
    tuitionYearly: { eu: 42, nonEu: 1453, details: 'EU: ~€21/sem. Non-EU: ~€726.72/sem (Public).' },
    oneTimeCosts: { visaAdmin: 160, blockedAccount: 0, flightTravel: 350, testsAdmissions: 150, deposit: 1000 },
    recurringCosts: { housingMonthly: 550, insuranceMonthly: 65, foodMonthly: 300, transportMonthly: 50, miscMonthly: 150 },
    partTimeWork: { canWork: true, regulations: "20 hours/week allowed", minWage: 11, avgStudentWage: 14, maxHoursEu: 40, maxHoursNonEu: 20 },
    highlights: ['High quality of life', 'Central European location', 'Affordable student housing', 'Strong public universities'],
    description: 'Quality of life is high with affordable public university fees.',
    housingRange: '€350–€800/mo'
  },
  'Germany': {
    tuitionYearly: { eu: 350, nonEu: 350, details: 'Mostly free (Semester contribution ~€150-350/sem). BW charges Non-EU €3,000/yr.' },
    oneTimeCosts: { visaAdmin: 75, blockedAccount: 11208, flightTravel: 400, testsAdmissions: 200, deposit: 1200 },
    recurringCosts: { housingMonthly: 500, insuranceMonthly: 120, foodMonthly: 250, transportMonthly: 30, miscMonthly: 200 },
    partTimeWork: { canWork: true, regulations: "20h/week (120 full days) allowed", minWage: 12.41, avgStudentWage: 13.50, maxHoursEu: 40, maxHoursNonEu: 20 },
    highlights: ['Tuition-free public universities', 'Strong economy', 'Post-study work visa (18 months)', 'Diverse international community'],
    description: 'A top destination known for free tuition and engineering excellence.',
    housingRange: '€400–€900/mo'
  },
  'Netherlands': {
    tuitionYearly: { eu: 2530, nonEu: 12000, details: 'EU: ~€2,530. Non-EU: €6k - €20k depending on course.' },
    oneTimeCosts: { visaAdmin: 210, blockedAccount: 0, flightTravel: 350, testsAdmissions: 250, deposit: 1500 },
    recurringCosts: { housingMonthly: 800, insuranceMonthly: 100, foodMonthly: 300, transportMonthly: 80, miscMonthly: 250 },
    partTimeWork: { canWork: true, regulations: "16 hours/week allowed for Non-EU", minWage: 13.27, avgStudentWage: 15, maxHoursEu: 40, maxHoursNonEu: 16 },
    highlights: ['English widely spoken', 'Innovative teaching methods', 'Cycling culture', 'High post-grad salaries'],
    description: 'High English proficiency and vibrant international student life.',
    housingRange: '€500–€1100/mo'
  },
  'France': {
    tuitionYearly: { eu: 170, nonEu: 2770, details: 'EU: ~€170. Non-EU: €2,770 (Bachelor), €3,770 (Master).' },
    oneTimeCosts: { visaAdmin: 99, blockedAccount: 0, flightTravel: 350, testsAdmissions: 250, deposit: 900 },
    recurringCosts: { housingMonthly: 600, insuranceMonthly: 0, foodMonthly: 300, transportMonthly: 40, miscMonthly: 180 },
    partTimeWork: { canWork: true, regulations: "964 hours/year allowed (60%)", minWage: 11.65, avgStudentWage: 12.50, maxHoursEu: 40, maxHoursNonEu: 20 },
    highlights: ['Rich culture & history', 'Housing subsidy (CAF)', 'Grandes Écoles system', 'Central Europe travel hub'],
    description: 'Affordable education with unique housing subsidies for students.',
    housingRange: '€400–€900/mo'
  },
  'Italy': {
    tuitionYearly: { eu: 1500, nonEu: 2000, details: 'Based on family income (ISEE). Ranges €0–€4,000/yr.' },
    oneTimeCosts: { visaAdmin: 50, blockedAccount: 0, flightTravel: 350, testsAdmissions: 150, deposit: 800 },
    recurringCosts: { housingMonthly: 500, insuranceMonthly: 50, foodMonthly: 250, transportMonthly: 35, miscMonthly: 150 },
    partTimeWork: { canWork: true, regulations: "20 hours/week (1040h/yr)", minWage: 9, avgStudentWage: 10, maxHoursEu: 40, maxHoursNonEu: 20 },
    highlights: ['Historic universities', 'Amazing cuisine', 'Scholarship opportunities (DSU)', 'Rich art & culture'],
    description: 'Study amidst history with generous regional scholarships.',
    housingRange: '€300–€700/mo'
  },
  'Spain': {
    tuitionYearly: { eu: 1200, nonEu: 2500, details: 'Public unis: €700-€3,500/yr. Non-EU may pay higher rates.' },
    oneTimeCosts: { visaAdmin: 80, blockedAccount: 0, flightTravel: 350, testsAdmissions: 150, deposit: 800 },
    recurringCosts: { housingMonthly: 500, insuranceMonthly: 60, foodMonthly: 250, transportMonthly: 30, miscMonthly: 180 },
    partTimeWork: { canWork: true, regulations: "30 hours/week allowed", minWage: 8.87, avgStudentWage: 10, maxHoursEu: 40, maxHoursNonEu: 30 },
    highlights: ['Warm climate', 'Vibrant social life', 'Affordable living', 'Spanish language immersion'],
    description: 'A vibrant destination with affordable living and great weather.',
    housingRange: '€300–€800/mo'
  },
  'Poland': {
    tuitionYearly: { eu: 0, nonEu: 3000, details: 'EU: Free (Polish courses). Non-EU: €2k-€4k/yr.' },
    oneTimeCosts: { visaAdmin: 80, blockedAccount: 0, flightTravel: 300, testsAdmissions: 150, deposit: 600 },
    recurringCosts: { housingMonthly: 350, insuranceMonthly: 40, foodMonthly: 200, transportMonthly: 20, miscMonthly: 120 },
    partTimeWork: { canWork: true, regulations: "Unlimited for residents", minWage: 6.5, avgStudentWage: 7.5, maxHoursEu: 40, maxHoursNonEu: 40 },
    highlights: ['Very affordable', 'Modern cities', 'Growing tech hub', 'Rich history'],
    description: 'One of the most affordable countries in Europe with high educational standards.',
    housingRange: '€200–€500/mo'
  },
  'Ireland': {
    tuitionYearly: { eu: 3000, nonEu: 15000, details: 'EU: €3k contribution. Non-EU: €10k-€25k.' },
    oneTimeCosts: { visaAdmin: 100, blockedAccount: 0, flightTravel: 300, testsAdmissions: 200, deposit: 1200 },
    recurringCosts: { housingMonthly: 900, insuranceMonthly: 50, foodMonthly: 300, transportMonthly: 60, miscMonthly: 200 },
    partTimeWork: { canWork: true, regulations: "20h/week (term), 40h (holiday)", minWage: 12.70, avgStudentWage: 13.50, maxHoursEu: 40, maxHoursNonEu: 20 },
    highlights: ['English speaking', 'Tech headquarters of Europe', 'Friendly population', '2-year post-study visa'],
    description: 'English-speaking hub with major career opportunities in tech and pharma.',
    housingRange: '€600–€1200/mo'
  },
  'Sweden': {
    tuitionYearly: { eu: 0, nonEu: 12000, details: 'EU: Free. Non-EU: SEK 80k-140k/yr.' },
    oneTimeCosts: { visaAdmin: 140, blockedAccount: 0, flightTravel: 300, testsAdmissions: 100, deposit: 1000 },
    recurringCosts: { housingMonthly: 550, insuranceMonthly: 50, foodMonthly: 300, transportMonthly: 60, miscMonthly: 200 },
    partTimeWork: { canWork: true, regulations: "Unlimited work allowed", minWage: 12, avgStudentWage: 14, maxHoursEu: 40, maxHoursNonEu: 40 },
    highlights: ['Innovation leader', 'English widely spoken', 'Work-life balance', 'Beautiful nature'],
    description: 'Innovative society with unlimited work rights for students.',
    housingRange: '€400–€800/mo'
  },
  'Switzerland': {
    tuitionYearly: { eu: 1500, nonEu: 1500, details: 'Public unis are cheap for all (~CHF 1500). Private are expensive.' },
    oneTimeCosts: { visaAdmin: 80, blockedAccount: 0, flightTravel: 300, testsAdmissions: 200, deposit: 2000 },
    recurringCosts: { housingMonthly: 1200, insuranceMonthly: 250, foodMonthly: 500, transportMonthly: 100, miscMonthly: 400 },
    partTimeWork: { canWork: true, regulations: "15h/week after 6mo", minWage: 24, avgStudentWage: 28, maxHoursEu: 40, maxHoursNonEu: 15 },
    highlights: ['Highest salaries', 'Top global universities', 'Stunning landscapes', 'High quality of life'],
    description: 'Premium education with the highest living standards in Europe.',
    housingRange: '€800–€1800/mo'
  },
  'United Kingdom': {
    tuitionYearly: { eu: 16000, nonEu: 18000, details: 'EU/Intl: £14k-£26k. Home fee status lost after Brexit.' },
    oneTimeCosts: { visaAdmin: 575, blockedAccount: 0, flightTravel: 400, testsAdmissions: 250, deposit: 1500 },
    recurringCosts: { housingMonthly: 900, insuranceMonthly: 80, foodMonthly: 350, transportMonthly: 80, miscMonthly: 300 },
    partTimeWork: { canWork: true, regulations: "20 hours/week", minWage: 11.44, avgStudentWage: 12.50, maxHoursEu: 40, maxHoursNonEu: 20 },
    highlights: ['World class universities', 'Short masters (1 year)', 'Cultural powerhouse', 'English language'],
    description: 'Prestigious education with shorter Master degrees (1 year).',
    housingRange: '£600–€1200/mo'
  },
  // Default fallback
  'default': {
    tuitionYearly: { eu: 1000, nonEu: 5000, details: 'Varies significantly by institution.' },
    oneTimeCosts: { visaAdmin: 100, blockedAccount: 0, flightTravel: 300, testsAdmissions: 200, deposit: 800 },
    recurringCosts: { housingMonthly: 500, insuranceMonthly: 60, foodMonthly: 300, transportMonthly: 40, miscMonthly: 150 },
    partTimeWork: { canWork: true, regulations: "20 hours/week typically", minWage: 10, avgStudentWage: 11, maxHoursEu: 40, maxHoursNonEu: 20 },
    highlights: ['European culture', 'Travel opportunities', 'Diverse education', 'Student friendly'],
    description: 'A great study destination with access to the broader European network.',
    housingRange: '€300–€700/mo'
  }
};

const { tuitionYearly: austriaTuitionData, ...austriaCostProfile } = STATIC_COST_PROFILES['Austria'];

export const DEFAULT_COST_DATA: CostBreakdown = {
  countryName: 'Austria',
  currencySymbol: '€',
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  tuitionYearly: austriaTuitionData.nonEu,
  tuitionDetails: austriaTuitionData.details,
  ...austriaCostProfile,
  // Fix initial partTimeWork structure to match new interface
  partTimeWork: {
     ...austriaCostProfile.partTimeWork,
     legalMaxHours: 20 
  },
  officialData: OFFICIAL_COUNTRY_DATA['Austria'],
  auditLog: [] // Initialize empty
};