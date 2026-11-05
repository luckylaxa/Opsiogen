import { CmsPage, cmsMetadata } from "@/components/CmsPage";

export const revalidate = 10;

export function generateMetadata() {
  return cmsMetadata("home", "/");
}

export default function HomePage() {
  return <CmsPage slug="home" layout={{ services: "directory", cta: "dual" }} />;
}
