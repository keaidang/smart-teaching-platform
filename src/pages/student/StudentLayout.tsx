import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStudent } from "../../lib/auth";
import { api } from "../../lib/api";
import {
  IconLogout,
  IconTrophy,
  IconUpload,
  IconChart,
  IconCpu,
  IconClock,
  IconGauge,
} from "../../components/icons";
import { Avatar, Card, Tag, type Tone } from "../../components/ui";
import { Logo } from "../../components/Logo";
import { ThemeToggle } from "../../components/ThemeToggle";
import { PROJECTS, ACTIVE_TASK_ID, findTask, isTaskHomework } from "../../lib/course";

const TABS: { to: string; label: string; icon: typeof IconTrophy; tone: Tone }[] = [
  { to: "/student/tests", label: "任务测评", icon: IconGauge, tone: "blue" },
  { to: "/student/preview", label: "课前预习", icon: IconTrophy, tone: "cyan" },
  { to: "/student/homework", label: "提交作业", icon: IconUpload, tone: "amber" },
  { to: "/student/exercise", label: "课后知识点问答", icon: IconChart, tone: "emerald" },
  { to: "/student/ai", label: "AI 问答", icon: IconCpu, tone: "violet" },
];

const PROJECT_TONES: Record<string, Tone> = { P1: "cyan", P2: "emerald", P3: "violet", P4: "rose" };

const TASK_HINTS: Record<string, string> = {
  [ACTIVE_TASK_ID]: "主线任务 · 预习 → 作业 → 习题 → AI 助学全套",
  P4T1: "任务级作业 · 进入后直达提交页",
  P4T2: "任务级作业 · 进入后直达提交页",
};

const isOpenTask = (id: string) => id === ACTIVE_TASK_ID || isTaskHomework(id);

const TASK_KEY = "stp.taskChosen";

