import { jsPDF } from 'jspdf';
import { CostBreakdown, UserConfig } from '../types';
import { CITY_TIER_MULTIPLIERS, SUPPORTED_CURRENCIES } from '../constants';

export const generatePDF = (data: CostBreakdown, config: UserConfig) => {
  const doc = new jsPDF();
  const primaryColor = '#102a43'; // Euro 900
  const accentColor = '#004494'; // Brand Blue
  const greenColor = '#16a34a'; // Success
  
  // --- Helpers ---
  const currencySymbol = SUPPORTED_CURRENCIES.find(c => c.code === config.targetCurrency)?.symbol || '€';
  const rate = data.exchangeRates[config.targetCurrency] || 1;
  const convert = (val: number) => Math.round(val * rate);
  const fmt = (val: number) => `${currencySymbol}${val.toLocaleString()}`;

  const cityMultiplier = CITY_TIER_MULTIPLIERS[config.cityTier];
  const housingAdjusted = data.recurringCosts.housingMonthly * cityMultiplier;
  const foodAdjusted = data.recurringCosts.foodMonthly * (1 + (cityMultiplier - 1) * 0.5);

  // --- Math Logic (Matches ResultPanel) ---
  const monthlyLiving = housingAdjusted + foodAdjusted + data.recurringCosts.insuranceMonthly + data.recurringCosts.transportMonthly + data.recurringCosts.miscMonthly;
  const yearlyLiving = monthlyLiving * 12;
  const yearlyTuition = data.tuitionYearly;
  
  const startupFees = data.oneTimeCosts.visaAdmin + data.oneTimeCosts.testsAdmissions + data.oneTimeCosts.flightTravel + data.oneTimeCosts.deposit;
  
  const firstYearEconomicCost = yearlyLiving + yearlyTuition + startupFees;
  const subsequentYearCost = yearlyLiving + yearlyTuition;
  const totalDegreeCost = firstYearEconomicCost + (subsequentYearCost * Math.max(0, config.durationYears - 1));

  // Income Calculation
  const semesterWeeks = 38;
  const holidayHours = 40; 
  const userSemesterIncome = config.workHoursPerWeek * config.hourlyWage * semesterWeeks;
  const userHolidayIncome = holidayHours * config.hourlyWage * config.holidayWorkWeeks;
  const totalAnnualUserIncome = userSemesterIncome + userHolidayIncome;

  const totalUserIncome = totalAnnualUserIncome * config.durationYears;
  const netTotalCost = totalDegreeCost - totalUserIncome;

  const blockedAccountAmount = data.oneTimeCosts.blockedAccount;
  const isBlockedAccount = blockedAccountAmount > 0;
  const mandatoryLiquidity = (isBlockedAccount ? blockedAccountAmount : (data.officialData?.fundingProof.amountEuro || 0)) + yearlyTuition + startupFees;


  // --- Header ---
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("EuroStudy Estimate", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text("Comprehensive Financial Plan", 20, 28);
  
  doc.setTextColor(255, 255, 255);
  doc.text(`Prepared for: ${config.name || 'Student'}`, 190, 20, { align: 'right' });
  doc.text(`${new Date().toLocaleDateString()}`, 190, 28, { align: 'right' });

  // --- Scenarios Section ---
  let yPos = 55;
  
  // Left Box: Liquidity
  doc.setFillColor(240, 244, 248);
  doc.rect(20, yPos, 80, 45, 'F');
  doc.setTextColor(primaryColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("REQUIRED UPFRONT (LIQUIDITY)", 25, yPos + 10);
  doc.setFontSize(20);
  doc.text(fmt(convert(mandatoryLiquidity)), 25, yPos + 22);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(isBlockedAccount ? "Includes Blocked Account + Tuition" : "Includes Proof of Funds + Tuition", 25, yPos + 30);
  doc.setTextColor(220, 38, 38); // Red
  doc.text("Mandatory for Visa", 25, yPos + 38);

  // Right Box: Net Cost
  doc.setFillColor(236, 254, 255); // Light Blue
  doc.rect(110, yPos, 80, 45, 'F');
  doc.setTextColor(primaryColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("NET DEGREE COST (Estimate)", 115, yPos + 10);
  doc.setFontSize(20);
  doc.setTextColor(accentColor);
  doc.text(fmt(convert(Math.max(0, netTotalCost))), 115, yPos + 22);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Total Cost: ${fmt(convert(totalDegreeCost))}`, 115, yPos + 30);
  if (totalUserIncome > 0) {
      doc.setTextColor(greenColor);
      doc.text(`Work Savings: -${fmt(convert(totalUserIncome))}`, 115, yPos + 38);
  } else {
      doc.setTextColor(234, 179, 8); // Yellow
      doc.text("No work offset selected", 115, yPos + 38);
  }

  yPos += 55;

  // --- Detailed Timeline ---
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Yearly Breakdown", 20, yPos);
  
  yPos += 10;
  
  // Table Header
  doc.setFillColor(230, 230, 230);
  doc.rect(20, yPos - 6, 170, 8, 'F');
  doc.setFontSize(9);
  doc.text("Cost Category", 25, yPos);
  doc.text("Year 1 (Setup)", 100, yPos);
  doc.text("Year 2+ (Recurring)", 160, yPos);
  
  yPos += 10;
  doc.setFont("helvetica", "normal");
  
  const addRow = (label: string, v1: string, v2: string) => {
      doc.text(label, 25, yPos);
      doc.text(v1, 100, yPos);
      doc.text(v2, 160, yPos);
      yPos += 8;
  };

  addRow("Start-Up Fees (Visa, Flight, Dep)", fmt(convert(startupFees)), "—");
  addRow("Tuition Fees", fmt(convert(yearlyTuition)), fmt(convert(yearlyTuition)));
  addRow("Living Expenses", fmt(convert(yearlyLiving)), fmt(convert(yearlyLiving)));
  
  yPos += 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos - 6, 190, yPos - 6);
  
  doc.setFont("helvetica", "bold");
  addRow("TOTAL", fmt(convert(firstYearEconomicCost)), fmt(convert(subsequentYearCost)));

  yPos += 10;
  
  // --- Monthly Living Breakdown ---
  doc.setFontSize(12);
  doc.text(`Monthly Budget for ${config.cityTier}`, 20, yPos);
  yPos += 10;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const addBudget = (label: string, val: number) => {
      doc.text(label, 25, yPos);
      doc.text(fmt(val), 180, yPos, {align: 'right'});
      yPos += 6;
  };

  addBudget("Housing", convert(housingAdjusted));
  addBudget("Food", convert(foodAdjusted));
  addBudget("Insurance", convert(data.recurringCosts.insuranceMonthly));
  addBudget("Transport & Misc", convert(data.recurringCosts.transportMonthly + data.recurringCosts.miscMonthly));
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, 190, yPos);
  yPos += 6;
  doc.setFont("helvetica", "bold");
  addBudget("Total Monthly Need", convert(monthlyLiving));

  // --- Disclaimer Footer ---
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text("Disclaimer: Visa financial requirements and costs are estimates based on available data.", 20, 275);
  doc.text("Regulations change frequently. Always confirm specific requirements with the official embassy.", 20, 280);
  doc.text("EuroStudy Estimate © 2025", 190, 280, {align: 'right'});

  doc.save("EuroStudy_Plan.pdf");
};