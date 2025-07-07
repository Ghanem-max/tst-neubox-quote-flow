
// MIT Licensed CBM Calculator Logic
// Based on WordPress CBM Calculator plugin

/**
 * Calculate CBM for a single package
 * @param {number} length - Length in cm
 * @param {number} width - Width in cm  
 * @param {number} height - Height in cm
 * @param {number} qty - Quantity
 * @returns {number} CBM value
 */
export function calculateCBM(length, width, height, qty) {
  if (!length || !width || !height || !qty) return 0;
  
  // CBM = (L × W × H × Qty) / 1,000,000
  const cbm = (length * width * height * qty) / 1000000;
  return parseFloat(cbm.toFixed(3));
}

/**
 * Calculate total CBM from packages array
 * @param {Array} packages - Array of package objects
 * @returns {number} Total CBM
 */
export function calculateTotalCBM(packages) {
  return packages.reduce((total, pkg) => {
    return total + calculateCBM(pkg.length, pkg.width, pkg.height, pkg.qty);
  }, 0);
}

/**
 * Calculate revenue weight (CBM vs Weight/1000)
 * @param {number} totalCBM - Total CBM
 * @param {number} grossWeight - Gross weight in kg
 * @returns {object} Revenue weight details
 */
export function calculateRevenueWeight(totalCBM, grossWeight) {
  const weightInTons = grossWeight / 1000;
  const revenueWeight = Math.max(totalCBM, weightInTons);
  
  return {
    revenueWeight,
    chargingBasis: revenueWeight === totalCBM ? 'CBM' : 'Weight',
    totalCBM,
    weightInTons
  };
}

/**
 * Quote calculation logic
 * @param {string} polCode - Port of Loading code
 * @param {string} podCode - Port of Discharge code
 * @param {number} totalCBM - Total CBM
 * @param {number} grossWeight - Gross weight in kg
 * @param {Array} rateMatrix - Rate matrix from Google Sheets
 * @returns {object} Quote result
 */
export function calculateQuote(polCode, podCode, totalCBM, grossWeight, rateMatrix) {
  // Find matching rate
  const rate = rateMatrix.find(r => 
    r.POL_code === polCode && r.POD_code === podCode
  );
  
  if (!rate) {
    return {
      success: false,
      message: 'No rate found for this route'
    };
  }
  
  const { revenueWeight, chargingBasis } = calculateRevenueWeight(totalCBM, grossWeight);
  
  // Determine which rate to use
  const unitRate = chargingBasis === 'CBM' ? rate.Rate_USD_per_CBM : rate.Rate_USD_per_Ton;
  const totalQuote = revenueWeight * unitRate;
  
  return {
    success: true,
    quote: Math.round(totalQuote),
    revenueWeight: parseFloat(revenueWeight.toFixed(3)),
    chargingBasis,
    unitRate,
    route: `${polCode} → ${podCode}`
  };
}

/**
 * Validate company email domain
 * @param {string} email - Email address
 * @returns {boolean} Is valid company email
 */
export function validateCompanyEmail(email) {
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 
    'outlook.com', 'icloud.com', 'protonmail.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && !personalDomains.includes(domain);
}

/**
 * Format phone number to E.164
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  // Remove all non-digits except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Add + if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

/**
 * Get user's IP address (client-side fallback)
 * @returns {Promise<string>} IP address
 */
export async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not fetch IP:', error);
    return 'Unknown';
  }
}

/**
 * Google Sheets API integration
 * @param {object} data - Quote submission data
 * @returns {Promise<object>} Submission result
 */
export async function submitToGoogleSheets(data) {
  try {
    // This would integrate with Google Sheets API
    // For now, returning a mock response
    console.log('Submitting to Google Sheets:', data);
    
    return {
      success: true,
      sheetId: 'mock-sheet-id',
      rowId: Math.floor(Math.random() * 1000)
    };
  } catch (error) {
    console.error('Google Sheets submission error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetch rate matrix from Google Sheets
 * @returns {Promise<Array>} Rate matrix data
 */
export async function fetchRateMatrix() {
  try {
    // This would fetch from Google Sheets API
    // For now, returning mock data
    return [
      {
        POL_code: 'AEJEA',
        POD_code: 'CNSHA',
        Rate_USD_per_CBM: 45,
        Rate_USD_per_Ton: 35
      },
      {
        POL_code: 'CNSHA',
        POD_code: 'AEJEA',
        Rate_USD_per_CBM: 42,
        Rate_USD_per_Ton: 32
      }
    ];
  } catch (error) {
    console.error('Rate matrix fetch error:', error);
    return [];
  }
}
