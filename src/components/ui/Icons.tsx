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
