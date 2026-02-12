import { createHash, randomUUID } from "crypto";
import bizSdk from "facebook-nodejs-business-sdk";

type MetaConversionEventName = "CompleteRegistration" | "Lead";

type SendMetaConversionEventParams = {
  eventName: MetaConversionEventName;
  email: string;
  request: Request;
};

function hashEmail(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

function parseCookies(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...valueParts] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(valueParts.join("=") || "");
    return acc;
  }, {});
}

function buildFbcValue(request: Request, cookies: Record<string, string>) {
  if (cookies._fbc) return cookies._fbc;

  const requestUrl = new URL(request.url);
  const fbclid = requestUrl.searchParams.get("fbclid");
  if (!fbclid) return undefined;

  return `fb.1.${Date.now()}.${fbclid}`;
}

function getClientIpAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || undefined;
}

export async function sendMetaConversionEvent({
  eventName,
  email,
  request,
}: SendMetaConversionEventParams) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;

  if (!pixelId || !accessToken) {
    return;
  }

  const { FacebookAdsApi, EventRequest, UserData, ServerEvent } = bizSdk;
  FacebookAdsApi.init(accessToken);

  const cookies = parseCookies(request);
  const fbc = buildFbcValue(request, cookies);
  const fbp = cookies._fbp;
  const userAgent = request.headers.get("user-agent") || undefined;
  const clientIpAddress = getClientIpAddress(request);
  const eventSourceUrl =
    request.headers.get("referer") ?? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com"}`;

  const userData = new UserData()
    .setEmails([hashEmail(email)])
    .setClientUserAgent(userAgent)
    .setClientIpAddress(clientIpAddress);

  if (fbc) {
    userData.setFbc(fbc);
  }
  if (fbp) {
    userData.setFbp(fbp);
  }

  const serverEvent = new ServerEvent()
    .setEventName(eventName)
    .setEventTime(Math.floor(Date.now() / 1000))
    .setActionSource("website")
    .setEventSourceUrl(eventSourceUrl)
    .setEventId(randomUUID())
    .setUserData(userData);

  const eventRequest = new EventRequest(accessToken, pixelId).setEvents([serverEvent]);

  const testEventCode = process.env.META_TEST_EVENT_CODE;
  if (testEventCode) {
    eventRequest.setTestEventCode(testEventCode);
  }

  try {
    await eventRequest.execute();
  } catch (error) {
    console.error("Meta Conversions API error", error);
  }
}
