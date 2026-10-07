import { CmsPage, cmsMetadata } from "@/components/CmsPage";

export const revalidate = 60;

export function generateMetadata() {
  return cmsMetadata("work", "/work");
}

export default function WorkPage() {
  return <CmsPage slug="work" />;
}
