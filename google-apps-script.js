
/**
 * Google Apps Script to handle LCL Quote Form submissions
 * This script receives POST requests from the QuoteForm and logs data to Google Sheets
 */

// Configuration - Update these values for your setup
const SHEET_NAME = 'Quote Leads'; // Name of the sheet tab
const EMAIL_RECIPIENTS = ['quotes@neubox-consol.com']; // Add your email addresses here

/**
 * Main function to handle POST requests from the quote form
 */
function doPost(e) {
  try {
    // Enable CORS for web requests
    const response = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };

    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Log the submission to Google Sheets
    const rowData = logToSheet(data);
    
    // Send email notification
    sendEmailNotification(data, rowData.rowNumber);
    
    // Calculate quote if possible (basic implementation)
    const quote = calculateBasicQuote(data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Quote submitted successfully',
        quote: quote,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing quote:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to process quote',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle preflight OPTIONS requests for CORS
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

/**
 * Log quote data to Google Sheets
 */
function logToSheet(data) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    
    // Add headers
    const headers = [
      'Timestamp', 'Company', 'Contact Person', 'Email', 'Mobile',
      'POL', 'POD', 'Ready Date', 'Incoterm', 'Pickup Address',
      'Commodity', 'Total CBM', 'Gross Weight (kg)', 'Hazardous', 'Customs',
      'Packages', 'Attachments', 'User IP', 'Quote USD', 'Status'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  // Prepare row data
  const timestamp = new Date();
  const packagesText = data.packages.map(pkg => 
    `${pkg.qty}x ${pkg.length}×${pkg.width}×${pkg.height}cm`
  ).join('; ');
  
  const attachmentsText = data.attachments ? data.attachments.join(', ') : '';
  const quote = calculateBasicQuote(data);
  
  const rowData = [
    timestamp,
    data.company || '',
    data.contactPerson || '',
    data.email || '',
    data.mobile || '',
    data.pol || '',
    data.pod || '',
    data.readyDate || '',
    data.incoterm || '',
    data.pickupAddress || '',
    data.commodity || '',
    data.totalCBM || 0,
    data.grossWeight || 0,
    data.hazardous ? 'Yes' : 'No',
    data.customs ? 'Yes' : 'No',
    packagesText,
    attachmentsText,
    data.userIP || '',
    quote || '',
    'New'
  ];
  
  // Add the row
  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  return {
    rowNumber: newRow,
    data: rowData
  };
}

/**
 * Send email notification
 */
function sendEmailNotification(data, rowNumber) {
  try {
    const subject = `New LCL Quote Request - ${data.company} - ${data.pol} to ${data.pod}`;
    
    const htmlBody = `
      <h2>New LCL Quote Request</h2>
      <p><strong>Row #:</strong> ${rowNumber}</p>
      
      <h3>Customer Details:</h3>
      <ul>
        <li><strong>Company:</strong> ${data.company}</li>
        <li><strong>Contact Person:</strong> ${data.contactPerson || 'Not provided'}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Mobile:</strong> ${data.mobile}</li>
      </ul>
      
      <h3>Shipment Details:</h3>
      <ul>
        <li><strong>Route:</strong> ${data.pol} → ${data.pod}</li>
        <li><strong>Ready Date:</strong> ${data.readyDate}</li>
        <li><strong>Incoterm:</strong> ${data.incoterm}</li>
        <li><strong>Total CBM:</strong> ${data.totalCBM}</li>
        <li><strong>Gross Weight:</strong> ${data.grossWeight} kg</li>
        <li><strong>Commodity:</strong> ${data.commodity}</li>
        <li><strong>Hazardous:</strong> ${data.hazardous ? 'Yes' : 'No'}</li>
        <li><strong>Customs:</strong> ${data.customs ? 'Yes' : 'No'}</li>
      </ul>
      
      ${data.pickupAddress ? `<p><strong>Pickup Address:</strong> ${data.pickupAddress}</p>` : ''}
      
      <h3>Package Details:</h3>
      <ul>
        ${data.packages.map(pkg => 
          `<li>${pkg.qty} x ${pkg.length}×${pkg.width}×${pkg.height}cm (${calculateCBM(pkg.length, pkg.width, pkg.height, pkg.qty)} CBM)</li>`
        ).join('')}
      </ul>
      
      <p><strong>User IP:</strong> ${data.userIP}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><em>This quote request has been logged to the ${SHEET_NAME} sheet.</em></p>
    `;
    
    // Send to internal team
    EMAIL_RECIPIENTS.forEach(email => {
      GmailApp.sendEmail(email, subject, '', {
        htmlBody: htmlBody
      });
    });
    
    console.log('Email notification sent successfully');
    
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

/**
 * Calculate CBM for a package
 */
function calculateCBM(length, width, height, qty) {
  if (!length || !width || !height || !qty) return 0;
  const cbm = (length * width * height * qty) / 1000000;
  return parseFloat(cbm.toFixed(3));
}

/**
 * Basic quote calculation (you can enhance this with your rate matrix)
 */
function calculateBasicQuote(data) {
  try {
    const totalCBM = data.totalCBM || 0;
    const grossWeight = data.grossWeight || 0;
    const revenueWeight = Math.max(totalCBM, grossWeight / 1000);
    
    // Basic rate structure - you can enhance this with actual rates
    const baseRates = {
      'AEJEA-CNSHA': { cbm: 45, ton: 35 },
      'CNSHA-AEJEA': { cbm: 42, ton: 32 },
      'AEJEA-USNYC': { cbm: 55, ton: 45 },
      'USNYC-AEJEA': { cbm: 52, ton: 42 }
    };
    
    const route = `${data.pol}-${data.pod}`;
    const rate = baseRates[route];
    
    if (!rate) {
      // Default rates if route not found
      const defaultRate = revenueWeight === totalCBM ? 50 : 40;
      return Math.round(revenueWeight * defaultRate);
    }
    
    const unitRate = revenueWeight === totalCBM ? rate.cbm : rate.ton;
    return Math.round(revenueWeight * unitRate);
    
  } catch (error) {
    console.error('Error calculating quote:', error);
    return null;
  }
}

/**
 * Test function - you can run this to test your setup
 */
function testSetup() {
  const testData = {
    company: 'Test Company',
    contactPerson: 'John Doe',
    email: 'test@company.com',
    mobile: '+971501234567',
    pol: 'AEJEA',
    pod: 'CNSHA',
    readyDate: '2024-01-15',
    incoterm: 'FOB',
    commodity: 'Test goods',
    packages: [{
      id: '1',
      length: 100,
      width: 80,
      height: 60,
      qty: 2
    }],
    totalCBM: 0.96,
    grossWeight: 500,
    hazardous: false,
    customs: false,
    userIP: '192.168.1.1',
    timestamp: new Date().toISOString()
  };
  
  try {
    const result = logToSheet(testData);
    console.log('Test successful! Row added:', result.rowNumber);
    sendEmailNotification(testData, result.rowNumber);
    return 'Test completed successfully';
  } catch (error) {
    console.error('Test failed:', error);
    return 'Test failed: ' + error.toString();
  }
}
