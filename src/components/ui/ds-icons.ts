/**
 * Line icons from the design system (Lucide set, ISC licence), for the icon
 * columns on service pages. Keys are the names editors pick in Studio.
 */
export const DS_ICONS = {
  "globe": `<circle cx="12" cy="12" r="10" /> <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /> <path d="M2 12h20" />`,
  "target": `<circle cx="12" cy="12" r="10" /> <circle cx="12" cy="12" r="6" /> <circle cx="12" cy="12" r="2" />`,
  "layers": `<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /> <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /> <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />`,
  "file-text": `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /> <path d="M14 2v4a2 2 0 0 0 2 2h4" /> <path d="M10 9H8" /> <path d="M16 13H8" /> <path d="M16 17H8" />`,
  "monitor-smartphone": `<path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" /> <path d="M10 19v-3.96 3.15" /> <path d="M7 19h5" /> <rect width="6" height="10" x="16" y="12" rx="2" />`,
  "rocket": `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /> <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /> <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /> <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />`,
  "pen-tool": `<path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" /> <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" /> <path d="m2.3 2.3 7.286 7.286" /> <circle cx="11" cy="11" r="2" />`,
  "chart-line": `<path d="M3 3v16a2 2 0 0 0 2 2h16" /> <path d="m19 9-5 5-4-4-3 3" />`,
  "users": `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <circle cx="9" cy="7" r="4" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <path d="M16 3.13a4 4 0 0 1 0 7.75" />`,
  "workflow": `<rect width="8" height="8" x="3" y="3" rx="2" /> <path d="M7 11v4a2 2 0 0 0 2 2h4" /> <rect width="8" height="8" x="13" y="13" rx="2" />`,
  "sparkles": `<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /> <path d="M20 3v4" /> <path d="M22 5h-4" /> <path d="M4 17v2" /> <path d="M5 18H3" />`,
  "zap": `<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />`,
  "shield-check": `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /> <path d="m9 12 2 2 4-4" />`,
  "gauge": `<path d="m12 14 4-4" /> <path d="M3.34 19a10 10 0 1 1 17.32 0" />`,
  "search": `<circle cx="11" cy="11" r="8" /> <path d="m21 21-4.3-4.3" />`,
  "mail": `<rect width="20" height="16" x="2" y="4" rx="2" /> <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />`,
  "message-square": `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />`,
  "layout-grid": `<rect width="7" height="7" x="3" y="3" rx="1" /> <rect width="7" height="7" x="14" y="3" rx="1" /> <rect width="7" height="7" x="14" y="14" rx="1" /> <rect width="7" height="7" x="3" y="14" rx="1" />`,
  "code-xml": `<path d="m18 16 4-4-4-4" /> <path d="m6 8-4 4 4 4" /> <path d="m14.5 4-5 16" />`,
  "database": `<ellipse cx="12" cy="5" rx="9" ry="3" /> <path d="M3 5V19A9 3 0 0 0 21 19V5" /> <path d="M3 12A9 3 0 0 0 21 12" />`,
  "trending-up": `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /> <polyline points="16 7 22 7 22 13" />`,
  "calendar": `<path d="M8 2v4" /> <path d="M16 2v4" /> <rect width="18" height="18" x="3" y="4" rx="2" /> <path d="M3 10h18" />`,
  "clock": `<circle cx="12" cy="12" r="10" /> <polyline points="12 6 12 12 16 14" />`,
  "building-2": `<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /> <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /> <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /> <path d="M10 6h4" /> <path d="M10 10h4" /> <path d="M10 14h4" /> <path d="M10 18h4" />`,
  "briefcase": `<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /> <rect width="20" height="14" x="2" y="6" rx="2" />`,
  "headphones": `<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />`,
  "mouse-pointer-2": `<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />`,
  "refresh-cw": `<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /> <path d="M21 3v5h-5" /> <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /> <path d="M8 16H3v5" />`,
  "settings-2": `<path d="M20 7h-9" /> <path d="M14 17H5" /> <circle cx="17" cy="17" r="3" /> <circle cx="7" cy="7" r="3" />`,
  "send": `<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /> <path d="m21.854 2.147-10.94 10.939" />`,
  "eye": `<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /> <circle cx="12" cy="12" r="3" />`,
  "scan-line": `<path d="M3 7V5a2 2 0 0 1 2-2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M21 17v2a2 2 0 0 1-2 2h-2" /> <path d="M7 21H5a2 2 0 0 1-2-2v-2" /> <path d="M7 12h10" />`,
} as const;

export type DsIconName = keyof typeof DS_ICONS;

export const DS_ICON_NAMES = Object.keys(DS_ICONS) as DsIconName[];
