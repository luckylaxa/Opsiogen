import type { ComparisonSection } from "@/lib/types";
import { AccentText, Label, MaskReveal } from "@/components/ui/Headings";
import { cn } from "@/lib/utils";

/**
 * Opsiogen against the alternatives. A table from tablets up, with the first
 * (Opsiogen) column as a dark card; on phones each row stacks, Opsiogen first.
 */
export function Comparison({ section }: { section: ComparisonSection }) {
  const columns = section.columns?.filter(Boolean) ?? [];
  const rows = section.rows?.filter((r) => r.label) ?? [];
  if (columns.length < 2 || !rows.length) return null;
  const cell = (row: ComparisonSection["rows"][number], i: number) => row.cells?.[i] ?? "";
  const last = rows.length - 1;

  return (
    <div className="px-gutter">
      {section.label && <Label className="mb-[clamp(16px,calc(1.24vw+11.4px),35px)]">{section.label}</Label>}
      <h2 className="mb-[clamp(32px,calc(2.6vw+22px),80px)] max-w-[16ch] text-h2 font-medium text-balance">
        <MaskReveal>
          <AccentText text={section.heading} accent={section.accent} />
        </MaskReveal>
      </h2>

      <table data-reveal className="hidden w-full table-fixed border-separate border-spacing-0 text-left md:table">
        <thead>
          <tr>
            <td className="w-[22%]" />
            {columns.map((c, i) => (
              <th
                key={c}
                scope="col"
                className={cn(
                  "px-[clamp(16px,1.6vw,32px)] pb-4 pt-[clamp(20px,1.6vw,32px)] align-bottom text-title font-semibold",
                  i === 0 ? "on-dark rounded-t-card bg-coal text-white" : "text-ink-2",
                )}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={row._key ?? row.label}>
              <th scope="row" className="border-t border-line py-[clamp(16px,1.3vw,26px)] pr-4 align-top text-base font-normal text-mute">
                {row.label}
              </th>
              {columns.map((c, i) => (
                <td
                  key={c}
                  className={cn(
                    "px-[clamp(16px,1.6vw,32px)] py-[clamp(16px,1.3vw,26px)] align-top text-row",
                    i === 0
                      ? cn("on-dark border-t border-white/15 bg-coal font-medium text-white", r === last && "rounded-b-card pb-[clamp(24px,2vw,40px)]")
                      : "border-t border-line text-ink-2",
                  )}
                >
                  {cell(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="flex flex-col md:hidden">
        {rows.map((row) => (
          <div key={row._key ?? row.label} data-reveal className="border-t border-line py-5">
            <dt className="text-small text-mute">{row.label}</dt>
            <dd className="on-dark mt-3 rounded-[8px] bg-coal px-4 py-3 text-row font-medium text-white">
              <span className="block text-small font-normal text-white/60">{columns[0]}</span>
              {cell(row, 0)}
            </dd>
            {columns.slice(1).map((c, i) => (
              <dd key={c} className="mt-3 px-4 text-base text-ink-2">
                <span className="block text-small text-mute">{c}</span>
                {cell(row, i + 1)}
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </div>
  );
}
