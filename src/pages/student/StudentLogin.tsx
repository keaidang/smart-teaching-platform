import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStudent } from "../../lib/auth";
import { api } from "../../lib/api";
import type { Student } from "../../lib/types";
import { Avatar, Card } from "../../components/ui";

export default function StudentLogin() {
  const { setStudent } = useStudent();
  const nav = useNavigate();
  const [sid, setSid] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [list, setList] = useState<Student[]>([]);

  useEffect(() => {
    api.listStudents().then(setList).catch(() => setList([]));
  }, []);

  const doLogin = (id: string, nm: string) => {
    const s = list.find(
      (x) => x.id === id.trim().toUpperCase() && x.name === nm.trim()
    );
    if (!s) {
      setErr("学号与姓名不匹配，请核对后重试");
      return;
    }
    setStudent(s);
    nav("/student/preview");
  };

  return (
    <div className="animate-rise mx-auto max-w-md pt-6">
      <div className="mb-8 text-center">
        <div className="text-glow text-2xl font-bold tracking-widest text-brand-100">
          学生登录
        </div>
        <p className="mt-2 text-sm text-brand-200/70">
          AI数据服务资源库 · 计算机应用技术 2024 级 2 班
        </p>
      </div>

      <Card className="p-7">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-brand-200/80">学号</label>
            <input
              value={sid}
              onChange={(e) => {
                setSid(e.target.value);
                setErr("");
              }}
              placeholder="例如 S001"
              className="w-full rounded-xl border border-brand-400/25 bg-ink-900/50 px-4 py-3 text-white outline-none transition-colors placeholder:text-brand-200/40 focus:border-brand-400/60"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-brand-200/80">姓名</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && doLogin(sid, name)}
              placeholder="例如 陈嘉怡"
              className="w-full rounded-xl border border-brand-400/25 bg-ink-900/50 px-4 py-3 text-white outline-none transition-colors placeholder:text-brand-200/40 focus:border-brand-400/60"
            />
          </div>
        </div>
        {err && <p className="mt-3 text-sm text-rose-300">{err}</p>}

        <button
          onClick={() => doLogin(sid, name)}
          className="mt-5 w-full rounded-xl bg-brand-500 py-3.5 font-semibold text-ink-900 transition-colors hover:bg-brand-400"
        >
          登录系统
        </button>

        <div className="mt-6 border-t border-white/5 pt-5">
          <div className="mb-3 text-xs text-brand-200/60">
            演示：点击任一同学快速登录
          </div>
          <div className="grid max-h-52 grid-cols-3 gap-2 overflow-y-auto scrollbar-thin pr-1">
            {list.map((s) => (
              <button
                key={s.id}
                onClick={() => doLogin(s.id, s.name)}
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

      <div className="mt-6 text-center">
        <Link to="/" className="text-sm text-brand-200/60 transition-colors hover:text-brand-100">
          ← 返回资源库首页
        </Link>
      </div>
    </div>
  );
}
