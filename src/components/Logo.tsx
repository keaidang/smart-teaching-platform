import { useTheme } from "../lib/theme";

export function Logo({ size = 36 }: { size?: number }) {
  const { mode } = useTheme();
  const dark = mode === "dark";
  // 浅色：白底板 + 发丝灰描边；暗色：深青玻璃底 + 冷色细描边，四色节点保持不变
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {dark ? (
        <>
          <defs>
            <linearGradient id="logoTile" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0e2b34" />
              <stop offset="1" stopColor="#0a1f27" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#logoTile)" />
          <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="15.25" fill="none" stroke="rgba(130,222,206,0.32)" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <rect x="2" y="2" width="60" height="60" rx="16" fill="#ffffff" />
          <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="15.25" fill="none" stroke="#E8EAED" strokeWidth="1.5" />
        </>
      )}
      <g stroke={dark ? "rgba(230,246,251,0.28)" : "#DADCE0"} strokeWidth="2.4" strokeLinecap="round">
        <line x1="32" y1="32" x2="32" y2="17" />
        <line x1="32" y1="32" x2="19" y2="43" />
        <line x1="32" y1="32" x2="45" y2="43" />
      </g>
      <circle cx="32" cy="17" r="4.5" fill="#EA4335" />
      <circle cx="19" cy="43" r="4.5" fill="#FBBC05" />
      <circle cx="45" cy="43" r="4.5" fill="#34A853" />
      <circle cx="32" cy="32" r="8" fill="#4285F4" />
      <circle cx="32" cy="32" r="3.2" fill={dark ? "#0a1f27" : "#ffffff"} />
    </svg>
  );
}
