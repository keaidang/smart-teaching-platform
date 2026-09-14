export function Logo({ size = 36 }: { size?: number }) {
  const id = "logoGrad";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2ee6f5" />
          <stop offset="0.55" stopColor="#06b6d4" />
          <stop offset="1" stopColor="#0e5f7a" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id})`} />
      <rect x="2" y="2" width="60" height="60" rx="16" fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.5" />
      <g stroke="#04141a" strokeWidth="3" strokeLinecap="round" opacity="0.9">
        <line x1="32" y1="32" x2="32" y2="16" />
        <line x1="32" y1="32" x2="18" y2="43" />
        <line x1="32" y1="32" x2="46" y2="43" />
      </g>
      <g fill="#eafcff">
        <circle cx="32" cy="16" r="5" />
        <circle cx="18" cy="43" r="5" />
        <circle cx="46" cy="43" r="5" />
      </g>
      <circle cx="32" cy="32" r="8.5" fill="#04141a" />
      <circle cx="32" cy="32" r="4.5" fill="#2ee6f5" />
    </svg>
  );
}
