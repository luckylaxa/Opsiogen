import { documentTypes } from "./documents";
import { linkType, seoType } from "./objects/shared";
import { sectionTypes } from "./sections";

export const schemaTypes = [...documentTypes, linkType, seoType, ...sectionTypes];

/** Documents that exist once and are opened directly from the Studio menu. */
export const SINGLETON_TYPES = ["siteSettings"];