export default function StudentLayout() {
  const { student, setStudent } = useStudent();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const onTests = pathname.startsWith("/student/tests");
  // 已选任务：P1T2（主线，值 = ACTIVE_TASK_ID）或 P4T1（任务级作业）；空 = 未选
  const [chosen, setChosen] = useState(() => sessionStorage.getItem(TASK_KEY) || "");
  const taskChosen = !!chosen;

  useEffect(() => {
    if (!student || !taskChosen) return;
    const ping = () => api.pingPresence(student.id).catch(() => {});
    ping();
    const t = setInterval(ping, 20000);
    const onVis = () => { if (!document.hidden) ping(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [student?.id, taskChosen]);

  const logout = () => {
    if (student) api.studentLogout(student.id).catch(() => {});
    setStudent(null);
    sessionStorage.removeItem(TASK_KEY);
    nav("/student");
  };

  const choose = (id: string) => {
    // P1T2 = 主线任务（预习/作业/问答全套）；任务级作业（P4T1/P4T2）直达提交页；其余暂不开放学生端
    if (id !== ACTIVE_TASK_ID && !isTaskHomework(id)) return;
    sessionStorage.setItem(TASK_KEY, id);
    setChosen(id);
    nav(id === ACTIVE_TASK_ID ? "/student/preview" : `/student/homework?task=${id}`);
  };

  // 登录后先选任务（P1T2 主线 + P4T1 看板作业开放）；任务测评页自带 8 任务选择，不受门槛限制
  if (student && !taskChosen && !onTests) {
    return (
      <div className="relative grid min-h-screen place-items-center px-6 py-10">
        <div className="absolute right-5 top-5">
          <ThemeToggle variant="chip" />
        </div>
        <div className="w-full max-w-4xl">
          <div className="hero-mesh tone-blue animate-rise relative mb-6 overflow-hidden rounded-2xl border border-slate-900/10 px-7 py-8 text-center">
            <h1 className="grad-text text-3xl font-extrabold tracking-wide">选择课堂任务</h1>
            <p className="mt-2 text-base text-slate-600">
              {student.name}，选择今天的课堂任务，开始挑战吧！
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Tag tone="cyan">主线任务 P1T2 · 全套学习流程</Tag>
              <Tag tone="rose">任务级作业 P4T1 / P4T2 · 直达提交</Tag>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {PROJECTS.map((p, pi) => {
              const tone = PROJECT_TONES[p.id] ?? "blue";
              const openCount = p.tasks.filter((t) => isOpenTask(t.id)).length;
              return (
                <Card key={p.id} tone={tone} className={`rise-${(pi % 4) + 1} p-6`}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`tone-${tone} grad-text text-2xl font-extrabold`}>{p.id}</span>
                      <span className="text-lg font-semibold leading-snug text-slate-900">{p.title}</span>
                    </div>
                    {openCount > 0 ? (
                      <Tag tone={tone}>{openCount} 个开放</Tag>
                    ) : (
                      <Tag tone="amber" className="opacity-70">待开放</Tag>
                    )}
                  </div>
                  <div className="mb-4 flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><IconClock className="h-4 w-4" />{p.hours} 课时</span>
                    <span>{p.tasks.length} 个任务</span>
                  </div>
                  <div className="space-y-2.5">
                    {p.tasks.map((t) => {
                      const open = isOpenTask(t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => choose(t.id)}
                          className={`tone-${tone} group flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                            open
                              ? "bg-slate-900/[0.04] hover:bg-slate-900/[0.08]"
                              : "border-slate-900/10 bg-slate-900/[0.02] opacity-60"
                          }`}
                          style={open ? { borderColor: "var(--tone-line)" } : undefined}
                        >
                          <span className="min-w-0">
                            <span className={`block truncate text-base ${open ? "text-slate-900" : "text-slate-500"}`}>
                              {t.title}
                            </span>
                            {open && TASK_HINTS[t.id] && (
                              <span className="mt-0.5 block truncate text-xs text-slate-500">{TASK_HINTS[t.id]}</span>
                            )}
                          </span>
                          <span
                            className={`shrink-0 text-sm font-medium ${open ? "" : "text-slate-500"}`}
                            style={open ? { color: "var(--tone)" } : undefined}
                          >
                            {open ? "开始挑战 →" : "待开放"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-6">
            <button onClick={() => nav("/student/tests")} className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
              进入任务测评（8 任务 × 课前/课中/课后）→
            </button>
            <button onClick={logout} className="text-sm text-slate-500 transition-colors hover:text-slate-600">
              ← 退出登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  const task = findTask(chosen || ACTIVE_TASK_ID);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-900/10 bg-surface/85 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Logo size={30} />
          <span className="hero-title text-lg font-bold tracking-widest">
            数智社区 · 学生端
          </span>
          {taskChosen && (
            <span className="chip-tone tone-cyan hidden rounded-full px-3 py-1 text-xs font-medium sm:inline">
              {task?.task.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle variant="ghost" />
          {student && (
            <>
              <Avatar name={student.name} color={student.avatarColor} size={34} />
              <div className="text-sm">
                <div className="font-medium text-slate-900">{student.name}</div>
                <div className="text-xs text-slate-500">{student.id}</div>
              </div>
              <button
                onClick={logout}
                className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-900/15 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-rose-400/40 hover:bg-rose-500/15 hover:text-rose-600"
              >
                <IconLogout className="h-4 w-4" /> 退出
              </button>
            </>
          )}
        </div>
      </header>

      {student && (
        <nav className="flex gap-2 border-b border-slate-900/5 px-6 py-3">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to === "/student/homework" && isTaskHomework(chosen) ? `/student/homework?task=${chosen}` : t.to}
              className={({ isActive }) =>
                `tone-${t.tone} inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "chip-tone font-semibold"
                    : "text-slate-500 hover:bg-slate-900/5 hover:text-slate-900"
                }`
              }
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </NavLink>
          ))}
        </nav>
      )}

      <main className={`scrollbar-thin mx-auto w-full flex-1 px-6 py-8 ${onTests ? "max-w-6xl" : "max-w-4xl"}`}>
        <Outlet />
      </main>
    </div>
  );
}