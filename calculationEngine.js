/**
 * Quoteology Calculation Engine
 * Implements Excel formula logic for Saudi Arabia, India, Australia
 */
const { Currency } = require('../models/Currency');
const CountryConfig = require('../models/CountryConfig');
const MedicalInsurance = require('../models/MedicalInsurance');

// Convert any pay frequency to per-day multiplier
const FREQ_MULTIPLIER = {
  'Per Hour':  8,
  'Per Day':   1,
  'Per Week':  1 / 5,
  'Per Month': 12 / 260,
  'Per Year':  1 / 260,
};

const toPerDay = (amount, freq) => amount * (FREQ_MULTIPLIER[freq] || 1);

// Load country config as { key: numericValue } object
const getConfig = async (country) => {
  const rows = await CountryConfig.findAll({ where: { country } });
  const obj = {};
  rows.forEach(r => {
    const num = parseFloat(r.param_value);
    obj[r.param_key] = isNaN(num) ? r.param_value : num;
  });
  return obj;
};

// Get units-per-USD for a currency code
const getRate = async (code) => {
  const c = await Currency.findOne({ where: { code } });
  return c ? parseFloat(c.units_per_usd) : 1;
};

// Get insurance cost in outputCurrency per day
const insurancePerDay = async (name, outputCode) => {
  if (!name || name === 'None' || name === 'Percentage') return 0;
  const plan = await MedicalInsurance.findOne({ where: { name, is_active: true } });
  if (!plan) return 0;
  const planRate = await getRate(plan.currency_code); // plan-currency per USD
  const outRate  = await getRate(outputCode);          // output-currency per USD
  const amountUSD = plan.frequency === 'Per Month'
    ? (parseFloat(plan.amount) * 12) / planRate
    : parseFloat(plan.amount) / planRate;
  return (amountUSD * outRate) / 260;
};

