import type { ProductFaq } from "@hudsten/db";
import { Accordion } from "@/components/ui/Accordion";

/**
 * Dedicated FAQ block — kept SEPARATE from the Description/Details/Specifications
 * product-info accordions so the two groups never read as one jumbled stack.
 * (FAQPage JSON-LD is emitted from the PDP page, not here.)
 */
export function Faq({ items }: { items: ProductFaq[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      {/* normal-case so the acronym+plural renders "FAQs", not the global-uppercase "FAQS". */}
      <h2 className="mb-5 text-2xl font-normal normal-case tracking-normal">FAQs</h2>
      <div className="border-t border-stone-200">
        {items.map((faq) => (
          <Accordion key={faq.question} title={faq.question}>
            <p>{faq.answer}</p>
          </Accordion>
        ))}
      </div>
    </div>
  );
}
