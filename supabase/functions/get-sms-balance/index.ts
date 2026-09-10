const SMS_API_KEY = Deno.env.get("SASUSYNC_API_KEY") || "";
const BALANCE_ENDPOINT = "https://sms.sasusync.com/otp/balance";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info, X-API-Key",
  "Access-Control-Max-Age": "86400",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (!SMS_API_KEY || SMS_API_KEY.length < 10) {
      return new Response(JSON.stringify({ error: "SMS API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(BALANCE_ENDPOINT, {
      method: "GET",
      headers: { "X-API-Key": SMS_API_KEY },
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.detail || "Failed to fetch balance", details: data }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});