// ── SAUDI ARABIA ────────────────────────────────────────────────────────────
const calcSaudi = async (inputs) => {
  const {
    billRate, payFrequency, contractorType,
    medicalInsuranceName, includeEOSB, includeMOL,
    includeVisa, visaType, includeMob, invoiceFromKSA, outputCurrency,
  } = inputs;

  const cfg = await getConfig('Saudi Arabia');
  const outRate = await getRate(outputCurrency);
  const sarRate = await getRate('SAR');

  const ratePerDay = toPerDay(billRate, payFrequency);

  // Salary split
  const housingPct   = cfg.housing_allowance_pct;
  const transportPct = cfg.transport_allowance_pct;
  const basicPct     = 1 - housingPct - transportPct;
  const basicPerDay  = ratePerDay * basicPct;
  const housingPerDay    = ratePerDay * housingPct;
  const transportPerDay  = ratePerDay * transportPct;

  // SS Employee (deduction from gross to get net)
  const ssEmpPct  = contractorType === 'Expat' ? cfg.ss_employee_pct : 0;
  const ssEmpAmt  = ssEmpPct * ratePerDay;
  const netToMan  = ratePerDay - ssEmpAmt;

  // Gross rate to man = bill rate (already gross)
  const grossToMan = ratePerDay;

  // SS Employer / WHT on pay
  let ssErAmt, ssErPct, ssErLabel;
  if (contractorType === 'Local') {
    ssErPct = cfg.ss_employer_local_pct; ssErLabel = 'SS - Employer';
    ssErAmt = ssErPct * grossToMan;
  } else if (contractorType === 'Expat') {
    ssErPct = cfg.ss_employer_expat_pct; ssErLabel = 'SS - Employer';
    ssErAmt = ssErPct * grossToMan;
  } else {
    ssErPct = cfg.ss_employer_other_pct; ssErLabel = 'WHT on Expat Pay';
    ssErAmt = (grossToMan / (1 - ssErPct)) - grossToMan; // gross-up
  }

  // Medical insurance
  let medAmt;
  if (medicalInsuranceName === 'Percentage') {
    medAmt = 0.021 * grossToMan; // default pct
  } else {
    medAmt = await insurancePerDay(medicalInsuranceName, outputCurrency);
  }

  // Annual leave
  const leaveDays = cfg.holiday_days;
  const wdYear    = cfg.working_days_year || 260;
  const leaveAmt  = (leaveDays / wdYear) * grossToMan;

  // Worker's compensation
  const wcAmt = cfg.workers_compensation_pct * grossToMan;

  // EOSB: 15 days per 260 working-day year × basic
  const eosbAmt = includeEOSB ? (cfg.eosb_days / 260) * basicPerDay : 0;

  // MOL Liabilities
  const molPct = contractorType === 'Local' ? cfg.mol_local_pct : cfg.mol_expat_pct;
  const molAmt = includeMOL ? molPct * grossToMan : 0;

  // Visa costs (SAR → output currency → per day)
  let visaAmt = 0;
  if (includeVisa && visaType && visaType !== 'None') {
    const visaMap = {
      'AP Iqama':           cfg.visa_ap_iqama,
      'China Harbour Iqama':cfg.visa_china_harbour,
      'Work Permit':        cfg.visa_work_permit,
    };
    const visaSAR = visaMap[visaType] || 0;
    visaAmt = ((visaSAR / sarRate) * outRate) / wdYear;
  }

  // Mobilisation
  let mobAmt = 0;
  if (includeMob && contractorType === 'Expat') {
    mobAmt = ((cfg.mob_costs_default / 1) * outRate) / wdYear; // mob is in USD
  }

  const totalBurdens = ssErAmt + medAmt + leaveAmt + wcAmt + eosbAmt + molAmt + visaAmt + mobAmt;
  const grossPostBurdens = grossToMan + totalBurdens;

  // Quoteology fee
  const feeAmt = cfg.quoteology_fee_pct * grossPostBurdens;
  const invoicePreTax = grossPostBurdens + feeAmt;

  // VAT or WHT
  const usesVAT = invoiceFromKSA !== false;
  const taxLabel = usesVAT ? 'VAT' : 'WHT';
  const taxRate  = usesVAT ? cfg.vat_rate : cfg.wht_rate;
  const taxAmt   = usesVAT
    ? invoicePreTax * taxRate
    : (invoicePreTax / (1 - taxRate)) - invoicePreTax;
  const invoicePostTax = invoicePreTax + taxAmt;

  return {
    country: 'Saudi Arabia',
    currency: outputCurrency,
    payFrequency,
    contractorType,
    billRatePerDay: ratePerDay,
    multiplierPreTax:  parseFloat((invoicePreTax  / ratePerDay).toFixed(4)),
    multiplierPostTax: parseFloat((invoicePostTax / ratePerDay).toFixed(4)),
    breakdown: {
      netRateToMan:       { label: 'Net Rate to Man',                     value: netToMan,        rate: null },
      ssEmployee:         { label: 'SS - Employee',                       value: -ssEmpAmt,       rate: ssEmpPct > 0 ? -ssEmpPct : null },
      grossRateToMan:     { label: 'Gross Rate to Man',                   value: grossToMan,      isSubtotal: true },
      salarySplit: [
        { label: 'Basic',     value: basicPerDay,     rate: basicPct },
        { label: 'Housing',   value: housingPerDay,   rate: housingPct },
        { label: 'Transport', value: transportPerDay, rate: transportPct },
      ],
      burdens: {
        label: 'In-Country Burdens',
        total: totalBurdens,
        items: [
          { label: ssErLabel,                    value: ssErAmt,  rate: ssErPct },
          { label: 'Medical Insurance',           value: medAmt,   rate: grossToMan ? medAmt / grossToMan : 0 },
          { label: 'Annual Leaves',               value: leaveAmt, rate: leaveDays / wdYear },
          { label: "Worker's Compensation",       value: wcAmt,    rate: cfg.workers_compensation_pct },
          { label: 'End of Service Benefit',      value: eosbAmt,  rate: grossToMan ? eosbAmt / grossToMan : 0 },
          { label: 'MOL Liabilities',             value: molAmt,   rate: molPct },
          { label: 'Visa Costs',                  value: visaAmt,  rate: grossToMan ? visaAmt / grossToMan : 0 },
          { label: 'Mobilisation Costs',          value: mobAmt,   rate: grossToMan ? mobAmt / grossToMan : 0 },
        ],
      },
      grossRatePostBurdens: { label: 'Gross Rate Post Employer Burdens', value: grossPostBurdens, isSubtotal: true },
      quoteologyFee:        { label: 'Quoteology Fee',                   value: feeAmt,           rate: cfg.quoteology_fee_pct },
      invoicePreTax:        { label: 'Invoice Value Pre Tax',            value: invoicePreTax,    isSubtotal: true },
      tax:                  { label: taxLabel,                            value: taxAmt,           rate: taxRate },
      invoicePostTax:       { label: 'Invoice Value Post Tax',           value: invoicePostTax,   isTotal: true },
    },
  };
};

