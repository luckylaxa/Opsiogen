import { PortableText, type PortableTextComponents } from "next-sanity";
import { Media } from "@/components/ui/Media";
import { CARD_IMAGES, LIST_IMAGES } from "@/content/section-images";
import type { PromiseListSection, ShortTextSection } from "@/lib/types";
import { Label, SectionHeading } from "@/components/ui/Headings";
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

/** Text on the dark card: lighter, a little larger. */
const cardText: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-[1em] text-lead text-white/75 first:mt-0">{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  },
};

export function ShortText({ section }: { section: ShortTextSection }) {
  const photo = CARD_IMAGES[section._key];
  // With a photo: one big dark card, the photo beside the text (above it on phones).
  if (photo) {
    return (
      <div className="px-gutter">
        <div data-reveal className="on-dark grid overflow-hidden rounded-card bg-coal text-white lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[clamp(460px,44vw,760px)]">
            <Media image={photo} sizes="(min-width: 1024px) 50vw, 100vw" lowPriority />
          </div>
          <div className="flex flex-col justify-center p-[clamp(24px,calc(2.9vw+13px),80px)]">
            {section.label && <p className="text-base text-white/55">{section.label}</p>}
            {section.heading && (
              <h2 className="mt-[clamp(12px,1.2vw,24px)] max-w-[13ch] text-[length:clamp(34px,calc(2.1vw+26px),68px)] leading-[1.03] font-semibold tracking-[-0.025em] text-balance">
                {section.heading}
              </h2>
            )}
            {section.body && section.body.length > 0 && (
              <div className="mt-[clamp(20px,2vw,40px)] max-w-[44ch]">
                <PortableText value={section.body} components={cardText} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
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
  const photos = LIST_IMAGES[section._key] ?? [];
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
              <div className="flex items-center gap-[clamp(16px,2vw,40px)] px-[clamp(0px,1.84vw,35px)] py-[clamp(18px,calc(1.24vw+13.4px),40px)]">
                <span className="w-[2.2em] shrink-0 text-base text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 text-[length:clamp(26px,calc(1.7vw+19.6px),52px)] font-medium leading-[1.12] tracking-[-0.01em]">{item}</span>
                {photos[i] && (
                  <span className="relative aspect-[4/3] w-[clamp(72px,9vw,168px)] shrink-0 overflow-hidden rounded-[8px] bg-night">
                    <Media image={photos[i]} sizes="(min-width: 768px) 168px, 72px" lowPriority />
                  </span>
                )}
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
      {/* Three or four in one row on desktop, two by two on tablets, one below the other on phones. */}
      <ul className={cn("grid gap-gap px-gutter sm:grid-cols-2", items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
        {items.map((item, i) => (
          <li key={`${i}-${item}`} data-reveal className="on-dark flex flex-col overflow-hidden rounded-card bg-coal text-white">
            {photos[i] && (
              <div className="relative aspect-[4/3]">
                <Media image={photos[i]} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" lowPriority />
              </div>
            )}
            <div className="flex grow flex-col p-[clamp(20px,calc(1vw+16px),36px)]">
              <span className="text-base text-white/55 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-auto pt-[clamp(28px,3vw,56px)] text-[length:clamp(24px,calc(0.7vw+20px),34px)] leading-[1.1] font-semibold tracking-[-0.015em] text-balance">
                {item}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
