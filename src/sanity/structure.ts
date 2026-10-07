import type { StructureResolver } from "sanity/structure";
import { CaseIcon } from "@sanity/icons/Case";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentIcon } from "@sanity/icons/Document";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { SparklesIcon } from "@sanity/icons/Sparkles";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Opsiogen")
    .items([
      S.listItem()
        .title("Site settings")
        .icon(CogIcon)
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings")),
      S.divider(),
      S.documentTypeListItem("page").title("Pages").icon(DocumentIcon),
      S.listItem()
        .title("Projects")
        .icon(CaseIcon)
        .child(
          S.documentTypeList("project")
            .title("Projects")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.listItem()
        .title("Services")
        .icon(SparklesIcon)
        .child(
          S.documentTypeList("service")
            .title("Services")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.divider(),
      S.listItem()
        .title("Enquiries")
        .icon(EnvelopeIcon)
        .child(
          S.documentTypeList("enquiry")
            .title("Enquiries")
            .canHandleIntent(() => false)
            .defaultOrdering([{ field: "submittedAt", direction: "desc" }]),
        ),
    ]);