// ── INDIA ─────────────────────────────────────────────────────────────────────
const calcIndia = async (inputs) => {
  const { billRate, payFrequency, contractorType, medicalInsuranceName, outputCurrency } = inputs;

  const cfg    = await getConfig('India');
  const outRate = await getRate(outputCurrency);
  const inrRate = await getRate('INR');
  const wdYear  = cfg.working_days_year || 260;

  const ratePerDay = toPerDay(billRate, payFrequency);
  const grossToMan = ratePerDay;

  // Annual income in INR for surcharge threshold
  const annualINR = (grossToMan / outRate) * inrRate * wdYear;
  const surchargeRate = annualINR > 10000000 ? cfg.surcharge_rate_high : cfg.surcharge_rate_low;

  // SS Employee deduction
  let ssEmpAmt, ssEmpLabel;
  if (contractorType === 'Expat') {
    ssEmpAmt   = cfg.ss_employee_expat_pct * grossToMan;
    ssEmpLabel = 'SS Employee - PF (Expat)';
  } else {
    // Local: 12% of min(15000 INR/month converted to output/day, grossToMan)
    const fixedMonthINR     = cfg.ss_employee_local_fixed; // 15000 INR
    const fixedDayOutput    = ((fixedMonthINR / inrRate) * outRate) / (wdYear / 12);
    const cappedBase        = Math.min(grossToMan, fixedDayOutput);
    ssEmpAmt   = cfg.ss_employee_local_pct * cappedBase;
    ssEmpLabel = 'SS Employee - PF (Local)';
  }

  const pitAmt        = cfg.pit_top_rate * grossToMan;
  const surchargeAmt  = surchargeRate * pitAmt;
  const edCessAmt     = cfg.education_cess * (pitAmt + surchargeAmt);
  const netToMan      = grossToMan - ssEmpAmt - pitAmt - surchargeAmt - edCessAmt;

  // Employer burdens
  const ssErAmt   = cfg.ss_employer_pct * grossToMan;
  // Profession tax: 2500 INR/year → output currency per day
  const profTaxAmt = ((cfg.profession_tax_annual / inrRate) * outRate) / wdYear;
  // Medical
  let medAmt;
  if (medicalInsuranceName === 'Percentage') {
    medAmt = 0;
  } else {
    medAmt = await insurancePerDay(medicalInsuranceName, outputCurrency);
  }
  // Holidays
  const leaveAmt = (cfg.holiday_days / wdYear) * grossToMan;

  const totalBurdens    = ssErAmt + profTaxAmt + medAmt + leaveAmt;
  const grossPostBurdens = grossToMan + totalBurdens;

  // Fee
  const feeAmt     = cfg.quoteology_fee_pct * grossToMan;
  const invoicePreTax  = grossPostBurdens + feeAmt;
  const gstAmt         = cfg.gst_rate * invoicePreTax;
  const invoicePostTax = invoicePreTax + gstAmt;

  return {
    country: 'India',
    currency: outputCurrency,
    payFrequency,
    contractorType,
    billRatePerDay: ratePerDay,
    multiplierPreTax:  parseFloat((invoicePreTax  / ratePerDay).toFixed(4)),
    multiplierPostTax: parseFloat((invoicePostTax / ratePerDay).toFixed(4)),
    breakdown: {
      netRateToMan:       { label: 'Net Rate to Man',               value: netToMan,       rate: null },
      ssEmployee:         { label: ssEmpLabel,                       value: -ssEmpAmt,      rate: contractorType === 'Expat' ? -cfg.ss_employee_expat_pct : null },
      pitTopRate:         { label: 'PIT - Top Rate',                value: -pitAmt,        rate: -cfg.pit_top_rate },
      surcharge:          { label: 'Surcharge - Top Rate',          value: -surchargeAmt,  rate: -surchargeRate },
      edCess:             { label: 'Education Cess',                value: -edCessAmt,     rate: -cfg.education_cess },
      grossRateToMan:     { label: 'Gross Rate to Man',             value: grossToMan,     isSubtotal: true },
      burdens: {
        label: 'In-Country Burdens',
        total: totalBurdens,
        items: [
          { label: 'SS Employer - Provident Fund & Pension', value: ssErAmt,    rate: cfg.ss_employer_pct },
          { label: 'Profession Tax',                         value: profTaxAmt, rate: grossToMan ? profTaxAmt / grossToMan : 0 },
          { label: 'Medical Insurance',                      value: medAmt,     rate: grossToMan ? medAmt / grossToMan : 0 },
          { label: 'Holidays',                               value: leaveAmt,   rate: cfg.holiday_days / wdYear },
        ],
      },
      grossRatePostBurdens: { label: 'Gross Rate Post Employer Burdens', value: grossPostBurdens, isSubtotal: true },
      quoteologyFee:        { label: 'Quoteology Fee',                   value: feeAmt,           rate: cfg.quoteology_fee_pct },
      invoicePreTax:        { label: 'Invoice Value Pre Tax',            value: invoicePreTax,    isSubtotal: true },
      tax:                  { label: 'GST',                              value: gstAmt,           rate: cfg.gst_rate },
      invoicePostTax:       { label: 'Invoice Value Post Tax',           value: invoicePostTax,   isTotal: true },
    },
  };
};

