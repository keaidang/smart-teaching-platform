import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../../lib/auth";
import { api } from "../../lib/api";
import type { Student } from "../../lib/types";
import { Avatar, Card } from "../../components/ui";

export default function StudentLogin() {
  const { setStudent } = useStudent();
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [err, setErr] = useState("");
  const [list, setList] = useState<Student[]>([]);

  useEffect(() => {
    api.listStudents().then(setList).catch(() => setList([]));
  }, []);

  const doLogin = (studentId: string) => {
    const s = list.find((x) => x.id === studentId.trim().toUpperCase());
    if (!s) {
      setErr("未找到该学号，请检查后重试");
      return;
    }
    setStudent(s);
    nav("/preview");
  };

  return (
    <div className="animate-rise mx-auto max-w-md pt-6">
      <div className="mb-8 text-center">
        <div className="text-glow text-2xl font-bold tracking-widest text-brand-100">
          智绘强国 · 智慧教学平台
        </div>
        <p className="mt-2 text-sm text-brand-200/70">
          输入学号进入课堂 · 数字媒体 2401 班
        </p>
      </div>

      <Card className="p-7">
        <label className="mb-2 block text-sm text-brand-200/80">学号</label>
        <div className="flex gap-3">
          <input
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setErr("");
            }}
            onKeyDown={(e) => e.key === "Enter" && doLogin(id)}
            placeholder="例如 S001"
            className="min-w-0 flex-1 rounded-xl border border-brand-400/25 bg-ink-900/50 px-4 py-3 text-white outline-none transition-colors placeholder:text-brand-200/40 focus:border-brand-400/60"
          />
          <button
            onClick={() => doLogin(id)}
            className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-ink-900 transition-colors hover:bg-brand-400"
          >
            进入
          </button>
        </div>
        {err && <p className="mt-3 text-sm text-rose-300">{err}</p>}

        <div className="mt-6 border-t border-white/5 pt-5">
          <div className="mb-3 text-xs text-brand-200/60">
            演示：点击任一同学快速登录
          </div>
          <div className="grid max-h-52 grid-cols-3 gap-2 overflow-y-auto scrollbar-thin pr-1">
            {list.map((s) => (
              <button
                key={s.id}
                onClick={() => doLogin(s.id)}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-2 py-2 text-left transition-colors hover:border-brand-400/40 hover:bg-brand-500/10"
              >
                <Avatar name={s.name} color={s.avatarColor} size={28} />
                <div className="min-w-0">
                  <div className="truncate text-xs text-white">{s.name}</div>
                  <div className="text-[10px] text-brand-200/50">{s.id}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-brand-200/40">
        无服务器架构 · EdgeOne Functions + 阿里云 RDS + WebDAV
      </p>
    </div>
  );
}
