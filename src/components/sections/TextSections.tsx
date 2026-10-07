import { PortableText, type PortableTextComponents } from "next-sanity";
import type { PromiseListSection, ShortTextSection } from "@/lib/types";
import { Label, SectionHeading } from "@/components/ui/Headings";
import { Check } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

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

/** Article column from the reference's story pages: centred, comfortable measure. */
const articleComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-[1.1em] text-base leading-[1.65] text-ink-2 first:mt-0">{children}</p>,
    h2: ({ children }) => (
      <h2 className="mt-[clamp(36px,2.6vw,56px)] text-title font-medium text-ink first:mt-0">{children}</h2>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mt-[1.1em] list-disc space-y-2 pl-6 text-base leading-[1.65] text-ink-2">{children}</ul>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  },
};

export function ShortText({ section, article = false }: { section: ShortTextSection; article?: boolean }) {
  const hasBody = Boolean(section.body && section.body.length > 0);
  if (article) {
    return (
      <div className="px-gutter">
        <div className="mx-auto max-w-[680px]">
          {section.label && <Label className="mb-4 text-small text-mute">{section.label}</Label>}
          {section.heading && <h2 className="mb-8 text-h2 font-medium text-balance">{section.heading}</h2>}
          {hasBody && <PortableText value={section.body!} components={articleComponents} />}
        </div>
      </div>
    );
  }
  return (
    <div>
      <SectionHeading label={section.label} heading={section.heading} className="mb-[clamp(32px,2.6vw,56px)]" />
      {hasBody && (
        <div className="max-w-[52ch] px-gutter">
          <PortableText value={section.body!} components={components} />
        </div>
      )}
    </div>
  );
}

/** Simple line icons for the promise cards, cycled in order. */
const ICONS = [
  // One partner: two linked rings
  <g key="a"><circle cx="9" cy="12" r="5" /><circle cx="15" cy="12" r="5" /></g>,
  // Speed: a clock
  <g key="b"><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" /></g>,
  // Fixed price: a tag
  <g key="c"><path d="M3.5 12.2 11.8 4H20v8.2l-8.3 8.3a1.4 1.4 0 0 1-2 0l-6.2-6.3a1.4 1.4 0 0 1 0-2Z" /><circle cx="15.8" cy="8.2" r="1.3" /></g>,
  // Ownership: a key
  <g key="d"><circle cx="8" cy="12" r="4" /><path d="M12 12h9m-3 0v3m-3-3v2" /></g>,
];

function ItemIcon({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-[clamp(26px,calc(0.6vw+23px),36px)]">
      {ICONS[index % ICONS.length]}
    </svg>
  );
}

/**
 * Promises as a row of feature cards (charcoal, with the last one white, as in
 * the reference's plan cards), or a list as question-style rows beside a
 * heading, as in the reference's FAQ.
 */
export function PromiseList({ section }: { section: PromiseListSection }) {
  const items = section.items?.filter(Boolean) ?? [];
  if (!items.length) return null;

  if (section.layout === "rows") {
    return (
      <div className="grid gap-y-[clamp(28px,2.4vw,48px)] gap-x-gap px-gutter lg:grid-cols-2">
        <div>
          {section.label && <Label className={section.heading ? "mb-[clamp(16px,calc(1.24vw+11.4px),35px)]" : ""}>{section.label}</Label>}
          {section.heading && <h2 className="max-w-[16ch] text-h2 font-medium text-balance">{section.heading}</h2>}
        </div>
        <ul>
          <li aria-hidden="true" className="rule-dotted" />
          {items.map((item, i) => (
            <li key={`${i}-${item}`}>
              <div className="flex items-center gap-[clamp(14px,1.4vw,28px)] py-[clamp(18px,calc(0.9vw+14.6px),32px)]">
                <span className="w-[2em] shrink-0 text-small text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-title font-medium">{item}</span>
                <Check className="ml-auto size-5 shrink-0 text-ink-2" />
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
      {(section.label || section.heading) && (
        <div className="mb-[clamp(32px,calc(2.6vw+22px),80px)] px-gutter">
          {section.label && <Label className={section.heading ? "mb-[clamp(16px,calc(1.24vw+11.4px),35px)]" : ""}>{section.label}</Label>}
          {section.heading && <h2 className="max-w-[13.5ch] text-h2 font-medium text-balance">{section.heading}</h2>}
        </div>
      )}
      <ul className={cn("grid gap-[clamp(12px,calc(0.5vw+10px),20px)] px-gutter sm:grid-cols-2", items.length >= 4 && "xl:grid-cols-4")}>
        {items.map((item, i) => {
          const light = i === items.length - 1 && items.length > 2;
          return (
            <li
              key={`${i}-${item}`}
              data-reveal
              className={cn(
                "flex min-h-[clamp(220px,calc(9vw+186px),400px)] flex-col justify-between rounded-card p-[clamp(24px,calc(1.4vw+19px),48px)]",
                light ? "bg-white text-ink" : "on-dark bg-coal text-white",
              )}
            >
              <div className="flex items-start justify-between">
                <ItemIcon index={i} />
                <span className={cn("text-small tabular-nums", light ? "text-mute" : "text-white/55")}>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="mt-10 max-w-[13ch] text-plan font-medium text-balance">{item}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
