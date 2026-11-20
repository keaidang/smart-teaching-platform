import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { ClassOverview, PreviewScore } from "../../lib/types";
import { GROUPS } from "../../lib/course";
import {
  IconBook,
  IconChart,
  IconIdea,
  IconTrophy,
  IconUpload,
  IconUsers,
} from "../../components/icons";
import { Avatar, Bar, Card, LiveBadge, SectionTitle, Tag, TONE_HEX, type Tone } from "../../components/ui";

const MODULE_CARDS: { title: string; sub: string; icon: typeof IconBook; to: string; tone: Tone }[] = [
  {
    title: "项目学习",
    sub: "数据生命周期实战",
    icon: IconBook,
    to: "/projects",
    tone: "blue",
  },
  {
    title: "产教融合",
    sub: "行业场景案例",
    icon: IconIdea,
    to: "/industry",
    tone: "amber",
  },
  {
    title: "教学评价",
    sub: "达成度看板",
    icon: IconChart,
    to: "/evaluation",
    tone: "emerald",
  },
];

const TECH_TAGS: { name: string; tone: Tone }[] = [
  { name: "Python", tone: "cyan" },
  { name: "PySerial", tone: "blue" },
  { name: "Requests", tone: "violet" },
  { name: "BeautifulSoup", tone: "emerald" },
  { name: "Pandas", tone: "amber" },
  { name: "NumPy", tone: "rose" },
  { name: "Kepler.gl", tone: "orange" },
  { name: "ECharts", tone: "cyan" },
];

const GROUP_TONES: Tone[] = ["cyan", "blue", "violet", "emerald", "amber", "rose", "orange"];

