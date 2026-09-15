import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, homeworkFileUrl } from "../../lib/api";
import type { Homework, HomeworkSubmission, Student } from "../../lib/types";
import { IconCheck, IconClock, IconUpload } from "../../components/icons";
import { Avatar, Bar, Card, LiveBadge, SectionTitle } from "../../components/ui";

function fmtSize(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function Thumb({ sub, size = 56 }: { sub: HomeworkSubmission; size?: number }) {
  const [err, setErr] = useState(false);
  if (sub.contentType?.startsWith("image/") && !err) {
    return (
      <img
        // 缩略图 + v 版本参数（长缓存）；老提交无缩略图时服务端回退原图
        src={homeworkFileUrl(sub.studentId, sub.task, { thumb: true, v: sub.key })}
        alt={sub.fileName}
        loading="lazy"
        decoding="async"
        onError={() => setErr(true)}
        className="rounded-xl object-cover ring-1 ring-brand-400/30"
        style={{ width: size, height: size }}
      />
    );
  }
  return <Avatar name={sub.name} color="#22d3ee" size={size} />;
}

// 作业任务切换页签：两个任务的作业数据相互独立（P1T2 走旧键，任务级走 homework:sub:{task}:{学号}）
const HW_TABS = [
  { id: "", label: "P1T2 · 数据质检报告" },
  { id: "P4T1", label: "P4T1 · 社区物联感知看板" },
];

export default function HomeworkBoard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const task = searchParams.get("task") || "";
  const [hw, setHw] = useState<Homework | null>(null);
  const [subs, setSubs] = useState<HomeworkSubmission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [view, setView] = useState<HomeworkSubmission | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [h, s, st] = await Promise.all([
        api.getHomework(task || undefined),
        api.getHomeworkSubmissions(task || undefined),
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
  }, [task]);

  const total = students.length;
  const done = subs.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const subByStudent = new Map(subs.map((s) => [s.studentId, s]));

  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconUpload className="h-8 w-8" />}
        title="课中作业 · 提交进度墙"
        large
        right={<LiveBadge />}
      />

      {/* 任务切换页签（两任务作业相互独立） */}
      <div className="mb-5 flex gap-2">
        {HW_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSearchParams(t.id ? { task: t.id } : {})}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              task === t.id
                ? "bg-brand-500 text-ink-900"
                : "glass text-brand-200/70 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

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
          const sub = subByStudent.get(s.id);
          const ok = !!sub;
          return (
            <button
              key={s.id}
              disabled={!ok}
              onClick={() => ok && sub && setView(sub)}
              className={`glass flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                ok ? "ring-1 ring-emerald-400/40 hover:scale-[1.04] hover:ring-emerald-400/70" : "cursor-default opacity-60"
              }`}
            >
              <div className="relative">
                {sub ? <Thumb sub={sub} size={56} /> : <Avatar name={s.name} color={s.avatarColor} size={44} />}
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
            </button>
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
              <button
                key={s.studentId}
                onClick={() => setView(s)}
                className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-white/5"
              >
                <Thumb sub={s} size={36} />
                <span className="w-20 text-sm text-white">{s.name}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-brand-200/70">
                  {s.fileName}
                </span>
                <span className="text-xs text-brand-200/50">{fmtSize(s.size)}</span>
                <span className="w-16 text-right text-xs text-brand-200/50">{s.submittedAt}</span>
              </button>
            ))}
        </div>
      </Card>

      {/* 大图灯箱 */}
      {view && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setView(null)}
        >
          <div
            className="glass w-full max-w-4xl overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-white">{view.name}</div>
                <div className="truncate text-xs text-brand-200/60">
                  {view.fileName} · {fmtSize(view.size)} · {view.submittedAt}
                </div>
              </div>
              <button
                onClick={() => setView(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 text-brand-100 hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <div className="grid max-h-[72vh] place-items-center bg-ink-900/60 p-4">
              <img
                // 大图：按需加载原图（一次只打开一张）
                src={homeworkFileUrl(view.studentId, view.task, { v: view.key })}
                alt={view.fileName}
                decoding="async"
                className="max-h-[64vh] w-auto max-w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
