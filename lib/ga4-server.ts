type Ga4EventParams = Record<string, string | number | boolean | undefined>;

function measurementId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-4C2EJL2XPS";
}

function apiSecret() {
  return process.env.GA4_MEASUREMENT_PROTOCOL_SECRET;
}

/** Server-side GA4 via Measurement Protocol (survives Stripe redirect / ad blockers). */
export async function sendGa4ServerEvent(
  eventName: string,
  params: Ga4EventParams,
  clientId?: string
) {
  const secret = apiSecret();
  if (!secret) return false;

  const payload = {
    client_id: clientId && clientId.length > 0 ? clientId : `server.${Date.now()}`,
    events: [
      {
        name: eventName,
        params: {
          ...Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
          ),
          engagement_time_msec: 1,
        },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId()}&api_secret=${secret}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}
