import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  IconBoard,
  IconChart,
  IconTrophy,
  IconUpload,
} from "../../components/icons";
import { LiveBadge, Tag, type Tone } from "../../components/ui";
import { ThemeToggle } from "../../components/ThemeToggle";
import { PROJECTS, ACTIVE_TASK_ID, findTask, isTaskHomework } from "../../lib/course";

const MODULES: { to: string; label: string; icon: typeof IconBoard; tone: Tone }[] = [
  { to: "/class", label: "课堂总览", icon: IconBoard, tone: "violet" },
  { to: "/class/analytics", label: "学情分析", icon: IconChart, tone: "rose" },
  { to: "/class/preview", label: "课前预习 · 分数榜", icon: IconTrophy, tone: "cyan" },
  { to: "/class/homework", label: "课中作业 · 提交墙", icon: IconUpload, tone: "amber" },
  { to: "/class/exercise", label: "课后习题 · 统计", icon: IconChart, tone: "emerald" },
];

const PROJECT_TONES: Record<string, Tone> = { P1: "cyan", P2: "emerald", P3: "violet", P4: "rose" };

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="hidden items-center gap-2 rounded-lg border border-slate-900/10 bg-slate-900/5 px-3 py-1.5 font-mono text-sm tabular-nums text-slate-700 md:inline-flex">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
      {now.toLocaleTimeString("zh-CN", { hour12: false })}
    </span>
  );
}

export default function DisplayLayout() {
  const nav = useNavigate();
  const location = useLocation();
  // 当前展示的任务：URL 带任务级作业 id（P4T1/P4T2）且在作业墙 → 该任务作业墙；否则 P1T2 主线
  const urlTask = new URLSearchParams(location.search).get("task") || "";
  const showingTaskHw = isTaskHomework(urlTask) && location.pathname.startsWith("/class/homework");
  const onAnalytics = location.pathname.startsWith("/class/analytics");
  // 直接从任务详情页点「后台大屏」（/class/homework?task=P4T1|P4T2）时跳过选择页
  const [entered, setEntered] = useState(() => showingTaskHw);

  const choose = (id: string) => {
    // P1T2 = 主线大屏；任务级作业（P4T1/P4T2）= 直达作业墙；其余暂不开放
    if (id !== ACTIVE_TASK_ID && !isTaskHomework(id)) return;
    if (id === ACTIVE_TASK_ID) {
      nav("/class");
      setEntered(true);
    } else {
      nav(`/class/homework?task=${id}`);
      setEntered(true);
    }
  };

  if (!entered && !onAnalytics) {
    return (
      <div className="relative grid min-h-screen place-items-center px-6 py-10">
        <div className="absolute right-5 top-5">
          <ThemeToggle variant="chip" />
        </div>
        <div className="w-full max-w-4xl animate-rise">
          <div className="hero-mesh mb-6 rounded-2xl border border-slate-900/10 px-7 py-8 text-center">
            <h1 className="hero-title text-3xl font-extrabold tracking-widest lg:text-4xl">
              后台大屏 · 选择课堂任务
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              选择课堂任务进入数据大屏 · 预习 / 作业 / 习题数据实时刷新
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Tag tone="cyan">预习分数榜</Tag>
              <Tag tone="amber">作业提交墙</Tag>
              <Tag tone="emerald">习题正确率</Tag>
              <Tag tone="violet">课堂总览</Tag>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {PROJECTS.map((p, pi) => {
              const tone = PROJECT_TONES[p.id] ?? "cyan";
              return (
                <div key={p.id} className={`tone-${tone} glass tone-card rise-${(pi % 4) + 1} rounded-2xl p-5`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="font-semibold text-slate-900">
                      <span className="grad-text mr-2 text-lg font-extrabold">{p.id}</span>
                      {p.title}
                    </div>
                    <span className="text-xs text-slate-500">{p.hours} 课时</span>
                  </div>
                  <div className="space-y-2">
                    {p.tasks.map((t) => {
                      const open = t.id === ACTIVE_TASK_ID || isTaskHomework(t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => choose(t.id)}
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                            open
                              ? "bg-slate-900/[0.04] text-slate-800 hover:bg-slate-900/[0.08]"
                              : "cursor-default border-slate-900/8 bg-slate-900/[0.02] text-slate-500"
                          }`}
                          style={open ? { borderColor: "var(--tone-line)" } : undefined}
                        >
                          <span className="truncate">{t.title}</span>
                          {open ? (
                            <span className="shrink-0 font-medium" style={{ color: "var(--tone)" }}>进入 →</span>
                          ) : (
                            <span className="shrink-0 text-xs text-slate-600">待开放</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-slate-500 transition-colors hover:text-slate-700">← 返回资源库首页</a>
          </div>
        </div>
      </div>
    );
  }

  const task = showingTaskHw ? findTask(urlTask) : findTask(ACTIVE_TASK_ID);
  const headerTone: Tone = showingTaskHw ? "amber" : "violet";

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/10 bg-surface/85 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className={`tone-${headerTone} icon-chip h-10 w-10 rounded-xl`}>
            <IconBoard className="h-5 w-5" />
          </span>
          <div>
            <div className="text-lg font-bold tracking-widest text-slate-900">后台大屏</div>
            <div className="text-[11px] tracking-wider text-slate-500">教师实时数据看板</div>
          </div>
          <span className={`tone-${headerTone} chip-tone rounded-full px-3 py-1 text-xs font-medium`}>
            {task?.task.title}
          </span>
          <LiveBadge />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="ghost" />
          <Clock />
          <nav className="mr-2 flex gap-1">
            {MODULES.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end={m.to === "/class"}
                className={({ isActive }) =>
                  `tone-${m.tone} flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "tone-card glass text-slate-900"
                      : "text-slate-500 hover:bg-slate-900/5 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <m.icon className="h-4 w-4" style={isActive ? { color: "var(--tone)" } : undefined} />
                    <span className="hidden lg:inline">{m.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <button onClick={() => setEntered(false)} className="rounded-lg border border-slate-900/15 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-900/10">切换任务</button>
          <a href="/" className="rounded-lg border border-slate-900/15 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-900/10">资源库</a>
          <a href="/student" className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:brightness-110">学生端</a>
        </div>
      </header>

      <main className="scrollbar-thin flex-1 overflow-y-auto px-6 py-7">
        <Outlet />
      </main>
    </div>
  );
}
