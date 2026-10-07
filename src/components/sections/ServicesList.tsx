import Link from "next/link";
import type { Service, ServiceGroup, ServicesListSection } from "@/lib/types";
import { getServices, getSettings } from "@/lib/data";
import { SectionHeading } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import { cn, GROUP_LABELS } from "@/lib/utils";

const GROUPS: ServiceGroup[] = ["build", "grow", "create"];

/**
 * The services in their three groups, laid out like the reference's plan
 * cards: two charcoal cards and a white one, each with a big count, a button
 * and the group's services listed underneath (name and tagline, linked).
 */
export async function ServicesList({ section }: { section: ServicesListSection }) {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  const groups = GROUPS.map((group) => ({ group, items: services.filter((s) => s.group === group) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <div data-dock="/services">
      <SectionHeading
        label={section.label}
        heading={section.heading}
        text={section.text}
        className="mb-[clamp(40px,calc(3.4vw+27px),105px)]"
      />
      <div className="grid gap-[clamp(12px,calc(0.5vw+10px),20px)] px-gutter lg:grid-cols-3">
        {groups.map(({ group, items }, i) => (
          <PlanCard
            key={group}
            group={group}
            items={items}
            dark={i < groups.length - 1}
            button={settings.headerButton}
            headingLevel={section.heading ? "h3" : "h2"}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  group,
  items,
  dark,
  button,
  headingLevel: Heading,
}: {
  group: ServiceGroup;
  items: Service[];
  dark: boolean;
  button: { label: string; href: string };
  headingLevel: "h2" | "h3";
}) {
  const title = GROUP_LABELS[group];
  return (
    <section
      id={group}
      aria-labelledby={`${group}-title`}
      data-reveal
      className={cn(
        "flex scroll-mt-[calc(var(--header-h)+24px)] flex-col rounded-card p-[clamp(24px,calc(1.6vw+18px),56px)]",
        dark ? "on-dark bg-coal text-white" : "bg-white text-ink",
      )}
    >
      <Heading id={`${group}-title`} className="text-plan font-medium">
        {title}
      </Heading>

      <p className="mt-[clamp(32px,calc(2.6vw+22px),72px)] flex items-baseline gap-[0.35em]">
        <span className="text-number font-semibold tabular-nums">{String(items.length).padStart(2, "0")}</span>
        <span className="text-[length:clamp(16px,calc(0.4vw+14.5px),22px)]">/ services</span>
      </p>
      <p className={cn("mt-3 text-small", dark ? "text-white/60" : "text-mute")}>
        {items.map((s) => s.shortName).join(" · ")}
      </p>

      {button.href && (
        <ButtonLink
          href={button.href}
          variant={dark ? "outline-light" : "outline"}
          className="mt-[clamp(28px,calc(1.3vw+23px),48px)] w-fit min-w-[clamp(180px,calc(5vw+160px),240px)]"
        >
          {button.label}
        </ButtonLink>
      )}

      <ul className="mt-[clamp(40px,calc(4vw+26px),110px)] flex flex-col">
        {items.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/services/${s.slug}`}
              className={cn(
                "group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 border-t py-[clamp(14px,calc(0.4vw+12.5px),20px)]",
                dark ? "border-white/12" : "border-ink/10",
              )}
            >
              <span aria-hidden="true" className="mt-[0.62em] size-[5px] rounded-full bg-current opacity-70" />
              <span>
                <span className="block text-base font-medium">{s.name}</span>
                <span className={cn("mt-0.5 block text-small", dark ? "text-white/55" : "text-mute")}>{s.tagline}</span>
              </span>
              <ArrowUpRight className="mt-[0.15em] size-5 opacity-40 transition-[opacity,translate] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
