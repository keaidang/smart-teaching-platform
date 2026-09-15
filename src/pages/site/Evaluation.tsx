import { useEffect, useMemo, useState } from "react";
import { EChart, dark } from "../../components/EChart";
import { buildEvalData, DIM, COL, pct } from "../../lib/evalModel";
import { PROJECTS, GROUPS, groupMemberNames } from "../../lib/course";
import { api } from "../../lib/api";
import type { EvalKind, GroupEval } from "../../lib/types";
import { Card } from "../../components/ui";
import { IconGauge } from "../../components/icons";

// 评价区顶层模块：三类小组打分 + 原达成度看板
const AREA_TABS: { id: EvalKind | "dashboard"; label: string }[] = [
  { id: "teacher", label: "教师评价" },
  { id: "enterprise", label: "企业评价" },
  { id: "ai", label: "AI 工具测评" },
  { id: "dashboard", label: "达成度看板" },
];

const DASH_TABS = [
  { id: "overview", label: "① 课程总览" },
  { id: "lesson", label: "② 每堂课达成" },
  { id: "kp", label: "③ 知识点掌握" },
  { id: "student", label: "④ 学生画像" },
  { id: "value", label: "⑤ 增值与持续学习" },
];

export default function Evaluation() {
  const [area, setArea] = useState<EvalKind | "dashboard">("teacher");
  const [tab, setTab] = useState("overview");
  const D = useMemo(() => buildEvalData(), []);
  // 当前开课项目 = 已计算达成度的项目（项目一，L1/L2 已开展）；其余项目看板显示“未开始”
  const cur = D.projects.find((p) => p.achievement !== null) ?? D.projects[0];
  const avgVa = +(D.students.reduce((s, x) => s + x.valueAdded, 0) / D.students.length).toFixed(1);

  return (
    <div className="flex flex-1 flex-col animate-rise">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
            <IconGauge className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-white">教学评价资源区</h2>
            <p className="mt-0.5 text-sm text-brand-200/70">
              教师评价 · 企业评价 · AI 工具测评 · 达成度看板（26 人 · 6 小组 · 以小组为单位打分）
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {AREA_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setArea(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              area === t.id
                ? "bg-brand-500/20 text-brand-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]"
                : "text-brand-200/70 hover:bg-white/5 hover:text-brand-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {area !== "dashboard" && <GroupScorePanel kind={area} />}

      {area === "dashboard" && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">
              课程目标达成度看板 · 《{D.meta.course}》· {D.meta.className} · {D.students.length} 人
            </h3>
            <span className="rounded-full border border-brand-400/25 bg-brand-500/5 px-3 py-1 text-xs text-brand-200/70">
              {D.meta.model}
            </span>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {DASH_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-brand-500/20 text-brand-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]"
                    : "text-brand-200/70 hover:bg-white/5 hover:text-brand-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && <Overview D={D} cur={cur} avgVa={avgVa} />}
          {tab === "lesson" && <LessonView D={D} />}
          {tab === "kp" && <KpView D={D} />}
          {tab === "student" && <StudentView D={D} />}
          {tab === "value" && <ValueView D={D} />}

          <p className="mt-6 text-center text-xs text-brand-200/40">{D.meta.dataNote}</p>
        </>
      )}
    </div>
  );
}

// ---------- 小组打分面板（教师 / 企业 / AI 工具测评共用） ----------

const KIND_META: Record<EvalKind, { title: string; desc: string; placeholder: string }> = {
  teacher: {
    title: "教师评价",
    desc: "以小组为单位，对 4 个项目的课堂完成情况打分（0–100 分），不打分到个人。",
    placeholder: "该组本阶段表现、亮点与建议…",
  },
  enterprise: {
    title: "企业评价",
    desc: "以小组为单位，从企业交付验收视角对 4 个项目成果打分（0–100 分）。",
    placeholder: "对标企业交付验收标准的评价…",
  },
  ai: {
    title: "AI 工具测评",
    desc: "以小组为单位，测评课堂中学生使用 AI 工具与脚本的能力（0–100 分）。",
    placeholder: "AI 工具 / 脚本使用熟练度、提示词质量、结果校验意识…",
  },
};

function avgOfScores(scores: Record<string, number>) {
  const vals = PROJECTS.map((p) => scores[p.id] || 0).filter((v) => v > 0);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

function GroupScorePanel({ kind }: { kind: EvalKind }) {
  const meta = KIND_META[kind];
  const [evals, setEvals] = useState<GroupEval[]>([]);
  const [selId, setSelId] = useState(GROUPS[0].id);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    setSelId(GROUPS[0].id);
    setScores({});
    setComment("");
    api.getGroupEvals(kind).then((rows) => {
      if (!alive) return;
      setEvals(rows);
      const first = rows.find((r) => r.groupId === GROUPS[0].id);
      if (first) {
        setScores({ ...first.scores });
        setComment(first.comment || "");
      }
    });
    return () => { alive = false; };
  }, [kind]);

  const pick = (gid: string) => {
    setSelId(gid);
    setMsg("");
    const e = evals.find((r) => r.groupId === gid);
    setScores(e ? { ...e.scores } : {});
    setComment(e?.comment || "");
  };

  const group = GROUPS.find((g) => g.id === selId)!;
  const done = Object.values(scores).filter((v) => v > 0).length;

  const save = async () => {
    if (done === 0) { setMsg("请先为至少一个项目打分"); return; }
    setSaving(true);
    setMsg("");
    try {
      const saved = await api.saveGroupEval({ type: kind, groupId: group.id, name: group.name, scores, comment });
      setEvals((rows) => [...rows.filter((r) => r.groupId !== group.id), saved]);
      setMsg("已保存");
    } catch (e) {
      setMsg(`保存失败：${String((e as Error).message || e)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 小组选择 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {GROUPS.map((g) => {
          const ev = evals.find((r) => r.groupId === g.id);
          const on = g.id === selId;
          return (
            <button
              key={g.id}
              onClick={() => pick(g.id)}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                on
                  ? "border-brand-400/60 bg-brand-500/15 text-white"
                  : "border-white/10 bg-white/5 text-brand-100/80 hover:border-brand-400/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{g.name}</span>
                <span className="text-xs text-brand-200/50">{g.memberIds.length} 人</span>
              </div>
              <div className={`mt-1 text-xs ${ev ? "text-amber-300" : "text-brand-200/30"}`}>
                {ev ? `均分 ${avgOfScores(ev.scores)}` : "未评价"}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* 打分区 */}
        <Card className="p-6">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">{meta.title} · {group.name}</h3>
            <span className="rounded-full bg-brand-500/15 px-3 py-1 text-sm font-semibold text-brand-200">
              均分 {avgOfScores(scores)}
            </span>
          </div>
          <p className="mb-5 text-sm text-brand-200/70">{meta.desc}</p>
          <p className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs leading-relaxed text-brand-200/60">
            组员：{groupMemberNames(group).join("、")}
          </p>

          <div className="space-y-4">
            {PROJECTS.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-white">{p.title}</div>
                    <div className="text-xs text-brand-200/50">{p.id} · {p.hours} 课时</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={scores[p.id] || 0}
                      onChange={(e) => setScores({ ...scores, [p.id]: Number(e.target.value) })}
                      className="w-36 accent-cyan-400 sm:w-48"
                    />
                    <span className="w-12 text-right text-lg font-bold text-brand-200">{scores[p.id] || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-sm text-brand-200/70">评语</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={meta.placeholder}
              className="w-full resize-none rounded-xl border border-brand-400/25 bg-ink-900/50 px-4 py-3 text-sm text-white outline-none focus:border-brand-400/60"
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-brand-500 px-6 py-2.5 font-semibold text-ink-900 transition-colors hover:bg-brand-400 disabled:opacity-50"
            >
              {saving ? "保存中…" : `保存${meta.title}`}
            </button>
            <span className="text-xs text-brand-200/40">已打分 {done}/4 个项目</span>
            {msg && <span className={`text-sm ${msg === "已保存" ? "text-emerald-300" : "text-rose-300"}`}>{msg}</span>}
          </div>
        </Card>

        {/* 已评价汇总 */}
        <Card className="max-h-[70vh] overflow-y-auto p-4 scrollbar-thin">
          <div className="mb-2 px-2 text-sm font-medium text-brand-200/70">
            {meta.title}记录 · {evals.length}/{GROUPS.length} 组
          </div>
          {evals.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-brand-200/40">暂无评价，选择小组开始打分</div>
          )}
          <div className="space-y-2">
            {evals
              .slice()
              .sort((a, b) => avgOfScores(b.scores) - avgOfScores(a.scores))
              .map((ev) => (
                <button
                  key={ev.groupId}
                  onClick={() => pick(ev.groupId)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left transition-colors hover:border-brand-400/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{ev.name}</span>
                    <span className="text-sm font-bold text-amber-300">{avgOfScores(ev.scores)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {PROJECTS.map((p) => (
                      <span key={p.id} className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] text-brand-200/80">
                        {p.id} {ev.scores[p.id] || 0}
                      </span>
                    ))}
                  </div>
                  {ev.comment && <div className="mt-1 truncate text-xs text-brand-200/50">{ev.comment}</div>}
                </button>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

type D = ReturnType<typeof buildEvalData>;

function Kpi({ v, l, s, color }: { v: string; l: string; s?: string; color?: string }) {
  return (
    <Card className="p-5">
      <div className="text-3xl font-bold" style={{ color: color || "#fff" }}>{v}</div>
      <div className="mt-1 text-sm text-brand-200/70">{l}</div>
      {s && <div className="mt-0.5 text-xs text-brand-200/40">{s}</div>}
    </Card>
  );
}

function Overview({ D, cur, avgVa }: { D: D; cur: D["projects"][number]; avgVa: number }) {
  const tiers: Record<string, number> = {};
  D.students.forEach((s) => (tiers[s.tier] = (tiers[s.tier] || 0) + 1));
  const ca = cur.classAchieve!;
  // 未开课项目（achievement 为空）在图中显示“未开始”
  const pending = D.projects.map((p) => p.achievement == null);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <Kpi v={pct(cur.achievement!)} l="当前项目达成度" s={`${cur.name}（进行中）`} />
        <Kpi v={`${D.students.length}`} l="参评学生" s={`${tiers["基础层"] || 0}基础 / ${tiers["提高层"] || 0}提高 / ${tiers["拓展层"] || 0}拓展`} />
        <Kpi v={pct(ca.k)} l="知识维度达成" color={COL.k} s="懂采集原理" />
        <Kpi v={pct(ca.a)} l="能力维度达成" color={COL.a} s={`能多源融合 · 增值+${avgVa}`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h4 className="mb-2 font-semibold text-white">三维目标达成雷达</h4>
          <EChart height={320} option={dark({
            radar: { indicator: [{ name: "知识", max: 1 }, { name: "能力", max: 1 }, { name: "素养", max: 1 }], radius: "65%", axisName: { color: "rgba(207,250,254,0.8)" }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } }, splitArea: { areaStyle: { color: ["rgba(255,255,255,0.02)", "transparent"] } }, axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } } },
            series: [{ type: "radar", data: [{ value: [ca.k, ca.a, ca.q], areaStyle: { color: "rgba(34,211,238,0.25)" }, lineStyle: { color: COL.k }, itemStyle: { color: COL.k } }] }],
          })} />
        </Card>
        <Card className="p-6">
          <h4 className="mb-2 font-semibold text-white">四个项目达成度对标（课程共 30 学时）</h4>
          <EChart height={320} option={dark({
            grid: { left: 10, right: 20, top: 30, bottom: 40, containLabel: true },
            xAxis: { type: "category", data: D.projects.map((p) => p.name), axisLabel: { interval: 0, fontSize: 10 } },
            yAxis: { type: "value", max: 1, axisLabel: { formatter: (v: number) => v * 100 + "%" } },
            series: [{ type: "bar", barWidth: "46%", data: D.projects.map((p, i) => ({ value: p.achievement ?? 0, itemStyle: { color: pending[i] ? "rgba(148,163,184,0.15)" : "#22d3ee" } })), label: { show: true, position: "top", formatter: (p: any) => (pending[p.dataIndex] ? "未开始" : pct(p.value)), color: "#cffafe" } }],
          })} />
        </Card>
      </div>
      <Card className="p-6">
        <h4 className="mb-3 font-semibold text-white">课程三维目标与达成情况</h4>
        <div className="grid gap-6 md:grid-cols-3">
          {(["knowledge", "ability", "quality"] as const).map((dk) => {
            const cls = dk === "knowledge" ? "k" : dk === "ability" ? "a" : "q";
            const name = dk === "knowledge" ? "知识维度" : dk === "ability" ? "能力维度" : "素养维度";
            return (
              <div key={dk}>
                <div className="mb-2 font-semibold" style={{ color: COL[cls] }}>{name}（{pct((ca as any)[cls])}）</div>
                <ul className="space-y-1.5 text-sm text-brand-100/80">
                  {D.objectives[dk].map((t) => <li key={t} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: COL[cls] }} />{t}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function LessonView({ D }: { D: D }) {
  const [lid, setLid] = useState(D.lessons[0].id);
  const l = D.lessons.find((x) => x.id === lid)!;
  const avg = (k: "pre" | "mid" | "post") => D.students.reduce((s, x) => s + l.students[x.id][k], 0) / D.students.length;
  const kps = l.kpIds.map((id) => D.knowledgePoints.find((k) => k.id === id)!);
  const kpAvg = kps.map((kp) => +(D.students.reduce((a, s) => a + s.kpMastery[kp.id], 0) / D.students.length).toFixed(1));
  return (
    <div className="space-y-6">
      <div>
        <label className="mr-2 text-sm text-brand-200/70">选择课堂：</label>
        <select value={lid} onChange={(e) => setLid(e.target.value)} className="rounded-lg border border-brand-400/25 bg-ink-900/60 px-3 py-2 text-sm text-white outline-none">
          {D.lessons.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6"><h4 className="mb-2 font-semibold text-white">本堂课三维目标达成</h4>
          <EChart height={280} option={dark({
            radar: { indicator: [{ name: "知识", max: 1 }, { name: "能力", max: 1 }, { name: "素养", max: 1 }], radius: "70%", axisName: { color: "rgba(207,250,254,0.8)" }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } }, axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } } },
            series: [{ type: "radar", data: [{ value: [l.classAchieve.k, l.classAchieve.a, l.classAchieve.q], areaStyle: { color: "rgba(52,211,153,0.25)" }, lineStyle: { color: COL.a }, itemStyle: { color: COL.a } }] }],
          })} />
        </Card>
        <Card className="p-6"><h4 className="mb-2 font-semibold text-white">本堂课 课前/课中/课后 平均分</h4>
          <EChart height={280} option={dark({
            grid: { left: 10, right: 20, top: 20, bottom: 30, containLabel: true },
            xAxis: { type: "category", data: ["课前", "课中", "课后"] },
            yAxis: { type: "value", max: 100 },
            series: [{ type: "bar", barWidth: "42%", data: [avg("pre"), avg("mid"), avg("post")].map((v, i) => ({ value: +v.toFixed(1), itemStyle: { color: ["rgba(103,232,249,0.5)", COL.k, COL.a][i] } })), label: { show: true, position: "top", formatter: (p: any) => p.value.toFixed(1), color: "#cffafe" } }],
          })} />
        </Card>
      </div>
      <Card className="p-6"><h4 className="mb-2 font-semibold text-white">全班四堂课三维达成递进（增值性）</h4>
        <EChart height={320} option={dark({
          legend: { data: ["知识", "能力", "素养"] },
          grid: { left: 10, right: 20, top: 40, bottom: 40, containLabel: true },
          xAxis: { type: "category", boundaryGap: false, data: D.lessons.map((x) => x.name.replace(/任务\d+ /, "")) },
          yAxis: { type: "value", max: 1, min: 0.6, axisLabel: { formatter: (v: number) => v * 100 + "%" } },
          series: (["k", "a", "q"] as const).map((d) => ({ name: DIM[d], type: "line", smooth: true, data: D.lessons.map((x) => x.classAchieve[d]), lineStyle: { color: COL[d], width: 3 }, itemStyle: { color: COL[d] }, label: { show: true, formatter: (p: any) => pct(p.value), color: COL[d], fontSize: 11 } })),
        })} />
      </Card>
      <Card className="p-6"><h4 className="mb-2 font-semibold text-white">本堂课各知识点班级达成</h4>
        <EChart height={300} option={dark({
          grid: { left: 10, right: 20, top: 20, bottom: 80, containLabel: true },
          xAxis: { type: "category", data: kps.map((k) => k.name), axisLabel: { interval: 0, rotate: 32, fontSize: 11 } },
          yAxis: { type: "value", max: 100 },
          series: [{ type: "bar", barWidth: "52%", data: kpAvg.map((v) => ({ value: v, itemStyle: { color: v < 75 ? "#fbbf24" : v < 85 ? "#fde68a" : COL.a } })), label: { show: true, position: "top", color: "#cffafe" } }],
        })} />
      </Card>
    </div>
  );
}

function KpView({ D }: { D: D }) {
  const kps = D.knowledgePoints, stus = D.students;
  const data: [number, number, number][] = [];
  stus.forEach((s, yi) => kps.forEach((k, xi) => data.push([xi, yi, s.kpMastery[k.id]])));
  const avg = kps.map((k) => +(stus.reduce((a, s) => a + s.kpMastery[k.id], 0) / stus.length).toFixed(1));
  const weak = kps.map((k, i) => ({ name: k.name, v: avg[i] })).filter((x) => x.v < 75).sort((a, b) => a.v - b.v);
  return (
    <div className="space-y-6">
      <Card className="p-6"><h4 className="mb-2 font-semibold text-white">知识点掌握热力图（学生 × 知识点）</h4>
        <EChart height={560} option={dark({
          grid: { left: 70, right: 20, top: 30, bottom: 60, containLabel: true },
          xAxis: { type: "category", data: kps.map((k) => k.name), axisLabel: { interval: 0, rotate: 38, fontSize: 11 } },
          yAxis: { type: "category", data: stus.map((s) => s.name), axisLabel: { fontSize: 10 } },
          visualMap: { min: 40, max: 100, calculable: true, orient: "horizontal", left: "center", bottom: 10, inRange: { color: ["#d9534f", "#fbbf24", "#2e9e5b"] }, textStyle: { color: "rgba(207,250,254,0.7)" } },
          series: [{ type: "heatmap", data, emphasis: { itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.3)" } } }],
        })} />
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6"><h4 className="mb-2 font-semibold text-white">班级各知识点平均掌握度</h4>
          <EChart height={320} option={dark({
            grid: { left: 10, right: 20, top: 20, bottom: 90, containLabel: true },
            xAxis: { type: "category", data: kps.map((k) => k.name), axisLabel: { interval: 0, rotate: 34, fontSize: 11 } },
            yAxis: { type: "value", max: 100 },
            series: [{ type: "bar", barWidth: "55%", data: kps.map((_, i) => ({ value: avg[i], itemStyle: { color: avg[i] < 75 ? "#fbbf24" : avg[i] < 85 ? "#fde68a" : COL.a } })), label: { show: true, position: "top", color: "#cffafe" } }],
          })} />
        </Card>
        <Card className="p-6"><h4 className="mb-2 font-semibold text-white">薄弱知识点预警（班级均值 &lt; 75）</h4>
          <EChart height={320} option={dark({
            grid: { left: 10, right: 30, top: 20, bottom: 30, containLabel: true },
            xAxis: { type: "value", max: 100 },
            yAxis: { type: "category", data: weak.map((w) => w.name) },
            series: [{ type: "bar", barWidth: "55%", data: weak.map((w) => w.v), itemStyle: { color: "#f87171" }, label: { show: true, position: "right", color: "#fca5a5" } }],
          })} />
          {weak.length === 0 && <p className="mt-2 text-center text-sm text-emerald-300">无薄弱知识点，班级整体扎实</p>}
        </Card>
      </div>
    </div>
  );
}

function StudentView({ D }: { D: D }) {
  const [sid, setSid] = useState(D.students[0].id);
  const s = D.students.find((x) => x.id === sid)!;
  const dimAvg = { k: 0, a: 0, q: 0 };
  D.lessons.forEach((l) => { dimAvg.k += l.students[s.id].k; dimAvg.a += l.students[s.id].a; dimAvg.q += l.students[s.id].q; });
  (["k", "a", "q"] as const).forEach((d) => (dimAvg[d] = +(dimAvg[d] / D.lessons.length).toFixed(3)));
  const kps = D.knowledgePoints;
  const ph = { pre: [] as number[], mid: [] as number[], post: [] as number[] };
  D.lessons.forEach((l) => { ph.pre.push(l.students[s.id].pre); ph.mid.push(l.students[s.id].mid); ph.post.push(l.students[s.id].post); });
  const weakK = kps.filter((k) => s.kpMastery[k.id] < 75).map((k) => k.name);
  const totA = +((dimAvg.k + dimAvg.a + dimAvg.q) / 3).toFixed(3);
  const va = s.valueAdded;
  const vaWord = va >= 22 ? "提升显著" : va >= 14 ? "稳步提升" : va >= 8 ? "基本达标" : "提升不足，需重点帮扶";
  const tierWord = s.tier === "拓展层" ? "具备创新拓展能力，可承担复杂综合任务" : s.tier === "提高层" ? "具备多源集成能力，可向拓展任务进阶" : "需夯实基础模块，先达成本层目标再进阶";
  return (
    <div className="space-y-6">
      <div>
        <label className="mr-2 text-sm text-brand-200/70">选择学生：</label>
        <select value={sid} onChange={(e) => setSid(e.target.value)} className="rounded-lg border border-brand-400/25 bg-ink-900/60 px-3 py-2 text-sm text-white outline-none">
          {D.students.map((x) => <option key={x.id} value={x.id}>{x.name}（{x.tier}）</option>)}
        </select>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6"><h4 className="mb-2 font-semibold text-white">三维目标达成雷达</h4>
          <EChart height={280} option={dark({
            radar: { indicator: [{ name: "知识", max: 1 }, { name: "能力", max: 1 }, { name: "素养", max: 1 }], radius: "70%", axisName: { color: "rgba(207,250,254,0.8)" }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } }, axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } } },
            series: [{ type: "radar", data: [{ value: [dimAvg.k, dimAvg.a, dimAvg.q], areaStyle: { color: "rgba(251,191,36,0.25)" }, lineStyle: { color: COL.q }, itemStyle: { color: COL.q } }] }],
          })} />
        </Card>
        <Card className="p-6"><h4 className="mb-2 font-semibold text-white">知识点掌握度</h4>
          <EChart height={280} option={dark({
            grid: { left: 10, right: 20, top: 20, bottom: 90, containLabel: true },
            xAxis: { type: "category", data: kps.map((k) => k.name), axisLabel: { interval: 0, rotate: 36, fontSize: 10 } },
            yAxis: { type: "value", max: 100 },
            series: [{ type: "bar", barWidth: "55%", data: kps.map((k) => ({ value: s.kpMastery[k.id], itemStyle: { color: s.kpMastery[k.id] < 75 ? "#f87171" : s.kpMastery[k.id] < 85 ? "#fde68a" : COL.a } })) }],
          })} />
        </Card>
      </div>
      <Card className="p-6"><h4 className="mb-2 font-semibold text-white">课前 / 课中 / 课后 全过程表现</h4>
        <EChart height={280} option={dark({
          legend: { data: ["课前", "课中", "课后"] },
          grid: { left: 10, right: 20, top: 36, bottom: 30, containLabel: true },
          xAxis: { type: "category", data: D.lessons.map((l) => l.name.replace(/任务\d+ /, "")) },
          yAxis: { type: "value", max: 100 },
          series: [
            { name: "课前", type: "line", data: ph.pre, itemStyle: { color: "rgba(103,232,249,0.6)" } },
            { name: "课中", type: "line", data: ph.mid, itemStyle: { color: COL.k } },
            { name: "课后", type: "line", data: ph.post, itemStyle: { color: COL.a } },
          ],
        })} />
      </Card>
      <Card className="p-6">
        <h4 className="mb-3 font-semibold text-white">个性化诊断与学习建议</h4>
        <div className="space-y-3 text-sm leading-relaxed text-brand-100/85">
          <p><b className="text-brand-200">一、基本信息</b> 该生属于 <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-xs text-brand-100">{s.tier}</span>，项目综合达成度 <b className="text-brand-300">{pct(totA)}</b>，课前→课后增值 <b className="text-brand-300">+{va} 分</b>（{vaWord}）。</p>
          <p><b className="text-brand-200">二、三维目标达成</b> 知识 {pct(dimAvg.k)}、能力 {pct(dimAvg.a)}、素养 {pct(dimAvg.q)}。</p>
          <p><b className="text-brand-200">三、分层诊断</b> {tierWord}。</p>
          <p><b className="text-brand-200">四、薄弱知识点</b> {weakK.length ? weakK.join("、") : "无低于75分的薄弱知识点"}。</p>
          <p><b className="text-brand-200">五、学习建议</b> {weakK.length ? `建议围绕 ${weakK.slice(0, 3).join("、")} 等薄弱点回看微课、加练实操，并借助 AI 助学个性化补弱。` : "三维均衡扎实，建议进入拓展层创新任务并承担小组复盘示范。"}</p>
        </div>
      </Card>
    </div>
  );
}

function ValueView({ D }: { D: D }) {
  const stus = D.students;
  const preAvg = stus.map((s) => +(D.lessons.reduce((a, l) => a + l.students[s.id].pre, 0) / 4).toFixed(1));
  const postAvg = stus.map((s) => +(D.lessons.reduce((a, l) => a + l.students[s.id].post, 0) / 4).toFixed(1));
  const pts = stus.map((s, i) => [preAvg[i], postAvg[i], s.name]);
  const bins: [number, number][] = [[0, 8], [8, 14], [14, 22], [22, 40]];
  const labels = ["<8", "8–14", "14–22", "22+"];
  const cnt = bins.map((b) => stus.filter((s) => s.valueAdded >= b[0] && s.valueAdded < b[1]).length);
  const axis = D.lessons.map((l) => l.name.replace(/任务\d+ /, ""));
  const rep: Record<string, number[]> = {};
  ["基础层", "提高层", "拓展层"].forEach((t) => {
    const arr = stus.filter((s) => s.tier === t).map((s) => s.lessonTrend);
    rep[t] = axis.map((_, i) => +(arr.reduce((a, r) => a + r[i], 0) / arr.length).toFixed(3));
  });
  const classAvg = axis.map((_, i) => +(stus.reduce((a, s) => a + s.lessonTrend[i], 0) / stus.length).toFixed(3));
  const tierVa: Record<string, number> = {};
  ["基础层", "提高层", "拓展层"].forEach((t) => {
    const a = stus.filter((s) => s.tier === t).map((s) => s.valueAdded);
    tierVa[t] = +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  });
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6"><h4 className="mb-2 font-semibold text-white">全班 课前 vs 课后 得分对比</h4>
          <EChart height={320} option={dark({
            grid: { left: 10, right: 20, top: 30, bottom: 45, containLabel: true },
            xAxis: { type: "value", name: "课前", max: 100, min: 40 },
            yAxis: { type: "value", name: "课后", max: 100, min: 40 },
            series: [{ type: "scatter", data: pts, symbolSize: 11, itemStyle: { color: COL.k, opacity: 0.75 } }],
          })} />
        </Card>
        <Card className="p-6"><h4 className="mb-2 font-semibold text-white">增值（课后−课前）分布</h4>
          <EChart height={320} option={dark({
            grid: { left: 10, right: 20, top: 30, bottom: 35, containLabel: true },
            xAxis: { type: "category", data: labels },
            yAxis: { type: "value", name: "人数" },
            series: [{ type: "bar", barWidth: "55%", data: cnt, itemStyle: { color: COL.a }, label: { show: true, position: "top", color: "#cffafe" } }],
          })} />
        </Card>
      </div>
      <Card className="p-6"><h4 className="mb-2 font-semibold text-white">学生持续学习轨迹（四堂课综合达成）</h4>
        <EChart height={340} option={dark({
          legend: { data: ["基础层", "提高层", "拓展层", "全班均值"] },
          grid: { left: 10, right: 20, top: 40, bottom: 35, containLabel: true },
          xAxis: { type: "category", boundaryGap: false, data: axis },
          yAxis: { type: "value", max: 1, min: 0.6, axisLabel: { formatter: (v: number) => v * 100 + "%" } },
          series: [
            { name: "基础层", type: "line", smooth: true, data: rep["基础层"], lineStyle: { color: "rgba(103,232,249,0.6)" }, itemStyle: { color: "rgba(103,232,249,0.6)" } },
            { name: "提高层", type: "line", smooth: true, data: rep["提高层"], lineStyle: { color: COL.k }, itemStyle: { color: COL.k } },
            { name: "拓展层", type: "line", smooth: true, data: rep["拓展层"], lineStyle: { color: COL.q }, itemStyle: { color: COL.q } },
            { name: "全班均值", type: "line", smooth: true, data: classAvg, lineStyle: { color: "#e6f6fb", width: 3, type: "dashed" }, itemStyle: { color: "#e6f6fb" } },
          ],
        })} />
      </Card>
      <Card className="p-6"><h4 className="mb-2 font-semibold text-white">分层目标平均增值对比</h4>
        <EChart height={260} option={dark({
          grid: { left: 10, right: 20, top: 30, bottom: 30, containLabel: true },
          xAxis: { type: "category", data: ["基础层", "提高层", "拓展层"] },
          yAxis: { type: "value", name: "增值(分)" },
          series: [{ type: "bar", barWidth: "50%", data: [tierVa["基础层"], tierVa["提高层"], tierVa["拓展层"]], itemStyle: { color: ["rgba(103,232,249,0.5)", COL.k, COL.q] }, label: { show: true, position: "top", formatter: (p: any) => "+" + p.value, color: "#cffafe" } }],
        })} />
      </Card>
    </div>
  );
}
