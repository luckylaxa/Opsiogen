"use client";

/**
 * Sanity Studio, mounted at /studio (see src/app/(studio)/studio/[[...tool]]/page.tsx).
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, SINGLETON_TYPES } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

const READ_ONLY_TYPES = ["enquiry"];

export default defineConfig({
  name: "opsiogen",
  title: "Opsiogen",
  basePath: "/studio",
  projectId: projectId || "missing-project-id",
  dataset,
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => !SINGLETON_TYPES.includes(schemaType) && !READ_ONLY_TYPES.includes(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) => {
      if (SINGLETON_TYPES.includes(schemaType)) {
        return actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action));
      }
      if (READ_ONLY_TYPES.includes(schemaType)) {
        return actions.filter(({ action }) => action === "delete");
      }
      return actions;
    },
    newDocumentOptions: (items) =>
      items.filter(({ templateId }) => !SINGLETON_TYPES.includes(templateId) && !READ_ONLY_TYPES.includes(templateId)),
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
