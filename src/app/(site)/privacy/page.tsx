import { CmsPage, cmsMetadata } from "@/components/CmsPage";

export const revalidate = 60;

export function generateMetadata() {
  return cmsMetadata("privacy", "/privacy");
}

export default function PrivacyPage() {
  return <CmsPage slug="privacy" />;
}
