/**
 * Renders JSON-LD structured data. Server component — emitted into the HTML for crawlers.
 * Using dangerouslySetInnerHTML is the standard, safe pattern here (we control the input).
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
