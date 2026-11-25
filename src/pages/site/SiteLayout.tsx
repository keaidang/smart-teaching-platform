import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Logo } from "../../components/Logo";
import { ThemeToggle } from "../../components/ThemeToggle";
import {
  IconBoard,
  IconBook,
  IconChart,
  IconFactory,
  IconExpand,
  IconGauge,
  IconIdea,
} from "../../components/icons";
import type { Tone } from "../../components/ui";

const NAV: { to: string; label: string; desc: string; icon: typeof IconBoard; end?: boolean; tone: Tone }[] = [
  { to: "/", label: "首页", desc: "课程导学 · 技术资源库", icon: IconBoard, end: true, tone: "cyan" },
  { to: "/projects", label: "项目学习资源", desc: "数据生命周期实战", icon: IconBook, tone: "blue" },
  { to: "/industry", label: "产教融合资源", desc: "行业场景 · 产学对接", icon: IconFactory, tone: "amber" },
  { to: "/extensions", label: "拓展课程资源", desc: "前沿 · 赛证 · 合规", icon: IconExpand, tone: "violet" },
  { to: "/evaluation", label: "教学评价资源", desc: "多维 · 智能 · 全过程", icon: IconGauge, tone: "emerald" },
  { to: "/mindmap", label: "课程知识图谱", desc: "课程 · 项目 · 任务 · 知识点", icon: IconIdea, tone: "violet" },
  { to: "/graph-stats", label: "图谱统计分析", desc: "掌握率 · 学情 · TOPS", icon: IconChart, tone: "rose" },
];

export default function SiteLayout() {
  const { pathname } = useLocation();
  const current = NAV.find((n) => (n.end ? n.to === "/" : pathname.startsWith(n.to)));

  return (
    <div className="flex h-screen">
      <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-slate-900/10 bg-surface/85 px-4 py-7 backdrop-blur-xl">
        <div className="mb-10 flex items-center gap-3 px-2">
          <Logo size={44} />
          <div>
            <div className="text-2xl font-bold tracking-widest text-slate-900">
              数智社区
            </div>
            <div className="mt-0.5 text-sm tracking-widest text-brand-600/70">
              教学资源库
            </div>
          </div>
        </div>

        <nav className="space-y-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `tone-${n.tone} group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all ${
                  isActive
                    ? "tone-card glass"
                    : "hover:bg-slate-900/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`icon-chip h-11 w-11 shrink-0 rounded-lg ${isActive ? "" : "opacity-70 group-hover:opacity-100"}`}>
                    <n.icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-lg font-medium tracking-wide ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                      {n.label}
                    </span>
                    <span className="block truncate text-[13px] text-slate-500">
                      {n.desc}
                    </span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 px-2">
          <div className="divider-grad" />
          <div className="flex flex-wrap gap-2">
            <span className="chip-tone tone-cyan rounded-md px-2 py-0.5 text-xs">Python</span>
            <span className="chip-tone tone-emerald rounded-md px-2 py-0.5 text-xs">数据治理</span>
            <span className="chip-tone tone-rose rounded-md px-2 py-0.5 text-xs">可视化</span>
          </div>
          <div className="text-[13px] leading-relaxed text-slate-500">
            《人工智能数据服务》
            <br />
            校企融合 · 真实任务工单
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-900/10 bg-surface/85 px-8 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-slate-700">首页</span>
            {current && current.to !== "/" && (
              <>
                <span className="text-slate-600">/</span>
                <span className={`tone-${current.tone} font-medium`} style={{ color: "var(--tone)" }}>{current.label}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="ghost" />
            <a
              href="/admin"
              className="rounded-lg border border-amber-400/30 px-4 py-2 text-sm text-amber-600 transition-colors hover:bg-amber-400/10"
            >
              管理
            </a>
            <a
              href="/class"
              className="rounded-lg border border-violet-400/30 px-4 py-2 text-sm text-violet-600 transition-colors hover:bg-violet-400/10"
            >
              后台大屏
            </a>
            <a
              href="/student"
              className="rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
            >
              学生入口 →
            </a>
          </div>
        </header>

        <main className="scrollbar-thin flex flex-1 flex-col overflow-y-auto px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
