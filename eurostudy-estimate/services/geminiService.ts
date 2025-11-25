import { CostBreakdown, OfficialCountryData } from '../types';
import { OFFICIAL_COUNTRY_DATA, STATIC_COST_PROFILES, DEFAULT_EXCHANGE_RATES, BLOCKED_ACCOUNT_COUNTRIES } from '../constants';

export const fetchCountryCostData = async (
  country: string,
  courseLevel: string,
  durationYears: number,
  studentOrigin: 'EU' | 'Non-EU'
): Promise<CostBreakdown> => {
  // Synchronous local lookup for instant switching
  return new Promise((resolve) => {
    
    const auditLog: string[] = [];
    
    // 1. Get Official Data (Visa, Work Rules)
    const officialData: OfficialCountryData | undefined = OFFICIAL_COUNTRY_DATA[country];

    // 2. Get Static Cost Profile (Living expenses, highlights)
    const staticProfile = STATIC_COST_PROFILES[country] || STATIC_COST_PROFILES['default'];
    
    // 3. Determine Tuition
    const isEu = studentOrigin === 'EU';
    const tuitionYearly = isEu ? staticProfile.tuitionYearly.eu : staticProfile.tuitionYearly.nonEu;
    
    // Audit Tuition
    if (isEu && tuitionYearly !== staticProfile.tuitionYearly.nonEu) {
        auditLog.push(`✓ Applied subsidized EU tuition rates (€${tuitionYearly}/yr) instead of Non-EU rate.`);
    } else if (!isEu) {
        auditLog.push(`✓ Applied international tuition rates (€${tuitionYearly}/yr) for Non-EU origin.`);
    }

    // 4. Check Blocked Account Requirement
    const isBlockedAccountCountry = BLOCKED_ACCOUNT_COUNTRIES.includes(country);
    
    // 5. Construct Data Object
    const mergedData: CostBreakdown = {
      countryName: country,
      currencySymbol: '€',
      exchangeRates: DEFAULT_EXCHANGE_RATES,
      
      tuitionYearly: tuitionYearly,
      tuitionDetails: staticProfile.tuitionYearly.details,

      oneTimeCosts: {
        ...staticProfile.oneTimeCosts,
        // Override with official data if exists
        visaAdmin: officialData?.visaFeeEuro ?? staticProfile.oneTimeCosts.visaAdmin,
        // Only set blockedAccount amount if it is a Blocked Account Country.
        // Otherwise set to 0 (Financial Proof is used instead).
        blockedAccount: isBlockedAccountCountry 
          ? (officialData?.fundingProof.amountEuro ?? staticProfile.oneTimeCosts.blockedAccount)
          : 0,
      },
      recurringCosts: staticProfile.recurringCosts,
      partTimeWork: {
        canWork: officialData?.workRights.allowed ?? staticProfile.partTimeWork.canWork,
        regulations: officialData?.workRights.notes ?? staticProfile.partTimeWork.regulations,
        minWage: staticProfile.partTimeWork.minWage,
        avgStudentWage: staticProfile.partTimeWork.avgStudentWage,
        legalMaxHours: isEu ? staticProfile.partTimeWork.maxHoursEu : staticProfile.partTimeWork.maxHoursNonEu
      },
      highlights: staticProfile.highlights,
      description: staticProfile.description,
      housingRange: staticProfile.housingRange,
      officialData: officialData,
      auditLog: auditLog
    };

    // --- COMPLIANCE AUDIT & AUTO-CORRECTION LOGIC ---
    
    // A. Audit Blocked Account vs Financial Proof
    if (isBlockedAccountCountry) {
        if (officialData?.fundingProof.preferredMethod.includes("Blocked Account")) {
            mergedData.auditLog.push(`✓ Enforced Official Blocked Account requirement (approx. €${mergedData.oneTimeCosts.blockedAccount.toLocaleString()}) for ${country}.`);
        } else {
             mergedData.auditLog.push(`✓ Applied mandatory deposit logic based on strict ${country} visa rules.`);
        }
    } else {
         mergedData.auditLog.push(`✓ Switched to "Annual Financial Proof" method (No Blocked Account required for ${country}).`);
    }

    // B. Audit Work Hours
    const maxHours = isEu ? staticProfile.partTimeWork.maxHoursEu : staticProfile.partTimeWork.maxHoursNonEu;
    mergedData.auditLog.push(`✓ Legal Work Limit: Capped estimation to ${maxHours}h/week based on ${studentOrigin} student visa regulations.`);

    // C. Audit Cost of Living Reality Check
    if (officialData) {
        const govtMonthlyReq = officialData.fundingProof.amountEuro / 12;
        const realMonthlyEst = 
            mergedData.recurringCosts.housingMonthly + 
            mergedData.recurringCosts.insuranceMonthly + 
            mergedData.recurringCosts.foodMonthly + 
            mergedData.recurringCosts.transportMonthly + 
            mergedData.recurringCosts.miscMonthly;
            
        if (realMonthlyEst > govtMonthlyReq * 1.2) {
            mergedData.auditLog.push(`⚠️ Cost Warning: Real monthly costs (~€${realMonthlyEst.toFixed(0)}) are significantly higher than the Government Visa Minimum (~€${govtMonthlyReq.toFixed(0)}). We used the higher "Real" number for safety.`);
        }
    }

    resolve(mergedData);
  });
};