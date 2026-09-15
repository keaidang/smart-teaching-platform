import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useStudent } from "../../lib/auth";
import { api } from "../../lib/api";
import {
  IconLogout,
  IconTrophy,
  IconUpload,
  IconChart,
  IconCpu,
} from "../../components/icons";
import { Avatar } from "../../components/ui";
import { PROJECTS, ACTIVE_TASK_ID, findTask } from "../../lib/course";

const TABS = [
  { to: "/student/preview", label: "课前预习", icon: IconTrophy },
  { to: "/student/homework", label: "提交作业", icon: IconUpload },
  { to: "/student/exercise", label: "课后知识点问答", icon: IconChart },
  { to: "/student/ai", label: "AI 问答", icon: IconCpu },
];

const TASK_KEY = "stp.taskChosen";

export default function StudentLayout() {
  const { student, setStudent } = useStudent();
  const nav = useNavigate();
  const [taskChosen, setTaskChosen] = useState(() => sessionStorage.getItem(TASK_KEY) === ACTIVE_TASK_ID);

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
    if (id !== ACTIVE_TASK_ID) return;
    sessionStorage.setItem(TASK_KEY, id);
    setTaskChosen(true);
    nav("/student/preview");
  };

  // 登录后先选任务（仅「人脸特征底库建设与交付」开放）
  if (student && !taskChosen) {
    return (
      <div className="grid min-h-screen place-items-center px-6 py-10">
        <div className="w-full max-w-3xl animate-rise">
          <div className="mb-6 text-center">
            <div className="text-glow text-2xl font-bold tracking-widest text-brand-100">选择课堂任务</div>
            <p className="mt-2 text-sm text-brand-200/60">
              {student.name}，选择课堂任务开始学习
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {PROJECTS.map((p, pi) => (
              <div key={p.id} className="glass rounded-2xl p-5">
                <div className="mb-3 font-semibold text-white">{pi + 1}. {p.title}</div>
                <div className="space-y-2">
                  {p.tasks.map((t) => {
                    return (
                      <button
                        key={t.id}
                        onClick={() => choose(t.id)}
                        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-brand-100 transition-colors hover:border-brand-400/50 hover:bg-brand-500/15"
                      >
                        <span className="truncate">{t.title}</span>
                        <span className="text-brand-300">进入 →</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button onClick={logout} className="text-sm text-brand-200/60 hover:text-brand-100">← 退出登录</button>
          </div>
        </div>
      </div>
    );
  }

  const task = findTask(ACTIVE_TASK_ID);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-400/15 bg-ink-900/50 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-glow text-lg font-bold tracking-widest text-brand-100">
            数智社区 · 学生端
          </span>
          {taskChosen && (
            <span className="hidden rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300 sm:inline">
              {task?.task.title}
            </span>
          )}
        </div>
        {student && (
          <div className="flex items-center gap-3">
            <Avatar name={student.name} color={student.avatarColor} size={34} />
            <div className="text-sm">
              <div className="font-medium text-white">{student.name}</div>
              <div className="text-xs text-brand-200/60">{student.id}</div>
            </div>
            <button
              onClick={logout}
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-brand-400/25 px-3 py-1.5 text-sm text-brand-100 transition-colors hover:bg-rose-500/15 hover:text-rose-200"
            >
              <IconLogout className="h-4 w-4" /> 退出
            </button>
          </div>
        )}
      </header>

      {student && (
        <nav className="flex gap-2 border-b border-white/5 px-6 py-3">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500/20 text-brand-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]"
                    : "text-brand-200/70 hover:bg-white/5 hover:text-brand-100"
                }`
              }
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </NavLink>
          ))}
        </nav>
      )}

      <main className="scrollbar-thin mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
