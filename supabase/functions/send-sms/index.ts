// supabase/functions/send-sms/index.ts

// These values come from Supabase secrets
const SMS_API_KEY = Deno.env.get("SASUSYNC_API_KEY") || "";
const SMS_SENDER_ID = Deno.env.get("SASUSYNC_SENDER_ID") || "LimolMicro";
const SMS_ENDPOINT = Deno.env.get("SASUSYNC_ENDPOINT") || "https://sms.sasusync.com/api/v1/send";

// ⚠️ TEST MODE: Set to false when you have funds and want real SMS
const TEST_MODE = false;

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info, X-API-Key",
  "Access-Control-Max-Age": "86400",
};

Deno.serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the request body
    const { recipients, message } = await req.json();

    if (!recipients || !message) {
      return new Response(JSON.stringify({ error: "Missing recipients or message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure recipients is an array
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    
    // Filter out empty phone numbers
    const validRecipients = recipientList.filter(phone => phone && phone.trim().length > 0);
    
    if (validRecipients.length === 0) {
      return new Response(JSON.stringify({ error: "No valid recipients" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format phone numbers
    const formattedRecipients = validRecipients.map((phone: string) => {
      let cleaned = phone.replace(/\s/g, '');
      if (cleaned.startsWith('0')) {
        cleaned = '233' + cleaned.slice(1);
      }
      if (cleaned.startsWith('+')) {
        cleaned = cleaned.slice(1);
      }
      return cleaned;
    });

    // TEST MODE: Skip actual SMS sending
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: SMS would be sent to:', formattedRecipients);
      console.log('📝 Message:', message);
      return new Response(JSON.stringify({
        success: true,
        test_mode: true,
        message: "SMS would be sent (test mode enabled)",
        recipients: formattedRecipients,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the payload for SasuSync
    const payload = {
      sender: SMS_SENDER_ID,
      recipients: formattedRecipients,
      message: message,
    };

    console.log('📤 Sending SMS to:', formattedRecipients);
    console.log('📝 Message:', message);

    // Check if API key is set
    if (!SMS_API_KEY || SMS_API_KEY === "" || SMS_API_KEY.length < 10) {
      console.error('❌ API key is missing or too short:', SMS_API_KEY);
      return new Response(JSON.stringify({
        error: "SMS API key not configured or invalid",
        message: "Please set a valid SASUSYNC_API_KEY in Supabase secrets",
        key_length: SMS_API_KEY.length,
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send to SasuSync API
    const response = await fetch(SMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-API-Key': SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ SMS API error:', data);
      return new Response(JSON.stringify({
        error: data.detail || data.message || 'SMS send failed',
        details: data,
        status_code: response.status,
      }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('✅ SMS sent successfully:', data);
    return new Response(JSON.stringify({
      success: true,
      data: data,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('💥 Edge Function error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});