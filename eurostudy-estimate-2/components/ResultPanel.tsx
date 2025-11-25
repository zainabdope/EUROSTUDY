import React, { useState } from 'react';
import { CostBreakdown, UserConfig } from '../types';
import { CITY_TIER_MULTIPLIERS, SUPPORTED_CURRENCIES, EUROPEAN_COUNTRIES } from '../constants';
import { 
  Wallet, AlertTriangle, CheckCircle2, 
  ChevronDown, ExternalLink, AlertCircle,
  LayoutDashboard, Briefcase, Home, Calendar, ScrollText, ShieldCheck
} from 'lucide-react';

interface ResultPanelProps {
  data: CostBreakdown;
  config: UserConfig;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ data, config }) => {
  const [activeTab, setActiveTab] = useState('Summary');
  const [showAuditLog, setShowAuditLog] = useState(true);

  // --- 1. Helpers & Flags ---
  const getRate = () => data.exchangeRates[config.targetCurrency] || 1;
  const currencySymbol = SUPPORTED_CURRENCIES.find(c => c.code === config.targetCurrency)?.symbol || '€';
  const rate = getRate();
  const convert = (euroAmount: number) => Math.round(euroAmount * rate);
  const formatMoney = (amount: number) => `${currencySymbol}${amount.toLocaleString()}`;
  
  const countryOption = EUROPEAN_COUNTRIES.find(c => c.value === config.country);
  const countryFlag = countryOption ? countryOption.label.split(' ')[0] : '🌍';

  // --- 2. Economic Cost Adjustments (City Tier) ---
  const cityMultiplier = CITY_TIER_MULTIPLIERS[config.cityTier];
  const housingAdjusted = data.recurringCosts.housingMonthly * cityMultiplier;
  const foodAdjusted = data.recurringCosts.foodMonthly * (1 + (cityMultiplier - 1) * 0.5);
  
  // A. Recurring Monthly (Real Economic Spend)
  const monthlyLivingEuro = 
    housingAdjusted + 
    data.recurringCosts.insuranceMonthly + 
    foodAdjusted + 
    data.recurringCosts.transportMonthly + 
    data.recurringCosts.miscMonthly;

  const yearlyLivingEuro = monthlyLivingEuro * 12;

  // B. Tuition
  const yearlyTuitionEuro = data.tuitionYearly;

  // C. Start-Up Fees (One-time Sunk Costs) 
  const startUpFeesEuro = 
    data.oneTimeCosts.visaAdmin + 
    data.oneTimeCosts.testsAdmissions + 
    data.oneTimeCosts.flightTravel + 
    data.oneTimeCosts.deposit; 

  // --- 3. Scenario 1: Liquidity Requirement (Upfront Cash Flow) ---
  const blockedAccountAmount = data.oneTimeCosts.blockedAccount;
  const isBlockedAccount = blockedAccountAmount > 0;
  
  // Mandatory minimum liquidity
  const mandatoryLiquidityEuro = (isBlockedAccount ? blockedAccountAmount : (data.officialData?.fundingProof.amountEuro || 0)) 
                               + yearlyTuitionEuro 
                               + startUpFeesEuro;

  // Recommended Liquidity based on real costs
  const firstYearEconomicCostEuro = yearlyLivingEuro + yearlyTuitionEuro + startUpFeesEuro;
  const recommendedLiquidityEuro = Math.max(mandatoryLiquidityEuro, firstYearEconomicCostEuro);
  const liquidityGap = Math.max(0, recommendedLiquidityEuro - mandatoryLiquidityEuro);

  // --- 4. Scenario 2: Net Economic Cost & Work Offset ---
  // Subsequent years don't have start-up fees
  const subsequentYearCostEuro = yearlyLivingEuro + yearlyTuitionEuro;
  
  // Total Cost for the full duration
  const totalDegreeCostEuro = firstYearEconomicCostEuro + (subsequentYearCostEuro * Math.max(0, config.durationYears - 1));

  // Work Offset Calculation (Weighted for Semester vs Holidays)
  const semesterWeeks = 38;
  const userSemesterIncome = config.workHoursPerWeek * config.hourlyWage * semesterWeeks;
  
  // Holiday Work: Use user defined weeks * 40h
  const holidayHours = 40; 
  const userHolidayIncome = holidayHours * config.hourlyWage * config.holidayWorkWeeks;
  
  const userYearlyIncomeEuro = userSemesterIncome + userHolidayIncome;
  const userMonthlyAvgIncomeEuro = userYearlyIncomeEuro / 12;

  const totalUserIncomeEuro = userYearlyIncomeEuro * config.durationYears;
  
  // Work Offset Logic:
  const totalFixedCostsEuro = startUpFeesEuro + (yearlyTuitionEuro * config.durationYears);
  const totalLivingCostsEuro = yearlyLivingEuro * config.durationYears;
  
  const uncoveredLivingEuro = Math.max(0, totalLivingCostsEuro - totalUserIncomeEuro);
  const conservativeNetTotalCostEuro = totalFixedCostsEuro + uncoveredLivingEuro;
  
  const livingCostCoveredPercent = monthlyLivingEuro > 0 
    ? Math.min(100, Math.round((userMonthlyAvgIncomeEuro / monthlyLivingEuro) * 100))
    : 0;

  // --- 5. Real-Time Color Feedback Logic ---
  let affordabilityLabel = 'High Cost';
  let affordabilityColor = 'red';
  let gradientClass = 'bg-gradient-to-br from-red-600 to-euro-900';
  
  if (livingCostCoveredPercent >= 90) {
     affordabilityColor = 'green';
     affordabilityLabel = 'Affordable';
     gradientClass = 'bg-gradient-to-br from-green-600 to-euro-900';
  } else if (livingCostCoveredPercent >= 60) {
     affordabilityColor = 'yellow';
     affordabilityLabel = 'Moderate';
     gradientClass = 'bg-gradient-to-br from-yellow-500 to-yellow-700';
  }

  if (config.workHoursPerWeek === 0 && config.holidayWorkWeeks === 0) {
      gradientClass = 'bg-euro-800';
      affordabilityLabel = 'Full Funding Needed';
  }

  // Max Potential Calculation (Standardized)
  const maxLegalSemesterIncome = data.partTimeWork.legalMaxHours * data.partTimeWork.avgStudentWage * semesterWeeks;
  // Assume max 18 weeks of holiday work possible for feasibility check
  const maxLegalHolidayIncome = 40 * data.partTimeWork.avgStudentWage * 18; 
  const maxAnnualPotential = maxLegalSemesterIncome + maxLegalHolidayIncome;
  const maxMonthlyPotential = maxAnnualPotential / 12;
  const maxPotentialCoverage = Math.round((maxMonthlyPotential / monthlyLivingEuro) * 100);
  const isFeasible = maxPotentialCoverage >= 85; 

  const tabs = [
    { id: 'Summary', icon: LayoutDashboard, label: 'Summary' },
    { id: 'Work Feasibility', icon: Briefcase, label: 'Work Feasibility' },
    { id: 'Monthly Living', icon: Home, label: 'Monthly Living' },
    { id: 'Cost Timeline', icon: Calendar, label: 'Cost Timeline' },
    { id: 'Official Sources', icon: ScrollText, label: 'Official Sources' },
  ];

  // --- Render Views ---

  const renderSummary = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Audit Log Banner */}
      {data.auditLog && data.auditLog.length > 0 && showAuditLog && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl overflow-hidden">
           <div className="bg-blue-100/50 px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setShowAuditLog(!showAuditLog)}>
              <div className="flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4 text-brand-blue" />
                 <span className="text-xs font-bold text-brand-blue uppercase tracking-wide">Data Verification & Compliance</span>
              </div>
              <ChevronDown className="h-4 w-4 text-brand-blue" />
           </div>
           <div className="p-3 space-y-1">
              {data.auditLog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-euro-700 leading-relaxed">
                   <span className="mt-0.5 shrink-0">{log.includes('Warning') ? '⚠️' : '✓'}</span>
                   <span className={log.includes('Warning') ? 'font-bold text-orange-700' : ''}>{log.replace('✓', '').replace('⚠️', '')}</span>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* CARD A: UPFRONT LIQUIDITY */}
        <div className="bg-white rounded-2xl p-6 border border-euro-200 shadow-sm relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl select-none grayscale">
              {isBlockedAccount ? '🔒' : '🏦'}
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full border border-red-100 uppercase tracking-wider">
                    Official Visa Financial Requirement
                  </span>
                  {isBlockedAccount && (
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      🔒 Blocked Account
                    </span>
                  )}
                </div>
                
                <h3 className="text-3xl font-serif font-bold text-euro-900 mt-2">
                  {formatMoney(convert(mandatoryLiquidityEuro))}
                </h3>
                
                <p className="text-xs text-euro-500 mt-2 leading-relaxed">
                  {isBlockedAccount 
                    ? `You must freeze €${blockedAccountAmount.toLocaleString()} in a blocked account + pay fees.` 
                    : "Annual Financial Proof (Bank Statement) required for visa + tuition fees."}
                </p>
              </div>

              <div className="space-y-3 mt-6">
                   {/* Disclaimer */}
                   <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-lg text-[10px] text-orange-800 flex gap-2 items-start leading-tight">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-orange-600"/>
                      <span>
                        <strong>⚠️ Warning:</strong> Visa financial requirement estimates are based on current data. These may change — always confirm with the embassy.
                      </span>
                   </div>

                  {liquidityGap > 500 && (
                    <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 flex items-start gap-2 leading-tight">
                        <div className="w-3.5 h-3.5 mt-0.5 shrink-0 text-yellow-600">⚠️</div>
                        <div className="text-[10px] text-yellow-800">
                          <strong>Lifestyle Warning:</strong> Govt minimums are often low. Realistically, plan for <strong>{formatMoney(convert(recommendedLiquidityEuro))}</strong>.
                        </div>
                    </div>
                  )}
              </div>
            </div>
        </div>

        {/* CARD B: NET ECONOMIC COST */}
        <div className={`rounded-2xl p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden transition-all duration-500 h-full ${gradientClass}`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl select-none">
              🎓
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-90 border border-white/30 px-2 py-0.5 rounded-full">
                    {affordabilityLabel}
                  </p>
                  <span className="text-2xl">{countryFlag}</span>
              </div>
              
              <div className="flex items-baseline gap-3 mt-4">
                  <h3 className="text-3xl font-serif font-bold text-white">
                  {formatMoney(convert(conservativeNetTotalCostEuro))}
                </h3>
              </div>
              <p className="text-[10px] text-white/70 uppercase tracking-widest font-medium">Net Degree Cost (After Work)</p>

              {/* Work Impact Visualization */}
              <div className="mt-8">
                  {config.workHoursPerWeek === 0 && config.holidayWorkWeeks === 0 ? (
                    <div className="flex items-start gap-2 bg-white/10 p-3 rounded-xl border border-white/20">
                        <AlertCircle className="h-4 w-4 text-white mt-0.5" />
                        <p className="text-xs text-white/90">
                          <strong>Full funding required.</strong> <br/>
                          Without part-time work, you cover 100% of costs from savings.
                        </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 text-white/90">
                        <span>Living Expenses Covered:</span>
                        <span className="font-bold text-white">{livingCostCoveredPercent}%</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden backdrop-blur-sm border border-white/10">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                          style={{ width: `${Math.min(100, livingCostCoveredPercent)}%` }}
                        />
                      </div>
                      
                      <p className="text-[10px] text-white/80 mt-2 flex items-center gap-1.5 leading-tight">
                          <span>
                            {livingCostCoveredPercent >= 100 
                                ? "🎉 Your work covers all living costs! Remaining cost is just tuition." 
                                : "Income offsets daily living. Savings needed for tuition + gap."}
                          </span>
                      </p>
                    </div>
                  )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderWorkFeasibility = () => (
    <div className="animate-in fade-in duration-300 space-y-6">
       <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-euro-900">Work & Income Potential</h3>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              maxPotentialCoverage >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {maxPotentialCoverage >= 90 ? '✅' : '⚠️'} {maxPotentialCoverage}% Max Coverage
          </span>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Living Cost */}
            <div className="bg-euro-50 p-4 rounded-xl text-center border border-euro-100 flex flex-col items-center justify-center">
              <div className="text-2xl mb-2">🏠</div>
              <div className="text-xs text-euro-500 font-bold uppercase tracking-wide mb-1">Monthly Cost</div>
              <div className="text-lg font-bold text-euro-900">{formatMoney(convert(monthlyLivingEuro))}</div>
            </div>

            {/* Card 2: Potential Income */}
            <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">Max Potential</div>
                <div className="text-lg font-bold text-blue-900">{formatMoney(convert(maxMonthlyPotential))}</div>
                <div className="absolute top-0 right-0 bg-blue-200 text-blue-800 text-[9px] px-1.5 py-0.5 rounded-bl font-medium">
                  Avg/Mo
                </div>
            </div>

            {/* Card 3: Coverage */}
            <div className={`p-4 rounded-xl text-center border flex flex-col items-center justify-center ${maxPotentialCoverage >= 100 ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
                <div className="text-2xl mb-2">{maxPotentialCoverage >= 100 ? '🚀' : '⚖️'}</div>
                <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${maxPotentialCoverage >= 100 ? 'text-green-700' : 'text-yellow-700'}`}>Costs Covered</div>
                <div className={`text-lg font-bold ${maxPotentialCoverage >= 100 ? 'text-green-800' : 'text-yellow-800'}`}>{maxPotentialCoverage}%</div>
            </div>
        </div>

        {/* Verdict */}
        <div className={`flex items-start gap-4 p-4 rounded-xl border ${isFeasible ? 'bg-green-50/50 border-green-200' : 'bg-yellow-50/50 border-yellow-200'}`}>
            <div className="text-2xl mt-0.5">{isFeasible ? '✅' : '⚠️'}</div>
            <div>
              <p className={`text-sm font-bold ${isFeasible ? 'text-green-900' : 'text-yellow-900'}`}>
                  {isFeasible ? 'You can likely cover expenses!' : 'Tight Budget Warning'}
              </p>
              <p className={`text-xs ${isFeasible ? 'text-green-800' : 'text-yellow-800'} mt-1 leading-relaxed`}>
                  {isFeasible 
                    ? "With a standard part-time job (and full-time during breaks), you can cover your daily living expenses. Tuition & setup fees should still come from savings."
                    : "Part-time work alone likely won't cover all living expenses in this city tier. You will need supplemental savings."}
              </p>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-euro-100 overflow-hidden">
            <div className="bg-euro-50/50 px-4 py-2 border-b border-euro-100">
              <span className="text-[10px] font-bold text-euro-500 uppercase tracking-widest">REGULATIONS & RATES</span>
            </div>
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-euro-100">
                <tr>
                  <td className="px-4 py-3 font-medium text-euro-600">Max Semester Hours</td>
                  <td className="px-4 py-3 text-right font-bold text-euro-900">
                    {data.partTimeWork.legalMaxHours}h <span className="text-euro-400 font-normal">/ week</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-euro-600">Break Rules</td>
                  <td className="px-4 py-3 text-right font-bold text-euro-900">
                    40h <span className="text-euro-400 font-normal">/ week (Typically Allowed)</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-euro-600">Work Permit Rule</td>
                  <td className="px-4 py-3 text-right text-xs text-euro-500 max-w-[200px] leading-tight ml-auto block">
                      {data.partTimeWork.regulations}
                  </td>
                </tr>
              </tbody>
            </table>
        </div>
    </div>
  );

  const renderMonthlyLiving = () => (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-euro-900">Monthly Expenses</h3>
        <span className="text-lg font-bold text-euro-900 bg-euro-50 px-3 py-1 rounded-lg border border-euro-100">
          {formatMoney(convert(monthlyLivingEuro))}<span className="text-sm font-normal text-euro-500">/mo</span>
        </span>
      </div>

      <div className="space-y-3">
          <CostRow 
            emoji="🏠"
            label="Housing (Rent + Utils)" 
            amount={convert(housingAdjusted)} 
            currency={currencySymbol}
          />
          <CostRow 
            emoji="🍔"
            label="Food & Groceries" 
            amount={convert(foodAdjusted)} 
            currency={currencySymbol}
          />
          <CostRow 
            emoji="🏥"
            label="Health Insurance" 
            amount={convert(data.recurringCosts.insuranceMonthly)} 
            subtext="Mandatory"
            currency={currencySymbol}
          />
          <CostRow 
            emoji="🚌"
            label="Transport & Leisure" 
            amount={convert(data.recurringCosts.transportMonthly + data.recurringCosts.miscMonthly)} 
            currency={currencySymbol}
          />

          {/* Earnings Deduction */}
          <div className="border-t border-euro-100 pt-3 mt-3 space-y-2">
            <CostRow 
                emoji="💸"
                label="Est. Monthly Income (Avg)" 
                amount={-convert(userMonthlyAvgIncomeEuro)} 
                currency={currencySymbol}
                isDeduction
                subtext={`${config.workHoursPerWeek}h/wk Semester${config.holidayWorkWeeks > 0 ? ` + 40h/wk for ${config.holidayWorkWeeks}wks` : ''}`}
            />
            <div className="bg-euro-50 rounded-lg p-3 flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-euro-800" />
                  <span className="text-sm font-bold text-euro-900">Net Monthly Out-of-Pocket</span>
                </div>
                <span className="text-lg font-bold text-euro-900">
                  {formatMoney(convert(Math.max(0, monthlyLivingEuro - userMonthlyAvgIncomeEuro)))}
                </span>
            </div>
          </div>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-euro-900">Cost Timeline</h3>
          <span className="text-sm font-medium text-euro-500 bg-euro-50 px-3 py-1 rounded-lg">
             Total Degree: <strong>{formatMoney(convert(totalDegreeCostEuro))}</strong>
          </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-euro-100 gap-6 md:gap-0">
        {/* YEAR 1 */}
        <div className="pb-6 md:pb-0 md:pr-6">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-bold text-euro-800 text-base">Year 1</h5>
              <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded">🚀 High Setup Costs</span>
            </div>
            
            <div className="space-y-2">
              <TimelineRow 
                  label="Start-Up Fees" 
                  amount={formatMoney(convert(startUpFeesEuro))} 
                  emoji="✈️"
                  detail="Visa, Travel, Deposits"
              />
              <TimelineRow 
                  label="Tuition" 
                  amount={formatMoney(convert(yearlyTuitionEuro))} 
                  emoji="🎓"
              />
              <TimelineRow 
                  label="Living Expenses" 
                  amount={formatMoney(convert(yearlyLivingEuro))} 
                  emoji="🏠"
              />
              <div className="pt-2 border-t border-euro-100 mt-2 flex justify-between items-center">
                  <span className="text-sm font-bold text-euro-900">Total Year 1</span>
                  <span className="text-base font-bold text-euro-900">{formatMoney(convert(firstYearEconomicCostEuro))}</span>
              </div>
            </div>
        </div>

        {/* SUBSEQUENT YEARS */}
        <div className="pt-6 md:pt-0 md:pl-6 bg-gray-50/30 md:bg-transparent rounded-xl md:rounded-none p-4 md:p-0">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-bold text-euro-600 text-base">Year 2+</h5>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">🔄 Standard Rate</span>
            </div>
            
            <div className="space-y-2 opacity-90">
              <TimelineRow 
                  label="Start-Up Fees" 
                  amount="—" 
                  emoji="✅"
                  isZero
              />
              <TimelineRow 
                  label="Tuition" 
                  amount={formatMoney(convert(yearlyTuitionEuro))} 
                  emoji="🎓"
              />
              <TimelineRow 
                  label="Living Expenses" 
                  amount={formatMoney(convert(yearlyLivingEuro))} 
                  emoji="🏠"
              />
              <div className="pt-2 border-t border-euro-100 mt-2 flex justify-between items-center">
                  <span className="text-sm font-bold text-euro-600">Total Year 2+</span>
                  <span className="text-base font-bold text-euro-600">{formatMoney(convert(subsequentYearCostEuro))}</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderOfficial = () => (
    <div className="animate-in fade-in duration-300">
       <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-euro-900">Government & Visa Data</h3>
          <span className="bg-blue-50 text-brand-blue text-xs font-bold px-2 py-1 rounded border border-blue-100">
             Official Sources
          </span>
       </div>

       <div className="space-y-6">
          {data.officialData && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
                      Visa Financial Requirements
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg border border-blue-100 shadow-sm shrink-0 text-lg">
                        {isBlockedAccount ? '🔒' : '🏦'}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-500 uppercase">Visa Requirement</p>
                        <p className="text-sm text-blue-900 font-medium">{data.officialData.fundingProof.preferredMethod}</p>
                        <p className="text-xs text-blue-600 mt-0.5 leading-tight">
                            Proof: <strong>€{data.officialData.fundingProof.amountEuro.toLocaleString()}</strong>/yr.
                        </p>
                      </div>
                  </div>

                  <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg border border-blue-100 shadow-sm shrink-0 text-lg">
                        🛂
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-500 uppercase">Application Fee</p>
                        <p className="text-sm text-blue-900 font-medium">€{data.officialData.visaFeeEuro}</p>
                      </div>
                  </div>
                </div>

                <a href={data.officialData.fundingProof.officialLink} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white hover:bg-blue-50 text-brand-blue font-bold text-sm py-2.5 rounded-lg border border-blue-200 shadow-sm transition-all hover:shadow-md flex items-center justify-center gap-2">
                   Verify at Official {countryOption?.label} Embassy Page <ExternalLink className="h-4 w-4" />
                </a>
            </div>
          )}
          
          <div className="pt-2">
              <h4 className="text-xs font-bold text-euro-500 uppercase mb-3">Tuition Specifics</h4>
              <CostRow 
                emoji="🎓"
                label="Yearly Tuition"
                amount={convert(data.tuitionYearly)}
                subtext={data.tuitionDetails}
                currency={currencySymbol}
              />
              <div className="mt-4 p-3 bg-gray-50 border border-euro-100 rounded-lg text-[11px] text-euro-500 leading-relaxed">
                * Tuition fees are estimates based on public university averages for {config.studentOrigin} students. Private universities and specific programs (e.g., Medicine, MBA) may be significantly higher. Always verify with your specific university.
              </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-euro-100 overflow-hidden min-h-[600px]">
      
      {/* Tab Navigation */}
      <div className="flex items-center px-2 pt-2 border-b border-euro-100 overflow-x-auto gap-1 scrollbar-hide bg-euro-50/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue/20 ${
              activeTab === tab.id 
                ? 'bg-white text-brand-blue border-b-2 border-brand-blue shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]'
                : 'text-euro-600 hover:text-euro-900 hover:bg-white/50'
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-brand-blue' : 'text-euro-500'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'Summary' && renderSummary()}
        {activeTab === 'Work Feasibility' && renderWorkFeasibility()}
        {activeTab === 'Monthly Living' && renderMonthlyLiving()}
        {activeTab === 'Cost Timeline' && renderTimeline()}
        {activeTab === 'Official Sources' && renderOfficial()}
      </div>

    </div>
  );
};

// --- HELPER COMPONENTS ---

const TimelineRow = ({ label, amount, emoji, detail, isZero }: any) => (
  <div className="flex items-center justify-between py-2 group border-b border-dashed border-euro-100 last:border-0">
     <div className="flex items-center gap-3">
        <span className="text-base bg-euro-50 p-1.5 rounded-md group-hover:scale-110 transition-transform">{emoji}</span>
        <div>
           <span className={`text-sm font-medium ${isZero ? 'text-gray-400' : 'text-euro-700'}`}>{label}</span>
           {detail && <p className="text-[10px] text-gray-500">{detail}</p>}
        </div>
     </div>
     <span className={`font-bold ${isZero ? 'text-gray-400' : 'text-euro-900'}`}>{amount}</span>
  </div>
);

const CostRow = ({ emoji, label, amount, subtext, currency, isDeduction, isTotal }: any) => {
   const textColor = isDeduction ? 'text-green-600' : isTotal ? 'text-euro-900' : 'text-euro-700';
   const amountClass = isTotal ? 'text-lg font-bold' : 'font-semibold';
   const bgClass = isTotal ? 'bg-euro-100' : 'bg-euro-50';
   
   return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${isTotal ? 'mt-2' : ''} ${isDeduction ? 'bg-green-50/50' : 'hover:bg-euro-50/50'} transition-colors group`}>
      <div className="flex items-center gap-3">
          <span className="text-lg">{emoji}</span>
          <div>
            <p className={`text-sm ${textColor} ${isTotal ? 'font-bold' : 'font-medium'}`}>{label}</p>
            {subtext && <p className="text-[10px] text-euro-500 leading-tight">{subtext}</p>}
          </div>
      </div>
      <span className={`${textColor} ${amountClass}`}>
        {isDeduction ? '-' : ''}{currency}{Math.abs(amount).toLocaleString()}
      </span>
    </div>
   );
};