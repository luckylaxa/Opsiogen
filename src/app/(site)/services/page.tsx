import { CmsPage, cmsMetadata } from "@/components/CmsPage";

export const revalidate = 60;

export function generateMetadata() {
  return cmsMetadata("services", "/services");
}

export default function ServicesPage() {
  return <CmsPage slug="services" layout={{ services: "groups" }} />;
}
