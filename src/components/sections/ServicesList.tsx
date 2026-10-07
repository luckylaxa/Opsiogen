import Link from "next/link";
import type { Service, ServicesListSection } from "@/lib/types";
import { getServices } from "@/lib/data";
import { SectionHeading } from "@/components/ui/Headings";
import { buttonClass } from "@/components/ui/Button";
import { ArrowRight } from "@/components/ui/Icons";
import { cn, GROUP_LABELS } from "@/lib/utils";

const GROUPS = ["build", "grow", "create"] as const;

/** Services as dotted-rule rows in three groups, like the reference directory table. */
export async function ServicesList({ section }: { section: ServicesListSection }) {
  const services = await getServices();
  return (
    <div data-dock="/services">
      <SectionHeading
        label={section.label}
        heading={section.heading}
        text={section.text}
        className="mb-[clamp(40px,calc(3.4vw+27px),105px)]"
      />
      <div className="flex flex-col gap-[clamp(48px,calc(2.6vw+38px),90px)] px-gutter">
        {GROUPS.map((group) => {
          const items = services.filter((s) => s.group === group);
          if (!items.length) return null;
          return <ServiceGroup key={group} title={GROUP_LABELS[group]} items={items} />;
        })}
      </div>
    </div>
  );
}

function ServiceGroup({ title, items }: { title: string; items: Service[] }) {
  return (
    <section aria-label={title}>
      <h3 className="px-[clamp(0px,1.84vw,35px)] pb-[clamp(16px,calc(1.18vw+11.6px),40px)] text-base text-ink-2">{title}</h3>
      <div className="rule-dotted" />
      <ul>
        {items.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/services/${s.slug}`}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 px-[clamp(0px,1.84vw,35px)] py-[clamp(20px,calc(1.24vw+15.4px),44px)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_auto]"
            >
              <span className="text-row font-medium">{s.name}</span>
              <span className="col-start-1 row-start-2 text-row text-ink-2 md:col-start-auto md:row-start-auto">{s.tagline}</span>
              <span aria-hidden="true" className="hidden md:block">
                <span className={cn(buttonClass("outline", "md"), "group-hover:bg-ink group-hover:text-white")}>View</span>
              </span>
              <ArrowRight className="col-start-2 row-span-2 row-start-1 size-6 transition-transform duration-300 group-hover:translate-x-1 md:hidden" />
            </Link>
            <div className="rule-dotted" />
          </li>
        ))}
      </ul>
    </section>
  );
}
