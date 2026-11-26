import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { RADAR_DIMS } from "../../lib/learning";
import type { ClassAnalytics, StudentProfile } from "../../lib/types";
import { EChart, dark } from "../../components/EChart";
import { AvatarGlyph, Bar, Card, LiveBadge, SectionTitle, Stat, Tag, type Tone } from "../../components/ui";
import { IconChart, IconIdea } from "../../components/icons";

const mean = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length));

function five(vals: number[]) {
  const s = [...vals].sort((a, b) => a - b);
  const q = (p: number) => {
    const i = (s.length - 1) * p;
    const lo = Math.floor(i), hi = Math.ceil(i);
    return s[lo] + (s[hi] - s[lo]) * (i - lo);
  };
  return [s[0], q(0.25), q(0.5), q(0.75), s[s.length - 1]].map(Math.round);
}

const COL = { pre: "#3a6ea5", mid: "#6c5b9e", post: "#2f876b", grow: "#a87b3a" };
const BAND_TONE: Record<StudentProfile["band"], Tone> = { 熟练掌握: "emerald", 基本掌握: "amber", 待达标: "rose" };

/* 五维能力雷达（纯 SVG，轻量） */
function Radar({ pre, post, maxW = 190 }: { pre: number[]; post: number[]; maxW?: number }) {
  const C = 70, R = 44;
  const pt = (i: number, v: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [C + Math.cos(a) * R * (v / 100), C + Math.sin(a) * R * (v / 100)];
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");
  const ring = (f: number) => poly([f * 100, f * 100, f * 100, f * 100, f * 100]);
  const SHORT = ["辨识", "决策", "创新", "动手", "合作"];
  return (
    <svg viewBox="0 0 140 140" style={{ maxWidth: maxW }} className="mx-auto w-full">
      {[0.33, 0.66, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="rgba(15,23,42,0.10)" strokeWidth="0.8" />
      ))}
      {Array.from({ length: 5 }, (_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="rgba(15,23,42,0.08)" strokeWidth="0.8" />;
      })}
      <polygon points={poly(pre)} fill="rgba(58,110,165,0.16)" stroke={COL.pre} strokeWidth="1.4" />
      <polygon points={poly(post)} fill="rgba(47,135,107,0.18)" stroke={COL.post} strokeWidth="1.4" />
      {SHORT.map((s, i) => {
        const [x, y] = pt(i, 122);
        return (
          <text key={s} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fill="#64748b">
            {s}
          </text>
        );
      })}
    </svg>
  );
}

/* 三阶段迷你条 */
function TriBar({ pre, mid, post }: { pre: number; mid: number; post: number }) {
  const row = (label: string, v: number, c: string) => (
    <div className="flex items-center gap-2">
      <span className="w-8 shrink-0 text-[11px] text-slate-400">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-900/8">
        <div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} />
      </div>
      <span className="w-7 shrink-0 text-right text-[11px] font-semibold tabular-nums text-slate-600">{v}</span>
    </div>
  );
  return (
    <div className="space-y-1.5">
      {row("课前", pre, COL.pre)}
      {row("课中", mid, COL.mid)}
      {row("课后", post, COL.post)}
    </div>
  );
}

function Kpi({ icon, label, value, tone }: { icon: string; label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-900/8 bg-slate-900/[0.03] px-4 py-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg" style={{ background: `${tone}22` }}>{icon}</span>
      <div className="min-w-0">
        <div className="truncate text-[11px] text-slate-400">{label}</div>
        <div className="text-lg font-extrabold tabular-nums text-slate-900">{value}</div>
      </div>
    </div>
  );
}

