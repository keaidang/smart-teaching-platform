import type { ReactNode } from "react";

// 模块色体系：青=首页/采集 蓝=项目/学生 紫=拓展/融合 绿=评价/清洗 琥珀=产教/警示 玫红=可视化/素养 橙=行业
export type Tone = "cyan" | "blue" | "violet" | "emerald" | "amber" | "rose" | "orange";

export const TONE_HEX: Record<Tone, string> = {
  cyan: "#22d3ee",
  blue: "#60a5fa",
  violet: "#a78bfa",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#f472b6",
  orange: "#fb923c",
};

export function Card({
  children,
  className = "",
  hover = false,
  onClick,
  tone,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  tone?: Tone;
}) {
  return (
    <div
      onClick={onClick}
      className={`glass rounded-2xl ${tone ? `tone-card tone-${tone}` : ""} ${hover ? "glass-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  icon,
  title,
  sub,
  right,
  large = false,
  tone = "cyan",
}: {
  icon?: ReactNode;
  title: string;
  sub?: string;
  right?: ReactNode;
  large?: boolean;
  tone?: Tone;
}) {
  return (
    <div className={`mb-5 flex items-end justify-between tone-${tone}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <span className={`icon-chip rounded-xl ${large ? "h-14 w-14" : "h-11 w-11"}`}>
            {icon}
          </span>
        )}
        <div>
          <h2 className={`font-semibold tracking-wide text-slate-900 ${large ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
            {title}
          </h2>
          {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Stat({
  value,
  label,
  tone = "cyan",
  icon,
}: {
  value: string | number;
  label: string;
  tone?: Tone;
  icon?: ReactNode;
}) {
  return (
    <div className={`tone-${tone} flex items-center gap-3`}>
      {icon && <span className="icon-chip h-11 w-11 rounded-xl">{icon}</span>}
      <div className="text-center">
        <div className="grad-text text-3xl font-extrabold tabular-nums">{value}</div>
        <div className="mt-0.5 text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export function Tag({
  children,
  tone = "cyan",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={`chip-tone tone-${tone} inline-flex items-center rounded-lg px-3 py-1 text-sm font-medium ${className}`}>
      {children}
    </span>
  );
}

export function LiveBadge({ label = "实时" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-600">
      <span className="live-dot h-2 w-2 rounded-full bg-emerald-400" />
      {label}
    </span>
  );
}

export function Bar({
  value,
  max = 100,
  color = "#22d3ee",
  height = 8,
}: {
  value: number;
  max?: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar-track w-full overflow-hidden rounded-full" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
      />
    </div>
  );
}

export function Avatar({
  name,
  color,
  size = 40,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-ink-950"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}bb)`,
        boxShadow: `0 4px 14px -4px ${color}66`,
        fontSize: size * 0.4,
      }}
    >
      {name.slice(0, 1)}
    </span>
  );
}