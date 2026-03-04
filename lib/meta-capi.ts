import crypto from "crypto";

type ServerMetaEvent = {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  action_source?: string;
  user_data?: {
    em?: string; // Hashed email
    client_ip_address?: string;
    client_user_agent?: string;
    fbp?: string; // Facebook browser pixel cookie
    fbc?: string; // Facebook click ID cookie
  };
  custom_data?: Record<string, unknown>;
};

function hashSHA256(value: string): string {
  return crypto.createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

// New simplified API (for triage/quiz)
export async function sendServerMetaEvent(
  eventName: string,
  options: {
    email?: string;
    customData?: Record<string, unknown>;
    eventId?: string;
    sourceUrl?: string;
    userAgent?: string;
    ip?: string;
    fbp?: string;
    fbc?: string;
  } = {}
): Promise<{ success: boolean; error?: string }> {
  return sendMetaServerEvent({
    eventName,
    eventSourceUrl: options.sourceUrl,
    email: options.email,
    customData: options.customData,
    eventId: options.eventId,
    userAgent: options.userAgent,
    clientIpAddress: options.ip,
    fbp: options.fbp,
    fbc: options.fbc,
  });
}

// Full API (for checkout events)
export async function sendMetaServerEvent(options: {
  eventName: string;
  eventSourceUrl?: string;
  value?: number;
  contentName?: string;
  email?: string | null;
  userAgent?: string | null;
  clientIpAddress?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  eventId?: string;
  customData?: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    console.warn("[Meta CAPI] Missing META_PIXEL_ID or META_CONVERSIONS_API_TOKEN");
    return { success: false, error: "Missing credentials" };
  }

  const eventId = options.eventId || crypto.randomUUID();
  const eventTime = Math.floor(Date.now() / 1000);

  const event: ServerMetaEvent = {
    event_name: options.eventName,
    event_time: eventTime,
    event_id: eventId,
    event_source_url: options.eventSourceUrl || process.env.NEXT_PUBLIC_APP_URL,
    action_source: "website",
  };

  // Add user data if available
  const userData: ServerMetaEvent["user_data"] = {};
  if (options.email) {
    userData.em = hashSHA256(options.email);
  }
  if (options.clientIpAddress) {
    userData.client_ip_address = options.clientIpAddress;
  }
  if (options.userAgent) {
    userData.client_user_agent = options.userAgent;
  }
  if (options.fbp) {
    userData.fbp = options.fbp;
  }
  if (options.fbc) {
    userData.fbc = options.fbc;
  }

  if (Object.keys(userData).length > 0) {
    event.user_data = userData;
  }

  // Add custom data
  const customData: Record<string, unknown> = { ...options.customData };
  if (options.value !== undefined) {
    customData.value = options.value;
    customData.currency = "USD";
  }
  if (options.contentName) {
    customData.content_name = options.contentName;
  }

  if (Object.keys(customData).length > 0) {
    event.custom_data = customData;
  }

  const payload = {
    data: [event],
    test_event_code: testEventCode || undefined,
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("[Meta CAPI] Error:", result);
      return { success: false, error: result.error?.message || "Unknown error" };
    }

    console.log(`[Meta CAPI] ✅ ${options.eventName} sent successfully (eventId: ${eventId})`);
    return { success: true };
  } catch (error) {
    console.error("[Meta CAPI] Request failed:", error);
    return { success: false, error: String(error) };
  }
}
