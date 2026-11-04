/** Structured data for search engines, as one JSON-LD graph. */
export function JsonLd({ items }: { items: (Record<string, unknown> | null)[] }) {
  const graph = items.filter(Boolean);
  if (!graph.length) return null;
  // Escape "<" so text in the data can never close the script tag.
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
