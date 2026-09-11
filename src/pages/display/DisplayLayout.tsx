import { NavLink, Outlet } from "react-router-dom";
import {
  IconBoard,
  IconChart,
  IconClass,
  IconIdea,
  IconRecord,
  IconSkill,
  IconTeach,
  IconTrophy,
  IconUpload,
} from "../../components/icons";

const NAV = [
  { to: "/class", label: "教学平台", icon: IconTeach, end: true },
  { to: "/class/preview", label: "技能平台", icon: IconSkill },
  { to: "/class/homework", label: "同步课堂", icon: IconClass },
  { to: "/class/exercise", label: "实时录屏", icon: IconRecord },
  { to: "/class", label: "数智创想", icon: IconIdea },
];

const MODULES = [
  { to: "/class", label: "课堂总览", icon: IconBoard },
  { to: "/class/preview", label: "课前预习 · 分数榜", icon: IconTrophy },
  { to: "/class/homework", label: "课中作业 · 提交墙", icon: IconUpload },
  { to: "/class/exercise", label: "课后习题 · 统计", icon: IconChart },
];

export default function DisplayLayout() {
  return (
    <div className="flex min-h-screen">
      {/* 左侧导航（还原参考图） */}
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-brand-400/15 bg-ink-900/40 px-4 py-6 backdrop-blur-xl">
        <div className="mb-8 px-2">
          <div className="text-glow text-lg font-bold tracking-widest text-brand-100">
            智绘强国资源库
          </div>
          <div className="mt-1 text-xs tracking-widest text-brand-300/60">
            SMART TEACHING · 讲台大屏
          </div>
        </div>

        <nav className="space-y-1.5">
          {NAV.map((n, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-brand-100/90 transition-colors hover:bg-brand-500/10"
            >
              <n.icon className="h-5 w-5 text-brand-300" />
              <span className="text-[15px] font-medium tracking-wide">
                {n.label}
              </span>
            </div>
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-brand-400/15 bg-brand-500/5 p-3 text-xs text-brand-200/70">
          EdgeOne Pages · Serverless
          <br />
          数据源：阿里云 RDS
        </div>
      </aside>

      {/* 主区 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-400/15 bg-ink-900/50 px-8 py-4 backdrop-blur-xl">
          <nav className="flex gap-1">
            {MODULES.map((m) => (
              <NavLink
                key={m.to + m.label}
                to={m.to}
                end={m.to === "/class"}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-500/20 text-brand-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]"
                      : "text-brand-200/70 hover:bg-white/5 hover:text-brand-100"
                  }`
                }
              >
                <m.icon className="h-4 w-4" />
                {m.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-lg border border-brand-400/25 px-4 py-2 text-sm text-brand-100 transition-colors hover:bg-brand-500/15"
            >
              资源库首页
            </a>
            <a
              href="/student"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-brand-400"
            >
              学生端入口 →
            </a>
          </div>
        </header>

        <main className="scrollbar-thin flex-1 overflow-y-auto px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