/* ===== 个人掌握率详情（全屏模态，可左右切换） ===== */
function StudentDetail({
  p, profiles, classAvg, onClose, onNav,
}: {
  p: StudentProfile;
  profiles: StudentProfile[];
  classAvg: { pre: number; mid: number; post: number; mastery: number };
  onClose: () => void;
  onNav: (dir: -1 | 1) => void;
}) {
  const idx = profiles.findIndex((x) => x.studentId === p.studentId);
  const bandTone = BAND_TONE[p.band];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        className="glass flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-900/10 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <AvatarGlyph glyph={p.avatar.glyph} from={p.avatar.from} to={p.avatar.to} size={54} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-xl font-extrabold text-slate-900">{p.name}</h2>
                <Tag tone={bandTone} className="!px-2 !py-0.5 text-xs">{p.band}</Tag>
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-[12px] text-slate-500">
                <span>{p.studentId}</span>
                <span className="font-mono">#{p.avatar.code}</span>
                <span>班级排名 <b className="text-slate-800">{p.rank}</b> / {p.total}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button onClick={() => onNav(-1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-900/15 text-slate-600 hover:bg-slate-900/10" title="上一位">‹</button>
            <span className="min-w-[52px] text-center text-xs tabular-nums text-slate-500">{idx + 1}/{profiles.length}</span>
            <button onClick={() => onNav(1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-900/15 text-slate-600 hover:bg-slate-900/10" title="下一位">›</button>
            <button onClick={onClose} className="ml-1 grid h-9 w-9 place-items-center rounded-lg border border-slate-900/15 text-slate-600 hover:bg-rose-500/15 hover:text-rose-600" title="关闭">✕</button>
          </div>
        </div>

        {/* 正文 */}
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {/* KPI 条 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi icon="🎯" label="总掌握率" value={`${p.mastery}%`} tone={COL.post} />
            <Kpi icon="📈" label="平均增值" value={`${p.growth >= 0 ? "+" : ""}${p.growth}`} tone={COL.grow} />
            <Kpi icon="✅" label="任务完成率" value={`${p.completion}%`} tone={COL.mid} />
            <Kpi icon="🗓️" label="出勤率" value={`${p.attendance}%`} tone={COL.pre} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {/* 左：雷达 + 五维 */}
            <div className="rounded-xl border border-slate-900/8 bg-slate-900/[0.02] p-5">
              <h3 className="mb-1 text-sm font-semibold text-slate-800">五维能力 · 课前 vs 课后</h3>
              <Radar pre={p.radarPre} post={p.radarPost} maxW={260} />
              <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full" style={{ background: COL.pre }} />课前</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full" style={{ background: COL.post }} />课后</span>
              </div>
              <div className="mt-4 space-y-1.5">
                {p.dims.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-[12px]">
                    <span className="w-24 shrink-0 text-slate-500">{d.name}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-900/8">
                      <div className="h-full rounded-full" style={{ width: `${d.post}%`, background: `linear-gradient(90deg, ${COL.pre}, ${COL.post})` }} />
                    </div>
                    <span className="w-6 text-right tabular-nums text-slate-500">{d.pre}</span>
                    <span className="text-slate-400">→</span>
                    <span className="w-6 text-right font-semibold tabular-nums text-slate-800">{d.post}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 右：8 任务三阶段 */}
            <div className="rounded-xl border border-slate-900/8 bg-slate-900/[0.02] p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">8 任务 · 课前→课中→课后 达标</h3>
              <div className="space-y-3.5">
                {p.tasks.map((t, i) => (
                  <div key={t.id} className="flex items-start gap-3">
                    <span className="chip-tone tone-cyan mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold">{t.id.replace("P", "").replace("T", "-")}</span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 truncate text-[12px] text-slate-600" title={t.title}>任务{i + 1} · {t.title}</div>
                      <TriBar pre={t.pre} mid={t.mid} post={t.post} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {/* 8 技能掌握 */}
            <div className="rounded-xl border border-slate-900/8 bg-slate-900/[0.02] p-5 lg:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">关键技能掌握度（课后测评）</h3>
              <div className="grid gap-x-5 gap-y-2.5 sm:grid-cols-2">
                {p.skills.map((s) => {
                  const c = s.score >= 80 ? COL.post : s.score >= 60 ? COL.grow : "#a8566e";
                  return (
                    <div key={s.name} className="flex items-center gap-2 text-[12px]">
                      <span className="w-24 shrink-0 truncate text-slate-500" title={s.name}>{s.name}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-900/8">
                        <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: c }} />
                      </div>
                      <span className="w-6 text-right font-semibold tabular-nums text-slate-700">{s.score}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 优劣势 + 学习档案 */}
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-slate-900/8 bg-slate-900/[0.02] p-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-800">学习档案</h3>
                <div className="space-y-1.5 text-[12px] text-slate-600">
                  <div className="flex justify-between"><span>课前均分</span><b className="tabular-nums text-slate-800">{p.preAvg}</b></div>
                  <div className="flex justify-between"><span>课后均分</span><b className="tabular-nums text-slate-800">{p.postAvg}</b></div>
                  <div className="flex justify-between"><span>班级课后均分</span><b className="tabular-nums text-slate-500">{classAvg.post}</b></div>
                  <div className="flex justify-between"><span>课堂互动</span><b className="tabular-nums text-slate-800">{p.interaction} 次</b></div>
                  <div className="flex justify-between"><span>作业提交</span><b className="tabular-nums text-slate-800">{p.homeworkDone}/8</b></div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-900/8 bg-slate-900/[0.02] p-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-800">优势 / 待提升</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.strengths.length ? p.strengths.map((x) => <Tag key={x} tone="emerald" className="!px-2 !py-0.5 text-xs">✦ {x}</Tag>) : <span className="text-xs text-slate-400">暂无突出项</span>}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {p.weaknesses.length ? p.weaknesses.map((x) => <Tag key={x} tone="amber" className="!px-2 !py-0.5 text-xs">△ {x}</Tag>) : <span className="text-xs text-slate-400">无明显短板</span>}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            数据由 8 任务 × 课前/课中/课后逐题测评聚合 · 头像为按学号确定性生成的图标 · 刷新不变、不使用照片
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsBoard() {
  const [data, setData] = useState<ClassAnalytics | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    api.getClassAnalytics().then(setData).catch(() => {});
  }, []);

  // 键盘：Esc 关闭 / ←→ 切换
  useEffect(() => {
    if (!data || !openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
      else if (e.key === "ArrowLeft") nav(-1);
      else if (e.key === "ArrowRight") nav(1);
    };
    const nav = (dir: -1 | 1) => {
      const ps = data!.profiles;
      const i = ps.findIndex((x) => x.studentId === openId);
      setOpenId(ps[(i + dir + ps.length) % ps.length].studentId);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, openId]);

  const barOpt = useMemo(() => data && dark({
    grid: { left: 40, right: 16, top: 36, bottom: 28 },
    xAxis: { type: "category", data: data.taskAvg.map((_, i) => `任务${i + 1}`) },
    yAxis: { type: "value", min: 50, max: 100 },
    series: [{
      type: "bar",
      data: data.taskAvg.map((t) => t.avg),
      barWidth: 26,
      itemStyle: { color: "#3a6ea5", borderRadius: [6, 6, 0, 0] },
      label: { show: true, position: "top", color: "#334155", fontWeight: 600 },
      markLine: {
        symbol: "none",
        data: [{ yAxis: 75, name: "达标线" }],
        lineStyle: { color: "#a8566e", type: "dashed" },
        label: { formatter: "达标线 75", color: "#a8566e", position: "insideEndTop" },
      },
    }],
  }), [data]);

  const boxOpt = useMemo(() => data && dark({
    grid: { left: 40, right: 16, top: 24, bottom: 64 },
    xAxis: { type: "category", data: data.skills.map((s) => s.name), axisLabel: { rotate: 32, fontSize: 10 } },
    yAxis: { type: "value", min: 80, max: 100 },
    series: [{
      type: "boxplot",
      data: data.skills.map((s) => five(s.values)),
      itemStyle: { color: "rgba(47,135,107,0.22)", borderColor: "#2f876b", borderWidth: 1.4 },
    }],
  }), [data]);

  const lineOpt = useMemo(() => data && dark({
    grid: { left: 40, right: 16, top: 36, bottom: 70 },
    legend: { data: ["课前平均", "课后平均"], top: 4 },
    xAxis: { type: "category", data: data.students.map((s) => s.name), axisLabel: { rotate: 60, fontSize: 9 } },
    yAxis: { type: "value", min: 80, max: 100 },
    series: [
      { name: "课前平均", type: "line", smooth: true, symbolSize: 4, data: data.students.map((s) => s.pre), lineStyle: { color: "#3a6ea5", width: 2 }, itemStyle: { color: "#3a6ea5" } },
      { name: "课后平均", type: "line", smooth: true, symbolSize: 4, data: data.students.map((s) => s.post), lineStyle: { color: "#a87b3a", width: 2 }, itemStyle: { color: "#a87b3a" } },
    ],
  }), [data]);

  if (!data) return <div className="grid min-h-[50vh] place-items-center text-sm text-slate-400">学情数据加载中…</div>;

  const preAvg = mean(data.students.map((s) => s.pre));
  const postAvg = mean(data.students.map((s) => s.post));
  const midAvg = mean(data.taskAvg.map((t) => t.mid));
  const masteryAvg = mean(data.profiles.map((p) => p.mastery));
  const openProfile = data.profiles.find((p) => p.studentId === openId) ?? null;
  const classAvg = { pre: preAvg, mid: midAvg, post: postAvg, mastery: masteryAvg };

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        icon={<IconChart className="h-6 w-6" />}
        title="学情分析"
        sub="任务达标 · 关键技能 · 个人增值 · 全过程数据 · 点击查看每人生成式画像"
        tone="rose"
        right={<LiveBadge label="演示数据 v1" />}
      />

      <Card className="flex flex-wrap items-center justify-around gap-4 px-6 py-5">
        <Stat value={data.students.length} label="班级人数" tone="blue" />
        <Stat value={preAvg} label="课前平均" tone="cyan" />
        <Stat value={midAvg} label="课中平均" tone="violet" />
        <Stat value={postAvg} label="课后平均" tone="emerald" />
        <Stat value={`+${postAvg - preAvg}`} label="平均增值" tone="amber" />
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-2 text-base font-semibold text-slate-800">任务知识平均达标情况</h3>
          {barOpt && <EChart option={barOpt} height={300} />}
        </Card>
        <Card className="p-5">
          <h3 className="mb-2 text-base font-semibold text-slate-800">任务关键技能掌握情况</h3>
          {boxOpt && <EChart option={boxOpt} height={300} />}
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-2 text-base font-semibold text-slate-800">个人成绩增值情况（课前 → 课后）</h3>
        {lineOpt && <EChart option={lineOpt} height={320} />}
      </Card>

      <SectionTitle
        icon={<IconIdea className="h-6 w-6" />}
        title="个人数字画像"
        sub="点击任一学生卡片展开详细掌握率分析 · 图标头像按学号确定性生成"
        tone="violet"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.profiles.map((p, i) => (
          <button
            key={p.studentId}
            onClick={() => setOpenId(p.studentId)}
            className={`glass tone-card tone-violet rise-${(i % 4) + 1} group flex flex-col rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10`}
          >
            <div className="mb-2 flex items-center gap-2.5">
              <AvatarGlyph glyph={p.avatar.glyph} from={p.avatar.from} to={p.avatar.to} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-slate-900">{p.name}</span>
                  <Tag tone={BAND_TONE[p.band]} className="!px-1.5 !py-0 text-[10px]">{p.band}</Tag>
                </div>
                <div className="text-[11px] text-slate-400">#{p.rank} · {p.studentId}</div>
              </div>
              <span className="grad-text text-xl font-extrabold tabular-nums">{p.mastery}</span>
            </div>
            <Radar pre={p.radarPre} post={p.radarPost} />
            <div className="mt-3 space-y-1.5">
              {p.knowledge.map((k) => (
                <div key={k.name} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 truncate text-[11px] text-slate-500" title={k.name}>{k.name}</span>
                  <div className="flex-1"><Bar value={k.score} color="#6c5b9e" height={6} /></div>
                  <span className="w-7 text-right text-[11px] font-semibold tabular-nums text-slate-700">{k.score}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-900/6 pt-2 text-[11px] text-slate-500">
              <span>课前 {p.preAvg} → 课后 <b className="text-slate-800">{p.postAvg}</b></span>
              <span className="font-semibold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">详情 ›</span>
            </div>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-slate-400">雷达维度：{RADAR_DIMS.join(" · ")}</p>

      {openProfile && (
        <StudentDetail
          p={openProfile}
          profiles={data.profiles}
          classAvg={classAvg}
          onClose={() => setOpenId(null)}
          onNav={(dir) => {
            const ps = data.profiles;
            const i = ps.findIndex((x) => x.studentId === openProfile.studentId);
            setOpenId(ps[(i + dir + ps.length) % ps.length].studentId);
          }}
        />
      )}
    </div>
  );
}
