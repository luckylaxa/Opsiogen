import { CmsPage, cmsMetadata } from "@/components/CmsPage";
import { Toolbar } from "@/components/ui/Toolbar";
import { getServices, getSettings } from "@/lib/data";
import { GROUP_LABELS } from "@/lib/utils";

export const revalidate = 60;

export function generateMetadata() {
  return cmsMetadata("services", "/services");
}

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  const groups = (Object.keys(GROUP_LABELS) as (keyof typeof GROUP_LABELS)[]).filter((g) =>
    services.some((s) => s.group === g),
  );
  return (
    <CmsPage
      slug="services"
      layout={{
        hero: "plain",
        toolbar: (
          <Toolbar
            label="Service groups"
            mark={`${settings.siteTitle.charAt(0)}.`}
            items={groups.map((g) => ({ label: GROUP_LABELS[g], href: `#${g}` }))}
            action={settings.headerButton}
          />
        ),
      }}
    />
  );
}
