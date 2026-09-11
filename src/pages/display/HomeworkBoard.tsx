import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Homework, HomeworkSubmission, Student } from "../../lib/types";
import { IconCheck, IconClock, IconUpload } from "../../components/icons";
import { Avatar, Bar, Card, LiveBadge, SectionTitle } from "../../components/ui";

function fmtSize(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default function HomeworkBoard() {
  const [hw, setHw] = useState<Homework | null>(null);
  const [subs, setSubs] = useState<HomeworkSubmission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [h, s, st] = await Promise.all([
        api.getHomework(),
        api.getHomeworkSubmissions(),
        api.listStudents(),
      ]);
      if (!alive) return;
      setHw(h[0] ?? null);
      setSubs(s);
      setStudents(st);
    };
    load();
    const t = setInterval(load, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const total = students.length;
  const done = subs.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const submittedIds = new Set(subs.map((s) => s.studentId));

  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconUpload className="h-6 w-6" />}
        title="课中作业 · 提交进度墙"
        sub={hw ? "作品图片存储于 EdgeOne Blob · 元数据入 KV" : ""}
        right={<LiveBadge />}
      />

      {hw && (
        <Card className="mb-6 flex flex-col gap-5 p-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-white">{hw.title}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-1 text-xs text-rose-300">
                <IconClock className="h-3.5 w-3.5" /> 截止 {hw.deadline}
              </span>
            </div>
            <p className="mt-2 text-sm text-brand-200/70">{hw.description}</p>
          </div>
          <div className="w-full lg:w-72">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-brand-200/70">提交进度</span>
              <span className="font-semibold text-brand-100">
                {done}/{total} · {pct}%
              </span>
            </div>
            <Bar value={pct} height={12} color="#34d399" />
          </div>
        </Card>
      )}

      {/* 提交墙 */}
      <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-8">
        {students.map((s) => {
          const sub = subs.find((x) => x.studentId === s.id);
          const ok = submittedIds.has(s.id);
          return (
            <div
              key={s.id}
              className={`glass flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                ok ? "ring-1 ring-emerald-400/40" : "opacity-60"
              }`}
            >
              <div className="relative">
                {sub && sub.contentType?.startsWith("image/") ? (
                  <img
                    src={`/api/homework/file?sid=${s.id}`}
                    alt={s.name}
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-brand-400/30"
                  />
                ) : (
                  <Avatar name={s.name} color={s.avatarColor} size={44} />
                )}
                {ok && (
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-400 text-ink-900">
                    <IconCheck className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div className="mt-2 truncate text-xs text-white">{s.name}</div>
              <div className="mt-0.5 text-[10px] text-brand-200/50">
                {sub ? fmtSize(sub.size) : "未提交"}
              </div>
            </div>
          );
        })}
      </div>

      {/* 最近提交列表 */}
      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-white/5 px-5 py-3 text-sm font-semibold text-white">
          最近提交
        </div>
        <div className="divide-y divide-white/5">
          {[...subs]
            .reverse()
            .slice(0, 6)
            .map((s) => (
              <div key={s.studentId} className="flex items-center gap-4 px-5 py-3">
                {s.contentType?.startsWith("image/") ? (
                  <img
                    src={`/api/homework/file?sid=${s.studentId}`}
                    alt={s.fileName}
                    className="h-9 w-9 rounded-lg object-cover"
                  />
                ) : (
                  <Avatar name={s.name} color="#22d3ee" size={32} />
                )}
                <span className="w-20 text-sm text-white">{s.name}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-brand-200/70">
                  {s.fileName}
                </span>
                <span className="text-xs text-brand-200/50">
                  {fmtSize(s.size)}
                </span>
                <span className="w-16 text-right text-xs text-brand-200/50">
                  {s.submittedAt}
                </span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
