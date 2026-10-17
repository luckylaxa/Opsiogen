type IconProps = { className?: string; strokeWidth?: number };

const svg = (path: React.ReactNode, viewBox = "0 0 24 24") =>
  function Icon({ className, strokeWidth = 1.6 }: IconProps) {
    return (
      <svg
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        {path}
      </svg>
    );
  };

export const ArrowRight = svg(<path d="M4 12h15m-6-6 6 6-6 6" />);
export const ArrowUpRight = svg(<path d="M7 17 17 7M8 7h9v9" />);
export const ArrowUp = svg(<path d="M12 20V4m-7 7 7-7 7 7" />);
export const MenuIcon = svg(<path d="M4 8h16M4 16h16" />);
export const CloseIcon = svg(<path d="m6 6 12 12M18 6 6 18" />);
export const ExternalLink = svg(
  <>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </>,
);
export const Plus = svg(<path d="M12 5v14M5 12h14" />);
export const GridIcon = svg(
  <>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </>,
);
export const LayersIcon = svg(
  <>
    <path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z" />
    <path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5" />
  </>,
);
export const InfoIcon = svg(
  <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
    <path d="M12 11v5.5M12 7.5v.01" />
  </>,
);
export const MailIcon = svg(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </>,
);
export const Check = svg(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const ChevronDown = svg(<path d="m6 9 6 6 6-6" />);
export const SearchIcon = svg(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </>,
);
export const MoonIcon = svg(<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />);
export const SunIcon = svg(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2m0 15v2M2.5 12h2m15 0h2M5.3 5.3l1.4 1.4m10.6 10.6 1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </>,
);

/* Line icons for the services, matched by slug (menu rows). */
const ServiceIcons: Record<string, ReturnType<typeof svg>> = {
  "ai-websites": svg(
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M3 9h18M6.5 6.75h.01M9 6.75h.01" />
    </>,
  ),
  "ai-product-design": svg(
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M3.5 9h17M9 9v11.5" />
    </>,
  ),
  "ai-mvps-business-apps": svg(<path d="m8 8-4 4 4 4m8-8 4 4-4 4m-2.5-11-3 14" />),
  "ai-automation": svg(
    <>
      <rect x="3.5" y="4" width="6" height="6" rx="1.5" />
      <rect x="14.5" y="14" width="6" height="6" rx="1.5" />
      <path d="M9.5 7h4a3 3 0 0 1 3 3v4" />
    </>,
  ),
  "ai-social-media-marketing": svg(
    <path d="M12 19.5s-7.5-4.4-7.5-9.7A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.4c0 5.3-7.5 9.7-7.5 9.7Z" />,
  ),
  "digital-marketing": svg(<path d="m3.5 17.5 5.5-5.5 4 4 7.5-8M15 8h5.5v5.5" />),
  "ai-creative-subscription": svg(<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18.5 3v4h-4M5.5 21v-4h4" />),
  "ai-print-collateral": svg(
    <>
      <path d="M7 9V3.5h10V9" />
      <rect x="3.5" y="9" width="17" height="8" rx="2" />
      <path d="M7 14h10v6.5H7z" />
    </>,
  ),
  "ai-brand-services": svg(<path d="M6.5 4h11l3 5L12 20 3.5 9zM3.5 9h17M9.5 4 12 20l2.5-16" />),
  "ai-video-production": svg(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m10 9 5 3-5 3z" />
    </>,
  ),
};

/** A service's line icon; services added later fall back to the layers icon. */
export function ServiceIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ServiceIcons[slug] ?? LayersIcon;
  return <Icon className={className} />;
}
