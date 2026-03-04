"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Script from "next/script";
import { trackMetaEvent, trackPurchaseCompleted } from "@/lib/meta-events";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    void trackMetaEvent("PageView");
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const checkoutSuccess = params.get("checkout") === "success";
    const upgraded = params.get("upgraded") === "true";
    if (!sessionId || (!checkoutSuccess && !upgraded)) return;

    const dedupeKey = `fb:purchase-tracked:${sessionId}`;
    if (window.sessionStorage.getItem(dedupeKey) === "1") return;
    window.sessionStorage.setItem(dedupeKey, "1");

    void trackPurchaseCompleted({
      source: pathname || "post_checkout",
      value: 9,
      contentName: "FursBliss Premium Monthly",
      eventIdBase: sessionId,
    });
  }, [pathname]);

  if (!PIXEL_ID) {
    return null;
  }

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
    </Script>
  );
}

