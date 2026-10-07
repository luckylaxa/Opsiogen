import { PortableText, type PortableTextComponents } from "next-sanity";
import type { PromiseListSection, ShortTextSection } from "@/lib/types";
import { Label, SectionHeading } from "@/components/ui/Headings";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-[1em] text-lead text-ink-2 first:mt-0">{children}</p>,
    h2: ({ children }) => <h2 className="mt-[clamp(32px,2.6vw,56px)] text-title font-medium first:mt-0">{children}</h2>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-[1em] list-disc space-y-2 pl-6 text-lead text-ink-2">{children}</ul>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  },
};

export function ShortText({ section }: { section: ShortTextSection }) {
  return (
    <div>
      <SectionHeading label={section.label} heading={section.heading} className="mb-[clamp(32px,2.6vw,56px)]" />
      {section.body && section.body.length > 0 && (
        <div className="max-w-[52ch] px-gutter">
          <PortableText value={section.body} components={components} />
        </div>
      )}
    </div>
  );
}

/** Promises as dark numbered cards, or a list as large dotted-rule rows. */
export function PromiseList({ section }: { section: PromiseListSection }) {
  const items = section.items?.filter(Boolean) ?? [];
  if (!items.length) return null;
  const heading = (section.label || section.heading) && (
    <div className="mb-[clamp(32px,calc(2.6vw+22px),80px)] px-gutter">
      {section.label && <Label className={section.heading ? "mb-[clamp(16px,calc(1.24vw+11.4px),35px)]" : ""}>{section.label}</Label>}
      {section.heading && <h2 className="max-w-[13.5ch] text-h2 font-medium text-balance">{section.heading}</h2>}
    </div>
  );

  if (section.layout === "rows") {
    return (
      <div>
        {heading}
        <ul className="px-gutter">
          <li aria-hidden="true" className="rule-dotted" />
          {items.map((item, i) => (
            <li key={`${i}-${item}`}>
              <div className="flex items-baseline gap-[clamp(16px,2vw,40px)] px-[clamp(0px,1.84vw,35px)] py-[clamp(18px,calc(1.24vw+13.4px),40px)]">
                <span className="w-[2.2em] shrink-0 text-base text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[length:clamp(26px,calc(1.7vw+19.6px),52px)] font-medium leading-[1.12] tracking-[-0.01em]">{item}</span>
              </div>
              <div className="rule-dotted" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      {heading}
      <ul className="grid gap-gap px-gutter md:grid-cols-2">
        {items.map((item, i) => (
          <li
            key={`${i}-${item}`}
            data-reveal
            className="flex min-h-[clamp(220px,calc(10.5vw+180px),380px)] flex-col justify-between rounded-card bg-coal p-[clamp(24px,calc(1.9vw+17px),58px)] text-white"
          >
            <span className="text-base text-white/55 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-10 max-w-[14ch] text-[length:clamp(30px,calc(1.37vw+24.9px),51px)] font-semibold leading-[1.06] tracking-[-0.015em] text-balance">
              {item}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
