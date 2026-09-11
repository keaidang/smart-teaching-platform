import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconTeach = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 5h18v11H3z" />
    <path d="M7 20h10M12 16v4" />
    <path d="M7 9l3 2 4-4" />
  </svg>
);

export const IconSkill = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12h4l2 5 4-12 2 7h6" />
  </svg>
);

export const IconClass = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="12" height="16" rx="1.5" />
    <path d="M18 8v8M21 6v12" />
  </svg>
);

export const IconRecord = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="M16 10l5-3v10l-5-3z" />
  </svg>
);

export const IconIdea = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
  </svg>
);

export const IconBoard = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
);

export const IconTrophy = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
    <path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M10 13h4M9 20h6M12 16v4" />
  </svg>
);

export const IconUpload = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 16V4M8 8l4-4 4 4" />
    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 13l4 4L19 7" />
  </svg>
);

export const IconChart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 16v-4M12 16V8M16 16v-6" />
  </svg>
);

export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" />
  </svg>
);

export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconLogout = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 8l-4 4 4 4M6 12h10" />
  </svg>
);

export const IconBook = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
    <path d="M8 3v18" />
  </svg>
);

export const IconHome = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 10v9h12v-9" />
    <path d="M10 19v-5h4v5" />
  </svg>
);

export const IconLayers = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l9 5-9 5-9-5z" />
    <path d="M3 13l9 5 9-5M3 17l9 5 9-5" />
  </svg>
);

export const IconFactory = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 20V9l6 4V9l6 4V6h3v14z" />
    <path d="M3 20h18" />
  </svg>
);

export const IconExpand = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
);

export const IconGauge = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 13l4-4" />
    <path d="M4 18a8 8 0 1 1 16 0" />
    <circle cx="12" cy="13" r="1.4" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconCpu = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <path d="M10 3v2M14 3v2M10 19v2M14 19v2M3 10h2M3 14h2M19 10h2M19 14h2" />
  </svg>
);

