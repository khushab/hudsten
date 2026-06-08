"use client";

import Script from "next/script";
import { useConsent } from "./consent";

/**
 * GA4 + Meta Pixel loader. Scripts inject ONLY after the visitor grants consent
 * (PRD §9 cookie-consent) and only when the corresponding IDs are configured.
 * The event helpers in lib/analytics.ts no-op until these have loaded.
 */
export function Analytics({
  ga4Id,
  pixelId,
}: {
  ga4Id?: string;
  pixelId?: string;
}) {
  const { consent } = useConsent();
  if (consent !== "granted") return null;

  return (
    <>
      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
