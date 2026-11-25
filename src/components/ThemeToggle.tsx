import { useTheme } from "../lib/theme";

/**
 * 昼/夜主题切换按钮。variant:
 * - "chip"  : 带描边的胶囊按钮（站点/学生/大屏头部）
 * - "ghost" : 纯图标（空间紧凑处）
 */
export function ThemeToggle({ variant = "chip" }: { variant?: "chip" | "ghost" }) {
  const { mode, toggle } = useTheme();
  const dark = mode === "dark";
  const label = dark ? "切换到浅色" : "切换到深色";

  const icon = dark ? (
    // 月亮
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  ) : (
    // 太阳
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
    </svg>
  );

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={toggle}
        title={label}
        aria-label={label}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-900"
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      aria-pressed={dark}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-900/12 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900"
    >
      {icon}
      <span className="hidden sm:inline">{dark ? "深色" : "浅色"}</span>
    </button>
  );
}
