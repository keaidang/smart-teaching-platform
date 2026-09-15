import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Logo } from "../../components/Logo";
import {
  IconBoard,
  IconBook,
  IconFactory,
  IconExpand,
  IconGauge,
} from "../../components/icons";

const NAV = [
  { to: "/", label: "首页", desc: "课程导学 · 技术资源库", icon: IconBoard, end: true },
  { to: "/projects", label: "项目学习资源", desc: "数据生命周期实战", icon: IconBook },
  { to: "/industry", label: "产教融合资源", desc: "行业场景 · 产学对接", icon: IconFactory },
  { to: "/extensions", label: "拓展课程资源", desc: "前沿 · 赛证 · 合规", icon: IconExpand },
  { to: "/evaluation", label: "教学评价资源", desc: "多维 · 智能 · 全过程", icon: IconGauge },
];

export default function SiteLayout() {
  const { pathname } = useLocation();
  const current = NAV.find((n) => (n.end ? n.to === "/" : pathname.startsWith(n.to)));

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-brand-400/15 bg-ink-900/40 px-4 py-6 backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-3 px-2">
          <Logo size={40} />
          <div>
            <div className="text-glow text-lg font-bold tracking-widest text-brand-100">
              数智社区
            </div>
            <div className="mt-0.5 text-xs tracking-widest text-brand-300/60">
              教学资源库
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2.5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `group flex min-h-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-brand-500/25 to-brand-500/5 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]"
                    : "hover:bg-white/5"
                }`
              }
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-300 group-hover:text-brand-200">
                <n.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-medium tracking-wide text-white">
                  {n.label}
                </span>
                <span className="block truncate text-[11px] text-brand-200/50">
                  {n.desc}
                </span>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-brand-400/10 px-3 pt-4 text-[11px] leading-relaxed text-brand-200/35">
          《人工智能数据服务》
          <br />
          校企融合 · 真实任务工单
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-400/15 bg-ink-900/50 px-8 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-brand-200/70">
            <span className="text-brand-100">首页</span>
            {current && current.to !== "/" && (
              <>
                <span className="text-brand-200/30">/</span>
                <span className="font-medium text-white">{current.label}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin"
              className="rounded-lg border border-brand-400/25 px-4 py-2 text-sm text-brand-100 transition-colors hover:bg-brand-500/15"
            >
              管理
            </a>
            <a
              href="/class"
              className="rounded-lg border border-brand-400/25 px-4 py-2 text-sm text-brand-100 transition-colors hover:bg-brand-500/15"
            >
              后台大屏
            </a>
            <a
              href="/student"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-brand-400"
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
