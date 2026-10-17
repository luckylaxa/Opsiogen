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
export const TrendIcon = svg(<path d="M3.5 17 9 11.5l4 4L20.5 8M15 8h5.5v5.5" />);
export const CodeIcon = svg(<path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13" />);
export const SparkIcon = svg(
  <path d="M12 3.5c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7ZM18.5 15.5c.2 1.6 1 2.4 2.5 2.5-1.6.2-2.4 1-2.5 2.5-.2-1.6-1-2.4-2.5-2.5 1.6-.2 2.4-1 2.5-2.5Z" />,
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
