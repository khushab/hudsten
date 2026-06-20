import type { Metadata } from "next";
import { buildWhatsAppGeneralUrl } from "@hudsten/shared";
import { fetchSettings } from "@/lib/data";
import { absoluteUrl } from "@/lib/env";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/icons";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Hudsten — fastest on WhatsApp.",
  alternates: { canonical: absoluteUrl("/contact") },
};

export default async function ContactPage() {
  const settings = await fetchSettings();
  const waUrl = buildWhatsAppGeneralUrl(settings?.whatsapp_number);

  return (
    <Container as="main" className="max-w-prose py-14 sm:py-20">
      <p className="eyebrow mb-3">We're here to help</p>
      <h1 className="text-3xl font-normal">
        Get in touch
      </h1>
      <p className="mt-4 text-stone-600">
        Questions about a product or order? WhatsApp is fastest — we usually reply within a few hours.
      </p>

      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("whatsapp", "lg", "mt-6")}
        >
          <WhatsAppIcon className="h-5 w-5" />
          Chat on WhatsApp
        </a>
      )}

      <dl className="mt-12 space-y-6 border-t border-stone-200 pt-8 text-sm">
        {settings?.contact_email && (
          <Row label="Email">
            <a href={`mailto:${settings.contact_email}`} className="hover:underline">
              {settings.contact_email}
            </a>
          </Row>
        )}
        {settings?.phone && (
          <Row label="Phone">
            <a href={`tel:${settings.phone}`} className="hover:underline">
              {settings.phone}
            </a>
          </Row>
        )}
        {settings?.address && <Row label="Address">{settings.address}</Row>}
        {settings?.gst_number && <Row label="GSTIN">{settings.gst_number}</Row>}
      </dl>
    </Container>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <dt className="text-stone-500">{label}</dt>
      <dd className="col-span-2 text-ink">{children}</dd>
    </div>
  );
}
