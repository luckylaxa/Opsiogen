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
