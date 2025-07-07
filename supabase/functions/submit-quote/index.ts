
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteSubmission {
  pol: string;
  pod: string;
  readyDate: string;
  incoterm: string;
  pickupAddress: string;
  commodity: string;
  packages: Array<{
    id: string;
    length: number;
    width: number;
    height: number;
    qty: number;
  }>;
  grossWeight: number;
  hazardous: boolean;
  customs: boolean;
  attachments: string[];
  company: string;
  contactPerson: string;
  email: string;
  mobile: string;
  totalCBM: number;
  userIP: string;
  timestamp: string;
}

interface RateMatrix {
  POL_code: string;
  POD_code: string;
  Rate_USD_per_CBM: number;
  Rate_USD_per_Ton: number;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Calculate revenue weight and quote
function calculateQuote(totalCBM: number, grossWeight: number, rateMatrix: RateMatrix[]): number | null {
  const revenueWeight = Math.max(totalCBM, grossWeight / 1000);
  
  // For demo purposes, we'll use a default rate if no specific rate is found
  // In production, this would look up the actual rate from the matrix
  const defaultRatePerCBM = 45; // USD per CBM
  const defaultRatePerTon = 35; // USD per Ton
  
  if (revenueWeight === totalCBM) {
    return Math.round(revenueWeight * defaultRatePerCBM);
  } else {
    return Math.round(revenueWeight * defaultRatePerTon);
  }
}

// Submit lead to Google Sheets (mock implementation)
async function submitToGoogleSheets(data: QuoteSubmission): Promise<void> {
  console.log('Submitting to Google Sheets:', {
    timestamp: data.timestamp,
    company: data.company,
    email: data.email,
    route: `${data.pol} → ${data.pod}`,
    totalCBM: data.totalCBM,
    grossWeight: data.grossWeight
  });
  
  // In production, this would use Google Sheets API
  // For now, we just log the data
}

// Send email notifications
async function sendEmailNotifications(data: QuoteSubmission, quote?: number): Promise<void> {
  try {
    // Email to customer
    const customerEmailContent = quote 
      ? `
        <h2>Thank you for your LCL quote request!</h2>
        <p>Dear ${data.contactPerson || 'Valued Customer'},</p>
        <p><strong>Your indicative LCL freight is USD ${quote}, subject to final confirmation.</strong></p>
        <h3>Shipment Details:</h3>
        <ul>
          <li><strong>Route:</strong> ${data.pol} → ${data.pod}</li>
          <li><strong>Ready Date:</strong> ${data.readyDate}</li>
          <li><strong>Incoterm:</strong> ${data.incoterm}</li>
          <li><strong>Total CBM:</strong> ${data.totalCBM}</li>
          <li><strong>Gross Weight:</strong> ${data.grossWeight} kg</li>
          <li><strong>Commodity:</strong> ${data.commodity}</li>
        </ul>
        <p>Our team will contact you shortly to finalize the details.</p>
        <p>Best regards,<br>Neubox Consolidation Team</p>
      `
      : `
        <h2>Thank you for your LCL quote request!</h2>
        <p>Dear ${data.contactPerson || 'Valued Customer'},</p>
        <p>We have received your quote request and our pricing team will get back to you shortly with a competitive rate.</p>
        <h3>Shipment Details:</h3>
        <ul>
          <li><strong>Route:</strong> ${data.pol} → ${data.pod}</li>
          <li><strong>Ready Date:</strong> ${data.readyDate}</li>
          <li><strong>Incoterm:</strong> ${data.incoterm}</li>
          <li><strong>Total CBM:</strong> ${data.totalCBM}</li>
          <li><strong>Gross Weight:</strong> ${data.grossWeight} kg</li>
          <li><strong>Commodity:</strong> ${data.commodity}</li>
        </ul>
        <p>Best regards,<br>Neubox Consolidation Team</p>
      `;

    await resend.emails.send({
      from: "Neubox Consolidation <quotes@neubox-consol.com>",
      to: [data.email],
      subject: quote ? `LCL Quote - USD ${quote} - ${data.pol} to ${data.pod}` : `LCL Quote Request Received - ${data.pol} to ${data.pod}`,
      html: customerEmailContent,
    });

    // Internal notification email
    const internalEmailContent = `
      <h2>New LCL Quote Request</h2>
      <p><strong>Quote Generated:</strong> ${quote ? `USD ${quote}` : 'Manual pricing required'}</p>
      <h3>Customer Details:</h3>
      <ul>
        <li><strong>Company:</strong> ${data.company}</li>
        <li><strong>Contact:</strong> ${data.contactPerson}</li>
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
      <p><strong>User IP:</strong> ${data.userIP}</p>
      <p><strong>Timestamp:</strong> ${data.timestamp}</p>
    `;

    await resend.emails.send({
      from: "Neubox System <noreply@neubox-consol.com>",
      to: ["quotes@neubox-consol.com"],
      subject: `New LCL Quote: ${data.company} - ${data.pol} to ${data.pod}`,
      html: internalEmailContent,
    });

    console.log('Email notifications sent successfully');
  } catch (error) {
    console.error('Error sending email notifications:', error);
    throw error;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const data: QuoteSubmission = await req.json();
    
    console.log('Received quote submission:', {
      company: data.company,
      route: `${data.pol} → ${data.pod}`,
      totalCBM: data.totalCBM,
      grossWeight: data.grossWeight
    });

    // Submit lead to Google Sheets
    await submitToGoogleSheets(data);

    // Calculate quote (mock rate matrix for now)
    const rateMatrix: RateMatrix[] = []; // In production, this would be fetched from Google Sheets
    const quote = calculateQuote(data.totalCBM, data.grossWeight, rateMatrix);

    // Send email notifications
    await sendEmailNotifications(data, quote || undefined);

    return new Response(JSON.stringify({ 
      success: true, 
      quote: quote,
      message: 'Quote submitted successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing quote:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process quote',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
