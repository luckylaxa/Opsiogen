import type { ProcessSection } from "@/lib/types";
import { GiantHeading } from "@/components/ui/Headings";
import { Accordion } from "@/components/ui/Accordion";

/** “How we work”: a giant title, then the steps as a numbered accordion. */
export function Process({ section }: { section: ProcessSection }) {
  const steps = section.steps?.filter((s) => s.title) ?? [];
  if (!steps.length) return null;
  return (
    <div>
      <GiantHeading
        label={section.label}
        heading={section.heading}
        accent={section.accent}
        className="mb-[clamp(40px,calc(3.4vw+27px),100px)]"
      />
      <div className="px-gutter">
        <Accordion
          name={`process-${section._key}`}
          items={steps.map((s, i) => ({ key: s._key ?? String(i), title: s.title, content: s.text }))}
        />
      </div>
    </div>
  );
}
