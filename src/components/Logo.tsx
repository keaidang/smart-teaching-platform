export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="lg_base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f74a8" />
          <stop offset="0.55" stopColor="#2c6c8c" />
          <stop offset="1" stopColor="#226e7f" />
        </linearGradient>
        <linearGradient id="lg_sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#lg_base)" />
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#lg_sheen)" />
      <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="15.25" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />
      {/* 数据星座：中心节点连接三枚卫星 */}
      <g stroke="#eef5f9" strokeOpacity="0.92" strokeWidth="2.4" strokeLinecap="round">
        <line x1="32" y1="32" x2="32" y2="17" />
        <line x1="32" y1="32" x2="19" y2="43" />
        <line x1="32" y1="32" x2="45" y2="43" />
      </g>
      <g fill="#f2f7fa">
        <circle cx="32" cy="17" r="4" />
        <circle cx="19" cy="43" r="4" />
        <circle cx="45" cy="43" r="4" />
      </g>
      <circle cx="32" cy="32" r="8" fill="#0e2b34" />
      <circle cx="32" cy="32" r="3.6" fill="#7cc4d0" />
    </svg>
  );
}
