import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  IconBoard,
  IconChart,
  IconTrophy,
  IconUpload,
} from "../../components/icons";
import { PROJECTS, ACTIVE_TASK_ID, findTask } from "../../lib/course";

const MODULES = [
  { to: "/class", label: "课堂总览", icon: IconBoard },
  { to: "/class/preview", label: "课前预习 · 分数榜", icon: IconTrophy },
  { to: "/class/homework", label: "课中作业 · 提交墙", icon: IconUpload },
  { to: "/class/exercise", label: "课后习题 · 统计", icon: IconChart },
];

export default function DisplayLayout() {
  const nav = useNavigate();
  const location = useLocation();
  // 当前展示的任务：URL 带 task=P4T1 且在作业墙 → P4T1；否则 P1T2 主线
  const urlTask = new URLSearchParams(location.search).get("task") || "";
  const showingP4T1 = urlTask === "P4T1" && location.pathname.startsWith("/class/homework");
  // 直接从任务详情页点「后台大屏」（/class/homework?task=P4T1）时跳过选择页
  const [entered, setEntered] = useState(() => showingP4T1);

  const choose = (id: string) => {
    // P1T2 = 主线大屏；P4T1 = 直达任务作业墙；其余暂不开放
    if (id !== ACTIVE_TASK_ID && id !== "P4T1") return;
    if (id === ACTIVE_TASK_ID) {
      nav("/class");
      setEntered(true);
    } else {
      nav("/class/homework?task=P4T1");
      setEntered(true);
    }
  };

  if (!entered) {
    return (
      <div className="grid min-h-screen place-items-center px-6 py-10">
        <div className="w-full max-w-3xl animate-rise">
          <div className="mb-6 text-center">
            <div className="text-glow text-2xl font-bold tracking-widest text-brand-100">后台大屏 · 选择课堂任务</div>
            <p className="mt-2 text-sm text-brand-200/60">选择课堂任务进入数据大屏</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {PROJECTS.map((p, pi) => (
              <div key={p.id} className="glass rounded-2xl p-5">
                <div className="mb-3 font-semibold text-white">{pi + 1}. {p.title}</div>
                <div className="space-y-2">
                  {p.tasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => choose(t.id)}
                      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-brand-100 transition-colors hover:border-brand-400/50 hover:bg-brand-500/15"
                    >
                      <span className="truncate">{t.title}</span>
                      <span className="text-brand-300">进入 →</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-brand-200/60 hover:text-brand-100">← 返回资源库首页</a>
          </div>
        </div>
      </div>
    );
  }

  const task = showingP4T1 ? findTask("P4T1") : findTask(ACTIVE_TASK_ID);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-brand-400/15 bg-ink-900/50 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-glow text-lg font-bold tracking-widest text-brand-100">后台大屏</span>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            {task?.task.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <nav className="mr-2 flex gap-1">
            {MODULES.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end={m.to === "/class"}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-500/20 text-brand-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]"
                      : "text-brand-200/70 hover:bg-white/5 hover:text-brand-100"
                  }`
                }
              >
                <m.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{m.label}</span>
              </NavLink>
            ))}
          </nav>
          <button onClick={() => setEntered(false)} className="rounded-lg border border-brand-400/25 px-3 py-2 text-sm text-brand-100 hover:bg-brand-500/15">切换任务</button>
          <a href="/" className="rounded-lg border border-brand-400/25 px-3 py-2 text-sm text-brand-100 hover:bg-brand-500/15">资源库</a>
          <a href="/student" className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-ink-900 hover:bg-brand-400">学生端</a>
        </div>
      </header>

      <main className="scrollbar-thin flex-1 overflow-y-auto px-6 py-7">
        <Outlet />
      </main>
    </div>
  );
}
