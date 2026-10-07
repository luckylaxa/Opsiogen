import { CmsPage, cmsMetadata } from "@/components/CmsPage";

export const revalidate = 60;

export function generateMetadata() {
  return cmsMetadata("about", "/about");
}

export default function AboutPage() {
  return <CmsPage slug="about" />;
}
