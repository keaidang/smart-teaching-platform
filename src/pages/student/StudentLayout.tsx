import { useEffect } from "react";
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

const TABS = [
  { to: "/student/preview", label: "课前预习", icon: IconTrophy },
  { to: "/student/homework", label: "提交作业", icon: IconUpload },
  { to: "/student/exercise", label: "课后知识点问答", icon: IconChart },
  { to: "/student/ai", label: "AI 问答", icon: IconCpu },
];

export default function StudentLayout() {
  const { student, setStudent } = useStudent();
  const nav = useNavigate();

  useEffect(() => {
    if (!student) return;
    const ping = () => api.pingPresence(student.id).catch(() => {});
    ping();
    const t = setInterval(ping, 20000);
    const onVis = () => { if (!document.hidden) ping(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [student?.id]);

  const logout = () => {
    setStudent(null);
    nav("/student");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-400/15 bg-ink-900/50 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-glow text-lg font-bold tracking-widest text-brand-100">
            AI数据服务 · 学生端
          </span>
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
