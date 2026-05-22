require('dotenv').config();
const sequelize        = require('../../config/database');
const User             = require('../models/User');
const { Currency }     = require('../models/Currency');
const MedicalInsurance = require('../models/MedicalInsurance');
const Role             = require('../models/Role');
const CountryConfig    = require('../models/CountryConfig');
const Client           = require('../models/Client');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    await sequelize.sync({ force: true });
    console.log('Tables created');

    await User.bulkCreate([
      { name:'Admin User',   email:'admin@quoteology.com', password:'Admin@123', role:'admin' },
      { name:'Regular User', email:'user@quoteology.com',  password:'User@123',  role:'user'  },
    ]);
    console.log('Users seeded');

    await Currency.bulkCreate([
      { code:'USD', name:'US Dollar',           units_per_usd:1,         usd_per_unit:1 },
      { code:'EUR', name:'Euro',                units_per_usd:0.9316,    usd_per_unit:1.0735 },
      { code:'GBP', name:'British Pound',       units_per_usd:0.8270,    usd_per_unit:1.2092 },
      { code:'INR', name:'Indian Rupee',        units_per_usd:82.6649,   usd_per_unit:0.0121 },
      { code:'AUD', name:'Australian Dollar',   units_per_usd:1.4408,    usd_per_unit:0.6940 },
      { code:'CAD', name:'Canadian Dollar',     units_per_usd:1.3430,    usd_per_unit:0.7446 },
      { code:'SGD', name:'Singapore Dollar',    units_per_usd:1.3254,    usd_per_unit:0.7545 },
      { code:'AED', name:'Emirati Dirham',      units_per_usd:3.6725,    usd_per_unit:0.2723 },
      { code:'SAR', name:'Saudi Arabian Riyal', units_per_usd:3.75,      usd_per_unit:0.2667 },
      { code:'QAR', name:'Qatari Riyal',        units_per_usd:3.64,      usd_per_unit:0.2747 },
      { code:'OMR', name:'Omani Rial',          units_per_usd:0.3846,    usd_per_unit:2.6004 },
      { code:'KWD', name:'Kuwaiti Dinar',       units_per_usd:0.3057,    usd_per_unit:3.2707 },
      { code:'BHD', name:'Bahraini Dinar',      units_per_usd:0.3760,    usd_per_unit:2.6596 },
      { code:'JPY', name:'Japanese Yen',        units_per_usd:131.2587,  usd_per_unit:0.0076 },
      { code:'CNY', name:'Chinese Yuan',        units_per_usd:6.7888,    usd_per_unit:0.1473 },
      { code:'HKD', name:'Hong Kong Dollar',    units_per_usd:7.8499,    usd_per_unit:0.1274 },
      { code:'NZD', name:'New Zealand Dollar',  units_per_usd:1.5844,    usd_per_unit:0.6312 },
      { code:'CHF', name:'Swiss Franc',         units_per_usd:0.9199,    usd_per_unit:1.0871 },
      { code:'SEK', name:'Swedish Krona',       units_per_usd:10.5812,   usd_per_unit:0.0945 },
      { code:'NOK', name:'Norwegian Krone',     units_per_usd:10.3005,   usd_per_unit:0.0971 },
      { code:'DKK', name:'Danish Krone',        units_per_usd:6.9309,    usd_per_unit:0.1443 },
      { code:'ZAR', name:'South African Rand',  units_per_usd:17.7601,   usd_per_unit:0.0563 },
      { code:'PKR', name:'Pakistani Rupee',     units_per_usd:276.2012,  usd_per_unit:0.00362 },
      { code:'MYR', name:'Malaysian Ringgit',   units_per_usd:4.2987,    usd_per_unit:0.2326 },
      { code:'THB', name:'Thai Baht',           units_per_usd:33.4870,   usd_per_unit:0.0299 },
      { code:'PHP', name:'Philippine Peso',     units_per_usd:54.8012,   usd_per_unit:0.0182 },
      { code:'KRW', name:'South Korean Won',    units_per_usd:1261.5647, usd_per_unit:0.000793 },
      { code:'BRL', name:'Brazilian Real',      units_per_usd:5.2212,    usd_per_unit:0.19153 },
      { code:'MXN', name:'Mexican Peso',        units_per_usd:18.9630,   usd_per_unit:0.05273 },
      { code:'EGP', name:'Egyptian Pound',      units_per_usd:30.3632,   usd_per_unit:0.0329 },
      { code:'IQD', name:'Iraqi Dinar',         units_per_usd:1458.628,  usd_per_unit:0.000686 },
      { code:'JOD', name:'Jordanian Dinar',     units_per_usd:0.709,     usd_per_unit:1.41044 },
      { code:'RUB', name:'Russian Ruble',       units_per_usd:73.0872,   usd_per_unit:0.01368 },
      { code:'TRY', name:'Turkish Lira',        units_per_usd:18.8292,   usd_per_unit:0.05311 },
      { code:'PLN', name:'Polish Zloty',        units_per_usd:4.4157,    usd_per_unit:0.22646 },
      { code:'ILS', name:'Israeli Shekel',      units_per_usd:3.4899,    usd_per_unit:0.28654 },
      { code:'NGN', name:'Nigerian Naira',      units_per_usd:460.405,   usd_per_unit:0.00217 },
      { code:'KES', name:'Kenyan Shilling',     units_per_usd:125.0831,  usd_per_unit:0.0080 },
      { code:'XOF', name:'CFA Franc',           units_per_usd:611.071,   usd_per_unit:0.001636 },
      { code:'MAD', name:'Moroccan Dirham',     units_per_usd:10.2415,   usd_per_unit:0.09764 },
    ]);
    console.log('Currencies seeded');

    await MedicalInsurance.bulkCreate([
      { name:'BUPA - Excl. Dental - Under 21',                amount:344,     currency_code:'GBP', frequency:'Per Year' },
      { name:'BUPA - Excl. Dental - 21 to 65',               amount:692,     currency_code:'GBP', frequency:'Per Year' },
      { name:'BUPA - Excl. Dental - 65 or over',             amount:1380,    currency_code:'GBP', frequency:'Per Year' },
      { name:'BUPA - Incl. Dental - Under 21',               amount:360,     currency_code:'GBP', frequency:'Per Year' },
      { name:'BUPA - Incl. Dental - 21 to 65',               amount:720,     currency_code:'GBP', frequency:'Per Year' },
      { name:'BUPA - Incl. Dental - 65 or over',             amount:1440,    currency_code:'GBP', frequency:'Per Year' },
      { name:'BUPA - Incl. USA & Dental - Under 21',         amount:408,     currency_code:'GBP', frequency:'Per Year' },
      { name:'BUPA - Incl. USA & Dental - 21 to 65',        amount:812,     currency_code:'GBP', frequency:'Per Year' },
      { name:'BUPA - Incl. USA & Dental - 65 or over',      amount:1624,    currency_code:'GBP', frequency:'Per Year' },
      { name:'GMAT',                                         amount:480.28,  currency_code:'GBP', frequency:'Per Year' },
      { name:'GMAT Iraq/Kurdistan - Equal Rotation',         amount:449,     currency_code:'GBP', frequency:'Per Year' },
      { name:'GMAT Iraq/Kurdistan - Unequal Rotation',       amount:598.85,  currency_code:'GBP', frequency:'Per Year' },
      { name:'AD&D - Equal Rotation - GBP50k',               amount:139.18,  currency_code:'GBP', frequency:'Per Year' },
      { name:'AD&D - Equal Rotation - GBP250k',              amount:695.88,  currency_code:'GBP', frequency:'Per Year' },
      { name:'AD&D - Equal Rotation - GBP500k',              amount:1391.82, currency_code:'GBP', frequency:'Per Year' },
      { name:'AD&D - Equal Rotation - GBP595k',              amount:1832.67, currency_code:'GBP', frequency:'Per Year' },
      { name:'AD&D - 24hr GBP1m',                            amount:3665.20, currency_code:'GBP', frequency:'Per Year' },
      { name:'AD&D - Unequal Rotation - GBP50k',             amount:185.55,  currency_code:'GBP', frequency:'Per Year' },
      { name:'AD&D - Unequal Rotation - GBP500k',            amount:1855.55, currency_code:'GBP', frequency:'Per Year' },
      { name:'ACIC - Onshore',                               amount:264.60,  currency_code:'GBP', frequency:'Per Year' },
      { name:'ACIC - Offshore',                              amount:358.69,  currency_code:'GBP', frequency:'Per Year' },
      { name:'KAIC - GBP50k',                                amount:11.38,   currency_code:'GBP', frequency:'Per Year' },
      { name:'KAIC - GBP50k / Saudi Aramco',                 amount:11.38,   currency_code:'GBP', frequency:'Per Year' },
      { name:'KAIC - GBP75k / Saudi Aramco',                 amount:16.35,   currency_code:'GBP', frequency:'Per Year' },
      { name:'KAIC - GBP100k / Saudi Aramco',                amount:21.09,   currency_code:'GBP', frequency:'Per Year' },
      { name:'KAIC - GBP125k / Saudi Aramco',                amount:26.29,   currency_code:'GBP', frequency:'Per Year' },
      { name:'KAIC - GBP150k',                               amount:31.25,   currency_code:'GBP', frequency:'Per Year' },
      { name:'KAIC - GBP250k / Mozambique',                  amount:51.08,   currency_code:'GBP', frequency:'Per Year' },
      { name:'Cigna - Local Medical Insurance Category A',   amount:4286.85, currency_code:'SAR', frequency:'Per Year' },
      { name:'Cigna - Local Medical Insurance Category B',   amount:2857.91, currency_code:'SAR', frequency:'Per Year' },
      { name:'Cigna - Local Medical Insurance VIP',          amount:5715.79, currency_code:'SAR', frequency:'Per Year' },
      { name:'Cigna - Spouse Category A',                    amount:4286.85, currency_code:'SAR', frequency:'Per Year' },
      { name:'Cigna - Spouse Category B',                    amount:2857.91, currency_code:'SAR', frequency:'Per Year' },
      { name:'Cigna - Spouse VIP',                           amount:5715.79, currency_code:'SAR', frequency:'Per Year' },
      { name:'Cigna - Child Category A',                     amount:2143.43, currency_code:'SAR', frequency:'Per Year' },
      { name:'Cigna - Child Category B',                     amount:1428.94, currency_code:'SAR', frequency:'Per Year' },
      { name:'Cigna - Child VIP',                            amount:2857.91, currency_code:'SAR', frequency:'Per Year' },
      { name:'Oman (Dubai) - Comprehensive',                 amount:2852,    currency_code:'AED', frequency:'Per Year' },
      { name:'Oman (Dubai) - Comprehensive Plus',            amount:3563,    currency_code:'AED', frequency:'Per Year' },
      { name:'Oman (Dubai) - Premium',                       amount:3901,    currency_code:'AED', frequency:'Per Year' },
      { name:'Oman (Abu Dhabi) - Comprehensive',             amount:2695,    currency_code:'AED', frequency:'Per Year' },
      { name:'Oman (Abu Dhabi) - Comprehensive Plus',        amount:3522,    currency_code:'AED', frequency:'Per Year' },
      { name:'Oman (Abu Dhabi) - Premium',                   amount:3823,    currency_code:'AED', frequency:'Per Year' },
      { name:'Oman Insurance Category A - Local',            amount:238.15,  currency_code:'OMR', frequency:'Per Year' },
      { name:'Oman Insurance Category B - Local',            amount:164.45,  currency_code:'OMR', frequency:'Per Year' },
      { name:'QLM - Local Health Insurance',                 amount:2822,    currency_code:'QAR', frequency:'Per Year' },
      { name:'QLM - Dental Cover',                           amount:937,     currency_code:'QAR', frequency:'Per Year' },
      { name:'QLM - Local Health Insurance with Dental',     amount:3759,    currency_code:'QAR', frequency:'Per Year' },
      { name:'AXA Bharti - Local Medical Insurance',         amount:6860.52, currency_code:'INR', frequency:'Per Year' },
      { name:'US Medical - New',                             amount:760,     currency_code:'USD', frequency:'Per Month' },
    ]);
    console.log('Insurance seeded');

    await Role.bulkCreate([
      { name:'Role A',            rate:20000, currency_code:'USD' },
      { name:'Consultant on Rig', rate:10000, currency_code:'USD' },
      { name:'Health and Safety', rate:4500,  currency_code:'USD' },
    ]);
    console.log('Roles seeded');

    await CountryConfig.bulkCreate([
      { country:'Saudi Arabia', param_key:'housing_allowance_pct',    param_value:'0.20',   param_label:'Housing Allowance %',              param_type:'percentage', param_group:'Allowances' },
      { country:'Saudi Arabia', param_key:'transport_allowance_pct',  param_value:'0.10',   param_label:'Transport Allowance %',            param_type:'percentage', param_group:'Allowances' },
      { country:'Saudi Arabia', param_key:'ss_employee_pct',          param_value:'0.10',   param_label:'SS Employee %',                    param_type:'percentage', param_group:'Social Security' },
      { country:'Saudi Arabia', param_key:'ss_employer_local_pct',    param_value:'0.12',   param_label:'SS Employer % (Local)',             param_type:'percentage', param_group:'Social Security' },
      { country:'Saudi Arabia', param_key:'ss_employer_expat_pct',    param_value:'0.02',   param_label:'SS Employer % (Expat)',             param_type:'percentage', param_group:'Social Security' },
      { country:'Saudi Arabia', param_key:'ss_employer_other_pct',    param_value:'0.05',   param_label:'WHT on Pay % (Other)',             param_type:'percentage', param_group:'Social Security' },
      { country:'Saudi Arabia', param_key:'workers_compensation_pct', param_value:'0.01',   param_label:"Worker's Compensation %",          param_type:'percentage', param_group:'Burdens' },
      { country:'Saudi Arabia', param_key:'eosb_days',                param_value:'15',     param_label:'EOSB Days (per 260 working days)', param_type:'number',     param_group:'Burdens' },
      { country:'Saudi Arabia', param_key:'mol_local_pct',            param_value:'0.172',  param_label:'MOL Liabilities % (Local)',        param_type:'percentage', param_group:'Burdens' },
      { country:'Saudi Arabia', param_key:'mol_expat_pct',            param_value:'0.072',  param_label:'MOL Liabilities % (Expat)',        param_type:'percentage', param_group:'Burdens' },
      { country:'Saudi Arabia', param_key:'holiday_days',             param_value:'60',     param_label:'Holiday Days / Year',              param_type:'number',     param_group:'Leave' },
      { country:'Saudi Arabia', param_key:'working_days_year',        param_value:'260',    param_label:'Working Days / Year',              param_type:'number',     param_group:'Calendar' },
      { country:'Saudi Arabia', param_key:'vat_rate',                 param_value:'0.05',   param_label:'VAT Rate',                         param_type:'percentage', param_group:'Tax' },
      { country:'Saudi Arabia', param_key:'wht_rate',                 param_value:'0.15',   param_label:'WHT Rate',                         param_type:'percentage', param_group:'Tax' },
      { country:'Saudi Arabia', param_key:'quoteology_fee_pct',       param_value:'0.12',   param_label:'Quoteology Fee %',                 param_type:'percentage', param_group:'Fee' },
      { country:'Saudi Arabia', param_key:'visa_ap_iqama',            param_value:'12250',  param_label:'AP Iqama Cost (SAR/yr)',            param_type:'number',     param_group:'Visa' },
      { country:'Saudi Arabia', param_key:'visa_china_harbour',       param_value:'12750',  param_label:'China Harbour Iqama (SAR/yr)',      param_type:'number',     param_group:'Visa' },
      { country:'Saudi Arabia', param_key:'visa_work_permit',         param_value:'9600',   param_label:'Work Permit (SAR/yr)',              param_type:'number',     param_group:'Visa' },
      { country:'Saudi Arabia', param_key:'mob_costs_default',        param_value:'7000',   param_label:'Default Mobilisation Cost (USD)',   param_type:'number',     param_group:'Mobilisation' },
      { country:'Saudi Arabia', param_key:'default_medical_insurance',param_value:'Cigna - Local Medical Insurance Category A', param_label:'Default Medical Insurance', param_type:'string', param_group:'Insurance' },
      { country:'India', param_key:'pit_top_rate',             param_value:'0.30',   param_label:'PIT Top Rate',                        param_type:'percentage', param_group:'Tax' },
      { country:'India', param_key:'surcharge_rate_high',      param_value:'0.15',   param_label:'Surcharge (> 10M INR)',               param_type:'percentage', param_group:'Tax' },
      { country:'India', param_key:'surcharge_rate_low',       param_value:'0.10',   param_label:'Surcharge (<= 10M INR)',              param_type:'percentage', param_group:'Tax' },
      { country:'India', param_key:'education_cess',           param_value:'0.04',   param_label:'Education Cess',                      param_type:'percentage', param_group:'Tax' },
      { country:'India', param_key:'gst_rate',                 param_value:'0.18',   param_label:'GST Rate',                            param_type:'percentage', param_group:'Tax' },
      { country:'India', param_key:'ss_employee_expat_pct',    param_value:'0.12',   param_label:'SS Employee PF % (Expat)',            param_type:'percentage', param_group:'Social Security' },
      { country:'India', param_key:'ss_employee_local_pct',    param_value:'0.12',   param_label:'SS Employee PF % (Local)',            param_type:'percentage', param_group:'Social Security' },
      { country:'India', param_key:'ss_employee_local_fixed',  param_value:'15000',  param_label:'PF Local Cap (INR/month)',            param_type:'number',     param_group:'Social Security' },
      { country:'India', param_key:'ss_employer_pct',          param_value:'0.12',   param_label:'SS Employer PF %',                   param_type:'percentage', param_group:'Social Security' },
      { country:'India', param_key:'profession_tax_annual',    param_value:'2500',   param_label:'Profession Tax (INR/Year)',           param_type:'number',     param_group:'Tax' },
      { country:'India', param_key:'holiday_days',             param_value:'0',      param_label:'Holiday Days / Year',                param_type:'number',     param_group:'Leave' },
      { country:'India', param_key:'working_days_year',        param_value:'260',    param_label:'Working Days / Year',                param_type:'number',     param_group:'Calendar' },
      { country:'India', param_key:'quoteology_fee_pct',       param_value:'0.0417', param_label:'Quoteology Fee %',                   param_type:'percentage', param_group:'Fee' },
      { country:'India', param_key:'default_medical_insurance',param_value:'GMAT',   param_label:'Default Medical Insurance',          param_type:'string',     param_group:'Insurance' },
      { country:'Australia', param_key:'superannuation_rate',       param_value:'0.10',   param_label:'Superannuation Levy %',          param_type:'percentage', param_group:'Burdens' },
      { country:'Australia', param_key:'ss_employee_pct',           param_value:'0.02',   param_label:'SS Employee %',                  param_type:'percentage', param_group:'Social Security' },
      { country:'Australia', param_key:'top_rate_tax',              param_value:'0.45',   param_label:'Top Rate Income Tax %',          param_type:'percentage', param_group:'Tax' },
      { country:'Australia', param_key:'gst_rate',                  param_value:'0.10',   param_label:'GST Rate',                       param_type:'percentage', param_group:'Tax' },
      { country:'Australia', param_key:'holiday_days',              param_value:'28',     param_label:'Holiday Days / Year',            param_type:'number',     param_group:'Leave' },
      { country:'Australia', param_key:'working_days_year',         param_value:'260',    param_label:'Working Days / Year',            param_type:'number',     param_group:'Calendar' },
      { country:'Australia', param_key:'quoteology_fee_pct',        param_value:'0.12',   param_label:'Quoteology Fee %',               param_type:'percentage', param_group:'Fee' },
      { country:'Australia', param_key:'quoteology_fee_fixed',      param_value:'2000',   param_label:'Quoteology Fixed Fee (USD)',      param_type:'number',     param_group:'Fee' },
      { country:'Australia', param_key:'quoteology_fee_min',        param_value:'300',    param_label:'Quoteology Min Fee (USD)',        param_type:'number',     param_group:'Fee' },
      { country:'Australia', param_key:'medical_insurance_pct',     param_value:'0.021',  param_label:'Medical Insurance % (default)',  param_type:'percentage', param_group:'Insurance' },
      { country:'Australia', param_key:'default_medical_insurance', param_value:'Percentage', param_label:'Default Medical Insurance',  param_type:'string',     param_group:'Insurance' },
      { country:'Australia', param_key:'payroll_tax_nsw',           param_value:'0.0545', param_label:'Payroll Tax - New South Wales',  param_type:'percentage', param_group:'Payroll Tax' },
      { country:'Australia', param_key:'payroll_tax_vic',           param_value:'0.0485', param_label:'Payroll Tax - Victoria',         param_type:'percentage', param_group:'Payroll Tax' },
      { country:'Australia', param_key:'payroll_tax_act',           param_value:'0.0685', param_label:'Payroll Tax - ACT',              param_type:'percentage', param_group:'Payroll Tax' },
      { country:'Australia', param_key:'payroll_tax_qld',           param_value:'0.0475', param_label:'Payroll Tax - Queensland',       param_type:'percentage', param_group:'Payroll Tax' },
      { country:'Australia', param_key:'payroll_tax_sa',            param_value:'0.0495', param_label:'Payroll Tax - South Australia',  param_type:'percentage', param_group:'Payroll Tax' },
      { country:'Australia', param_key:'payroll_tax_nt',            param_value:'0.0550', param_label:'Payroll Tax - Northern Territory',param_type:'percentage',param_group:'Payroll Tax' },
      { country:'Australia', param_key:'payroll_tax_wa',            param_value:'0.0550', param_label:'Payroll Tax - Western Australia', param_type:'percentage', param_group:'Payroll Tax' },
    ]);
    console.log('Country configs seeded');

    await Client.bulkCreate([
      { name:'Sample Client A', created_by:1 },
      { name:'Sample Client B', created_by:1 },
    ]);
    console.log('Clients seeded');

    console.log('\nDatabase seeded! admin@quoteology.com / Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
