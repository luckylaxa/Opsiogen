import { CmsPage, cmsMetadata } from "@/components/CmsPage";

export const revalidate = 60;

export function generateMetadata() {
  return cmsMetadata("home", "/");
}

export default function HomePage() {
  return <CmsPage slug="home" />;
}