// ── AUSTRALIA ─────────────────────────────────────────────────────────────────
const calcAustralia = async (inputs) => {
  const { billRate, payFrequency, contractorType, medicalInsuranceName, stateTerritory, outputCurrency } = inputs;

  const cfg    = await getConfig('Australia');
  const wdYear = cfg.working_days_year || 260;
  const ratePerDay = toPerDay(billRate, payFrequency);
  const grossToMan  = ratePerDay;

  // Tax deductions
  const ssEmpPct = cfg.ss_employee_pct;
  const topTax   = cfg.top_rate_tax;
  const ssEmpAmt = ssEmpPct * grossToMan;
  const taxAmt2  = topTax * grossToMan;
  const netToMan = grossToMan - ssEmpAmt - taxAmt2;

  // Payroll tax by state
  const stateKey = {
    'New South Wales':              'payroll_tax_nsw',
    'Victoria':                     'payroll_tax_vic',
    'Australian Capital Territory': 'payroll_tax_act',
    'Queensland':                   'payroll_tax_qld',
    'South Australia':              'payroll_tax_sa',
    'Northern Territory':           'payroll_tax_nt',
    'Western Australia':            'payroll_tax_wa',
  };
  const ptRate = cfg[stateKey[stateTerritory] || 'payroll_tax_wa'];
  const ptAmt  = ptRate * grossToMan;

  // Superannuation
  const superRate = cfg.superannuation_rate;
  const superAmt  = superRate * grossToMan;

  // Medical insurance
  let medAmt;
  if (!medicalInsuranceName || medicalInsuranceName === 'Percentage') {
    medAmt = cfg.medical_insurance_pct * grossToMan;
  } else {
    medAmt = await insurancePerDay(medicalInsuranceName, outputCurrency);
  }

  // Annual leave
  const leaveAmt = (cfg.holiday_days / wdYear) * grossToMan;

  const totalBurdens    = superAmt + ptAmt + medAmt + leaveAmt;
  const grossPostBurdens = grossToMan + totalBurdens;

  // Fee: max(variable, min) — no fixed fee added on top, just max of variable vs min
  const feeVariable = cfg.quoteology_fee_pct * grossPostBurdens;
  const feeMin      = cfg.quoteology_fee_min / wdYear;
  const feeAmt      = Math.max(feeVariable, feeMin);

  const invoicePreTax  = grossPostBurdens + feeAmt;
  const gstAmt         = cfg.gst_rate * invoicePreTax;
  const invoicePostTax = invoicePreTax + gstAmt;

  return {
    country: 'Australia',
    currency: outputCurrency,
    payFrequency,
    contractorType,
    stateTerritory,
    billRatePerDay: ratePerDay,
    multiplierPreTax:  parseFloat((invoicePreTax  / ratePerDay).toFixed(4)),
    multiplierPostTax: parseFloat((invoicePostTax / ratePerDay).toFixed(4)),
    breakdown: {
      netRateToMan:   { label: 'Net Rate to Man',              value: netToMan,  rate: null },
      ssEmployee:     { label: 'SS - Employee Contributions',  value: -ssEmpAmt, rate: -ssEmpPct },
      topRateTax:     { label: 'Top Rate Income Tax',          value: -taxAmt2,  rate: -topTax },
      grossRateToMan: { label: 'Gross Rate to Man',            value: grossToMan, isSubtotal: true },
      burdens: {
        label: 'In-Country Burdens',
        total: totalBurdens,
        items: [
          { label: "Employer's SS - Superannuation Guarantee Levy", value: superAmt, rate: superRate },
          { label: `Payroll Tax (${stateTerritory})`,               value: ptAmt,    rate: ptRate },
          { label: 'Medical Insurance',                              value: medAmt,   rate: grossToMan ? medAmt / grossToMan : 0 },
          { label: 'Annual Leaves',                                  value: leaveAmt, rate: cfg.holiday_days / wdYear },
        ],
      },
      grossRatePostBurdens: { label: 'Gross Rate Post Employer Burdens', value: grossPostBurdens, isSubtotal: true },
      quoteologyFee:        { label: 'Quoteology Fee',                   value: feeAmt,           rate: cfg.quoteology_fee_pct },
      invoicePreTax:        { label: 'Invoice Value Pre Tax',            value: invoicePreTax,    isSubtotal: true },
      tax:                  { label: 'GST',                              value: gstAmt,           rate: cfg.gst_rate },
      invoicePostTax:       { label: 'Invoice Value Post Tax',           value: invoicePostTax,   isTotal: true },
    },
  };
};

const calculate = async (country, inputs) => {
  if (country === 'Saudi Arabia') return calcSaudi(inputs);
  if (country === 'India')        return calcIndia(inputs);
  if (country === 'Australia')    return calcAustralia(inputs);
  throw new Error(`Unsupported country: ${country}`);
};

module.exports = { calculate };