export default function DisplayHome() {
  const [ov, setOv] = useState<ClassOverview | null>(null);
  const [scores, setScores] = useState<PreviewScore[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [o, s] = await Promise.all([
        api.getOverview(),
        api.getPreviewScores(),
      ]);
      if (!alive) return;
      setOv(o);
      setScores(s);
    };
    load();
    const t = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!ov)
    return (
      <div className="grid h-full place-items-center text-slate-500">
        正在连接课堂数据…
      </div>
    );

  const stats: { label: string; value: string; icon: typeof IconUsers; tone: Tone }[] = [
    { label: "在线学生", value: `${ov.onlineCount}/${ov.studentCount}`, icon: IconUsers, tone: "cyan" },
    { label: "预习完成", value: `${ov.previewDone} 人`, icon: IconTrophy, tone: "emerald" },
    { label: "作业已交", value: `${ov.homeworkSubmitted} 份`, icon: IconUpload, tone: "amber" },
    { label: "习题均分", value: `${ov.exerciseAvg}`, icon: IconChart, tone: "violet" },
  ];

  const top = scores.slice(0, 6);

  // 课堂环节进度：全部由概览接口数据推导
  const progress = [
    { label: "预习完成率", value: ov.previewDone, max: ov.studentCount, tone: "cyan" as Tone, text: `${ov.previewDone}/${ov.studentCount} 人` },
    { label: "作业提交率", value: ov.homeworkSubmitted, max: ov.studentCount, tone: "amber" as Tone, text: `${ov.homeworkSubmitted}/${ov.studentCount} 份` },
    { label: "习题平均分", value: ov.exerciseAvg, max: 100, tone: "emerald" as Tone, text: `${ov.exerciseAvg} 分` },
  ];

  // 小组预习进度：由预习分数榜 + 固定分组推导
  const groupStats = GROUPS.map((g, i) => {
    const memberScores = g.memberIds
      .map((id) => scores.find((s) => s.studentId === id))
      .filter((s): s is PreviewScore => !!s);
    const done = memberScores.length;
    const avg = done
      ? Math.round(memberScores.reduce((a, b) => a + b.score, 0) / done)
      : 0;
    return { ...g, done, avg, tone: GROUP_TONES[i % GROUP_TONES.length] };
  });

  return (
    <div className="animate-rise space-y-7">
      {/* 顶部横幅 */}
      <div className="hero-mesh relative overflow-hidden rounded-2xl border border-slate-900/10 px-7 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Tag tone="cyan">{ov.className}</Tag>
              <span className="text-sm text-slate-500">教师实时大屏 · 课堂总览</span>
            </div>
            <h1 className="hero-title mt-2 text-3xl font-extrabold tracking-wide lg:text-4xl">
              {ov.sessionTitle}
            </h1>
          </div>
          <LiveBadge label="课堂直播中" />
        </div>
      </div>

      {/* 顶部统计卡 */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} tone={s.tone} hover className={`rise-${i + 1} p-5`}>
            <div className="flex items-center justify-between">
              <span className="icon-chip h-12 w-12 rounded-xl">
                <s.icon className="h-6 w-6" />
              </span>
              <span className="grad-text text-4xl font-extrabold tabular-nums">{s.value}</span>
            </div>
            <div className="mt-4 text-sm text-slate-500">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 资源库模块 + 课堂进度 */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <SectionTitle
              icon={<IconBook className="h-5 w-5" />}
              title="学习平台 · 数字评价"
              sub="AI数据服务资源库"
              tone="blue"
            />
            <div className="grid gap-5 sm:grid-cols-3">
              {MODULE_CARDS.map((c) => (
                <Link key={c.title} to={c.to}>
                  <Card tone={c.tone} hover className="h-full p-6">
                    <span className="icon-chip h-12 w-12 rounded-xl">
                      <c.icon className="h-6 w-6" />
                    </span>
                    <div className="mt-5 text-lg font-semibold text-slate-900">
                      {c.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{c.sub}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <Card tone="violet" className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">课堂环节进度</h3>
              <span className="text-xs text-slate-500">预习 → 作业 → 习题 · 实时汇总</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {progress.map((p) => (
                <div key={p.label} className={`tone-${p.tone} rounded-xl border bg-slate-900/[0.03] p-4`} style={{ borderColor: "var(--tone-line)" }}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-slate-600">{p.label}</span>
                    <span className="grad-text text-2xl font-extrabold tabular-nums">
                      {p.max ? Math.round((p.value / p.max) * 100) : 0}%
                    </span>
                  </div>
                  <div className="mt-3">
                    <Bar value={p.value} max={p.max || 1} color={TONE_HEX[p.tone]} height={10} />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">{p.text}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">数据采集技术资源库</h3>
              <span className="text-xs text-slate-500">采集与可视化工具</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {TECH_TAGS.map((t) => (
                <Tag key={t.name} tone={t.tone} className="px-4 py-2">{t.name}</Tag>
              ))}
            </div>
          </Card>
        </div>

        {/* 预习实时榜 + 小组进度 */}
        <div className="space-y-6">
          <div>
            <SectionTitle
              icon={<IconTrophy className="h-5 w-5" />}
              title="预习实时榜"
              tone="cyan"
            />
            <Card tone="cyan" className="divide-y divide-slate-900/5">
              {top.map((s, i) => (
                <div key={s.studentId} className="flex items-center gap-3 p-4">
                  <span
                    className={`w-6 text-center text-lg font-bold ${
                      i < 3 ? "text-amber-600" : "text-slate-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Avatar name={s.name} color={["#22d3ee", "#34d399", "#a78bfa"][i % 3]} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {s.name}
                    </div>
                    <Bar value={s.score} height={6} />
                  </div>
                  <span className="text-lg font-bold text-cyan-600">
                    {s.score}
                  </span>
                </div>
              ))}
            </Card>
            <Link
              to="/class/preview"
              className="tone-cyan mt-3 block rounded-xl border py-3 text-center text-sm font-medium transition-colors hover:bg-slate-900/5"
              style={{ borderColor: "var(--tone-line)", color: "var(--tone)" }}
            >
              查看完整分数榜 →
            </Link>
          </div>

          <div>
            <SectionTitle
              icon={<IconUsers className="h-5 w-5" />}
              title="小组预习进度"
              sub="按小组汇总预习提交与均分"
              tone="emerald"
            />
            <Card className="space-y-3 p-5">
              {groupStats.map((g) => (
                <div key={g.id} className={`tone-${g.tone} flex items-center gap-3`}>
                  <span className="chip-tone w-16 shrink-0 rounded-lg px-2 py-1 text-center text-xs font-semibold">
                    {g.name}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Bar value={g.done} max={g.memberIds.length} color={TONE_HEX[g.tone]} height={8} />
                  </div>
                  <span className="w-12 shrink-0 text-right text-xs tabular-nums text-slate-500">
                    {g.done}/{g.memberIds.length} 人
                  </span>
                  <span className="w-14 shrink-0 text-right text-sm font-bold tabular-nums" style={{ color: "var(--tone)" }}>
                    {g.done ? `${g.avg} 分` : "—"}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}