import { useEffect, useMemo, useState } from "react";
import { EChart, dark } from "../../components/EChart";
import { buildEvalData, DIM, COL, pct } from "../../lib/evalModel";
import { PROJECTS, GROUPS, groupMemberNames, EVAL_DIMENSIONS } from "../../lib/course";
import { api } from "../../lib/api";
import type { EvalKind, GroupEval } from "../../lib/types";
import { Card, SectionTitle, Stat, Tag, TONE_HEX, type Tone } from "../../components/ui";
import { IconGauge, IconUsers, IconSkill } from "../../components/icons";

// 评价区顶层模块：三类小组打分 + 原达成度看板
const AREA_TABS: { id: EvalKind | "dashboard"; label: string; tone: Tone }[] = [
  { id: "teacher", label: "教师评价", tone: "blue" },
  { id: "enterprise", label: "企业评价", tone: "amber" },
  { id: "ai", label: "AI 工具测评", tone: "violet" },
  { id: "dashboard", label: "达成度看板", tone: "emerald" },
];

const DASH_TABS = [
  { id: "overview", label: "① 课程总览" },
  { id: "lesson", label: "② 每堂课达成" },
  { id: "kp", label: "③ 知识点掌握" },
  { id: "student", label: "④ 学生画像" },
  { id: "value", label: "⑤ 增值与持续学习" },
];

const KIND_TONE: Record<EvalKind, Tone> = { teacher: "blue", enterprise: "amber", ai: "violet" };
const GROUP_TONES: Tone[] = ["cyan", "blue", "violet", "emerald", "amber", "rose", "orange"];
const PROJECT_COLORS = ["#22d3ee", "#34d399", "#a78bfa", "#f472b6"];
const kpColor = (v: number) => (v < 75 ? "#f472b6" : v < 85 ? "#fbbf24" : "#34d399");

export default function Evaluation() {
  const [area, setArea] = useState<EvalKind | "dashboard">("teacher");
  const [tab, setTab] = useState("overview");
  const D = useMemo(() => buildEvalData(), []);
  // 当前开课项目 = 已计算达成度的项目（项目一，L1/L2 已开展）；其余项目看板显示“未开始”
  const cur = D.projects.find((p) => p.achievement !== null) ?? D.projects[0];
  const avgVa = +(D.students.reduce((s, x) => s + x.valueAdded, 0) / D.students.length).toFixed(1);

  return (
    <div className="flex flex-1 flex-col animate-rise">
      {/* 顶部模块色横幅 */}
      <div className="hero-mesh relative mb-6 shrink-0 overflow-hidden rounded-2xl border border-slate-900/10 px-7 py-9">
        <div className="tone-emerald relative flex flex-col items-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <h1 className="grad-text text-4xl font-extrabold tracking-wide lg:text-5xl">教学评价资源</h1>
            <span className="chip-tone tone-cyan rounded-full px-4 py-1 text-sm font-medium tracking-widest">
              多维 · 智能 · 全过程
            </span>
          </div>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-slate-600">
            教师评价 · 企业评价 · AI 工具测评三视角小组打分，融合课前 → 课中 → 课后真实作答，
            生成课程目标达成度看板与个性化学习诊断。
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Stat value={D.students.length} label="参评学生" tone="emerald" />
            <Stat value={GROUPS.length} label="学习小组" tone="cyan" />
            <Stat value={PROJECTS.length} label="评价项目" tone="blue" />
            <Stat value={D.knowledgePoints.length} label="知识点" tone="violet" />
            <Stat value="3" label="评价主体" tone="amber" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {AREA_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setArea(t.id)}
            className={`tone-${t.tone} rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              area === t.id
                ? "chip-tone font-semibold"
                : "text-slate-500 hover:bg-slate-900/5 hover:text-slate-900"
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
            <h3 className="text-lg font-semibold text-slate-900">
              课程目标达成度看板 · 《{D.meta.course}》· {D.meta.className} · {D.students.length} 人
            </h3>
            <span className="chip-tone tone-emerald rounded-full px-3 py-1 text-xs">
              {D.meta.model}
            </span>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {DASH_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`tone-emerald rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "chip-tone font-semibold"
                    : "text-slate-500 hover:bg-slate-900/5 hover:text-slate-900"
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

          <p className="mt-6 text-center text-xs text-slate-500">{D.meta.dataNote}</p>
        </>
      )}

      {/* 评价方法说明：三维评价主体 + 维度解读 + 合成口径 */}
      <div className="mt-8 space-y-6">
        <Card tone="emerald" className="p-8">
          <SectionTitle
            icon={<IconUsers className="h-6 w-6" />}
            title="三维评价 · 多元主体"
            sub="教师 · 企业 · AI 三个视角，以小组为单位交叉印证"
            tone="emerald"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {(Object.keys(KIND_META) as EvalKind[]).map((k) => {
              const tone = KIND_TONE[k];
              const m = KIND_META[k];
              const focus =
                k === "teacher"
                  ? EVAL_DIMENSIONS.map((d) => d.label).join(" · ")
                  : k === "enterprise"
                  ? "可用率 · 假名化 · 无原图残留 · 交付规范"
                  : "工具熟练度 · 提示词质量 · 结果校验意识";
              return (
                <div key={k} className={`tone-${tone} rounded-xl border bg-slate-900/[0.03] p-5`} style={{ borderColor: "var(--tone-line)" }}>
                  <div className="text-lg font-bold" style={{ color: "var(--tone)" }}>{m.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{m.desc}</p>
                  <div className="mt-3 border-t border-slate-900/5 pt-3">
                    <div className="text-xs text-slate-500">关注要点</div>
                    <div className="mt-1 text-sm text-slate-600">{focus}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card tone="cyan" className="p-8">
          <SectionTitle
            icon={<IconGauge className="h-6 w-6" />}
            title="评价维度解读"
            sub="教师评价 4 个维度：从课堂投入到综合素养的全过程观察"
            tone="cyan"
          />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {EVAL_DIMENSIONS.map((d, i) => {
              const tones: Tone[] = ["blue", "emerald", "cyan", "violet"];
              const tone = tones[i % tones.length];
              const explain = [
                "关注出勤、专注度与课堂互动，反映学习投入与参与质量。",
                "以完成度、质量与规范衡量课后巩固效果与工程交付习惯。",
                "检验概念、原理与方法的理解深度，对应知识点掌握度数据。",
                "考察协作、合规与创新，呼应课程素养目标与技术向善理念。",
              ][i % 4];
              return (
                <div key={d.key} className={`tone-${tone} rounded-xl border bg-slate-900/[0.03] p-5`} style={{ borderColor: "var(--tone-line)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">{d.label}</span>
                    <span className="grad-text text-2xl font-extrabold">0{i + 1}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {d.desc.split(" · ").map((t) => (
                      <Tag key={t} tone={tone} className="px-2 py-0.5 text-xs">{t}</Tag>
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{explain}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card tone="violet" className="p-8">
          <SectionTitle
            icon={<IconSkill className="h-6 w-6" />}
            title="达成度合成口径"
            sub={String(D.meta.model)}
            tone="violet"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {([
              { name: "知识维度", cls: "k" as const, w: [25, 45, 30], tone: "cyan" as Tone },
              { name: "能力维度", cls: "a" as const, w: [15, 55, 30], tone: "emerald" as Tone },
              { name: "素养维度", cls: "q" as const, w: [10, 40, 50], tone: "amber" as Tone },
            ]).map((d) => (
              <div key={d.cls} className={`tone-${d.tone} rounded-xl border bg-slate-900/[0.03] px-5 py-4`} style={{ borderColor: "var(--tone-line)" }}>
                <div className="text-base font-bold" style={{ color: "var(--tone)" }}>{d.name}</div>
                <div className="mt-2 font-mono text-sm text-slate-600">
                  课前×{d.w[0]}% + 课中×{d.w[1]}% + 课后×{d.w[2]}%
                </div>
                <div className="mt-2 flex gap-1.5">
                  {d.w.map((w, i) => (
                    <span key={i} className="rounded-md px-2 py-0.5 text-xs font-semibold text-ink-950" style={{ background: ["#22d3ee", "#60a5fa", "#34d399"][i], opacity: 0.55 + w / 100 }}>
                      {["课前", "课中", "课后"][i]} {w}%
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            项目达成度 = 已开课各堂课三维达成的均值；增值 = 课后均分 − 课前均分。三维目标覆盖知识、能力、素养，
            权重向课中实操与课后巩固倾斜，体现「做中学」的过程性评价导向。
          </p>
        </Card>
      </div>
    </div>
  );
}

// ---------- 小组打分面板（教师 / 企业 / AI 工具测评共用） ----------

const KIND_META: Record<EvalKind, { title: string; desc: string; placeholder: string }> = {
  teacher: {
    title: "教师评价",
    desc: "以学习小组为单位，对 4 个项目的课堂完成情况打分（0–100 分）。",
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
  const tone = KIND_TONE[kind];
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
        {GROUPS.map((g, gi) => {
          const ev = evals.find((r) => r.groupId === g.id);
          const on = g.id === selId;
          const gt = GROUP_TONES[gi % GROUP_TONES.length];
          return (
            <button
              key={g.id}
              onClick={() => pick(g.id)}
              className={`tone-${gt} rounded-xl border px-4 py-3 text-left transition-all ${
                on
                  ? "tone-card glass text-slate-900"
                  : "border-slate-900/10 bg-slate-900/5 text-slate-600 hover:bg-slate-900/10"
              }`}
              style={on ? { borderColor: "var(--tone-line)" } : undefined}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{g.name}</span>
                <span className="text-xs text-slate-500">{g.memberIds.length} 人</span>
              </div>
              <div className={`mt-1 text-xs ${ev ? "font-semibold" : "text-slate-600"}`} style={ev ? { color: "var(--tone)" } : undefined}>
                {ev ? `均分 ${avgOfScores(ev.scores)}` : "未评价"}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* 打分区 */}
        <Card tone={tone} className="p-6">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{meta.title} · {group.name}</h3>
            <span className={`tone-${tone} chip-tone rounded-full px-3 py-1 text-sm font-semibold`}>
              均分 {avgOfScores(scores)}
            </span>
          </div>
          <p className="mb-5 text-sm text-slate-500">{meta.desc}</p>
          <p className="mb-4 rounded-lg border border-slate-900/10 bg-slate-900/5 px-4 py-2.5 text-xs leading-relaxed text-slate-500">
            组员：{groupMemberNames(group).join("、")}
          </p>

          <div className="space-y-4">
            {PROJECTS.map((p, pi) => (
              <div key={p.id} className={`tone-${GROUP_TONES[pi % GROUP_TONES.length]} rounded-xl border bg-slate-900/[0.04] px-4 py-3`} style={{ borderColor: "var(--tone-line)" }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900">{p.title}</div>
                    <div className="text-xs text-slate-500">{p.id} · {p.hours} 课时</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={scores[p.id] || 0}
                      onChange={(e) => setScores({ ...scores, [p.id]: Number(e.target.value) })}
                      className="w-36 sm:w-48"
                      style={{ accentColor: "var(--tone)" }}
                    />
                    <span className="w-12 text-right text-lg font-bold" style={{ color: "var(--tone)" }}>{scores[p.id] || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-sm text-slate-500">评语</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={meta.placeholder}
              className="w-full resize-none rounded-xl border border-slate-900/15 bg-surface/85 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-900/35"
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl px-6 py-2.5 font-semibold text-ink-950 transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: `linear-gradient(90deg, ${TONE_HEX[tone]}, ${TONE_HEX[tone]}bb)`, boxShadow: `0 8px 24px -8px ${TONE_HEX[tone]}66` }}
            >
              {saving ? "保存中…" : `保存${meta.title}`}
            </button>
            <span className="text-xs text-slate-500">已打分 {done}/4 个项目</span>
            {msg && <span className={`text-sm ${msg === "已保存" ? "text-emerald-600" : "text-rose-600"}`}>{msg}</span>}
          </div>
        </Card>

        {/* 已评价汇总 */}
        <Card tone={tone} className="max-h-[70vh] overflow-y-auto p-4 scrollbar-thin">
          <div className="mb-2 px-2 text-sm font-medium text-slate-500">
            {meta.title}记录 · {evals.length}/{GROUPS.length} 组
          </div>
          {evals.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-slate-500">暂无评价，选择小组开始打分</div>
          )}
          <div className="space-y-2">
            {evals
              .slice()
              .sort((a, b) => avgOfScores(b.scores) - avgOfScores(a.scores))
              .map((ev) => (
                <button
                  key={ev.groupId}
                  onClick={() => pick(ev.groupId)}
                  className="w-full rounded-lg border border-slate-900/10 bg-slate-900/5 px-3 py-2.5 text-left transition-colors hover:border-slate-900/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">{ev.name}</span>
                    <span className="text-sm font-bold text-amber-600">{avgOfScores(ev.scores)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {PROJECTS.map((p, pi) => (
                      <span key={p.id} className={`tone-${GROUP_TONES[pi % GROUP_TONES.length]} chip-tone rounded px-1.5 py-0.5 text-[10px]`}>
                        {p.id} {ev.scores[p.id] || 0}
                      </span>
                    ))}
                  </div>
                  {ev.comment && <div className="mt-1 truncate text-xs text-slate-500">{ev.comment}</div>}
                </button>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

type D = ReturnType<typeof buildEvalData>;

function Kpi({ v, l, s, tone = "cyan" }: { v: string; l: string; s?: string; tone?: Tone }) {
  return (
    <Card tone={tone} hover className="p-5">
      <div className="grad-text text-3xl font-bold tabular-nums">{v}</div>
      <div className="mt-1 text-sm text-slate-500">{l}</div>
      {s && <div className="mt-0.5 text-xs text-slate-500">{s}</div>}
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
        <Kpi v={pct(cur.achievement!)} l="当前项目达成度" s={`${cur.name}（进行中）`} tone="emerald" />
        <Kpi v={`${D.students.length}`} l="参评学生" s={`${tiers["基础层"] || 0}基础 / ${tiers["提高层"] || 0}提高 / ${tiers["拓展层"] || 0}拓展`} tone="blue" />
        <Kpi v={pct(ca.k)} l="知识维度达成" s="懂采集原理" tone="cyan" />
        <Kpi v={pct(ca.a)} l="能力维度达成" s={`能多源融合 · 增值+${avgVa}`} tone="violet" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card tone="cyan" className="p-6">
          <h4 className="mb-2 font-semibold text-slate-900">三维目标达成雷达</h4>
          <EChart height={320} option={dark({
            radar: { indicator: [{ name: "知识", max: 1 }, { name: "能力", max: 1 }, { name: "素养", max: 1 }], radius: "65%", axisName: { color: "rgba(226,232,240,0.85)" }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } }, splitArea: { areaStyle: { color: ["rgba(255,255,255,0.02)", "transparent"] } }, axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } } },
            series: [{ type: "radar", data: [{ value: [ca.k, ca.a, ca.q], areaStyle: { color: "rgba(34,211,238,0.25)" }, lineStyle: { color: COL.k, width: 2.5 }, itemStyle: { color: COL.k } }] }],
          })} />
        </Card>
        <Card tone="blue" className="p-6">
          <h4 className="mb-2 font-semibold text-slate-900">四个项目达成度对标（课程共 30 学时）</h4>
          <EChart height={320} option={dark({
            grid: { left: 10, right: 20, top: 30, bottom: 40, containLabel: true },
            xAxis: { type: "category", data: D.projects.map((p) => p.name), axisLabel: { interval: 0, fontSize: 10 } },
            yAxis: { type: "value", max: 1, axisLabel: { formatter: (v: number) => v * 100 + "%" } },
            series: [{ type: "bar", barWidth: "46%", data: D.projects.map((p, i) => ({ value: p.achievement ?? 0, itemStyle: { color: pending[i] ? "rgba(148,163,184,0.15)" : PROJECT_COLORS[i % PROJECT_COLORS.length], borderRadius: [6, 6, 0, 0] } })), label: { show: true, position: "top", formatter: (p: any) => (pending[p.dataIndex] ? "未开始" : pct(p.value)), color: "#e2e8f0" } }],
          })} />
        </Card>
      </div>
      <Card tone="emerald" className="p-6">
        <h4 className="mb-3 font-semibold text-slate-900">课程三维目标与达成情况</h4>
        <div className="grid gap-6 md:grid-cols-3">
          {(["knowledge", "ability", "quality"] as const).map((dk) => {
            const cls = dk === "knowledge" ? "k" : dk === "ability" ? "a" : "q";
            const name = dk === "knowledge" ? "知识维度" : dk === "ability" ? "能力维度" : "素养维度";
            const tone: Tone = dk === "knowledge" ? "cyan" : dk === "ability" ? "emerald" : "amber";
            return (
              <div key={dk} className={`tone-${tone} rounded-xl border bg-slate-900/[0.03] p-4`} style={{ borderColor: "var(--tone-line)" }}>
                <div className="mb-2 font-semibold" style={{ color: COL[cls] }}>{name}（{pct((ca as any)[cls])}）</div>
                <ul className="space-y-1.5 text-sm text-slate-600">
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
        <label className="mr-2 text-sm text-slate-500">选择课堂：</label>
        <select value={lid} onChange={(e) => setLid(e.target.value)} className="rounded-lg border border-slate-900/15 bg-surface/85 px-3 py-2 text-sm text-slate-900 outline-none">
          {D.lessons.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card tone="emerald" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">本堂课三维目标达成</h4>
          <EChart height={280} option={dark({
            radar: { indicator: [{ name: "知识", max: 1 }, { name: "能力", max: 1 }, { name: "素养", max: 1 }], radius: "70%", axisName: { color: "rgba(226,232,240,0.85)" }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } }, axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } } },
            series: [{ type: "radar", data: [{ value: [l.classAchieve.k, l.classAchieve.a, l.classAchieve.q], areaStyle: { color: "rgba(52,211,153,0.25)" }, lineStyle: { color: COL.a, width: 2.5 }, itemStyle: { color: COL.a } }] }],
          })} />
        </Card>
        <Card tone="blue" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">本堂课 课前/课中/课后 平均分</h4>
          <EChart height={280} option={dark({
            grid: { left: 10, right: 20, top: 20, bottom: 30, containLabel: true },
            xAxis: { type: "category", data: ["课前", "课中", "课后"] },
            yAxis: { type: "value", max: 100 },
            series: [{ type: "bar", barWidth: "42%", data: [avg("pre"), avg("mid"), avg("post")].map((v, i) => ({ value: +v.toFixed(1), itemStyle: { color: ["#22d3ee", "#60a5fa", "#34d399"][i], borderRadius: [6, 6, 0, 0] } })), label: { show: true, position: "top", formatter: (p: any) => p.value.toFixed(1), color: "#e2e8f0" } }],
          })} />
        </Card>
      </div>
      <Card tone="violet" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">全班四堂课三维达成递进（增值性）</h4>
        <EChart height={320} option={dark({
          legend: { data: ["知识", "能力", "素养"] },
          grid: { left: 10, right: 20, top: 40, bottom: 40, containLabel: true },
          xAxis: { type: "category", boundaryGap: false, data: D.lessons.map((x) => x.name.replace(/任务\d+ /, "")) },
          yAxis: { type: "value", max: 1, min: 0.6, axisLabel: { formatter: (v: number) => v * 100 + "%" } },
          series: (["k", "a", "q"] as const).map((d) => ({ name: DIM[d], type: "line", smooth: true, data: D.lessons.map((x) => x.classAchieve[d]), lineStyle: { color: COL[d], width: 3 }, itemStyle: { color: COL[d] }, label: { show: true, formatter: (p: any) => pct(p.value), color: COL[d], fontSize: 11 } })),
        })} />
      </Card>
      <Card tone="cyan" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">本堂课各知识点班级达成</h4>
        <EChart height={300} option={dark({
          grid: { left: 10, right: 20, top: 20, bottom: 80, containLabel: true },
          xAxis: { type: "category", data: kps.map((k) => k.name), axisLabel: { interval: 0, rotate: 32, fontSize: 11 } },
          yAxis: { type: "value", max: 100 },
          series: [{ type: "bar", barWidth: "52%", data: kpAvg.map((v) => ({ value: v, itemStyle: { color: kpColor(v), borderRadius: [5, 5, 0, 0] } })), label: { show: true, position: "top", color: "#e2e8f0" } }],
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
      <Card tone="violet" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">知识点掌握热力图（学生 × 知识点）</h4>
        <EChart height={560} option={dark({
          grid: { left: 70, right: 20, top: 30, bottom: 60, containLabel: true },
          xAxis: { type: "category", data: kps.map((k) => k.name), axisLabel: { interval: 0, rotate: 38, fontSize: 11 } },
          yAxis: { type: "category", data: stus.map((s) => s.name), axisLabel: { fontSize: 10 } },
          visualMap: { min: 40, max: 100, calculable: true, orient: "horizontal", left: "center", bottom: 10, inRange: { color: ["#f472b6", "#fbbf24", "#34d399"] }, textStyle: { color: "rgba(226,232,240,0.75)" } },
          series: [{ type: "heatmap", data, emphasis: { itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.3)" } } }],
        })} />
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card tone="cyan" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">班级各知识点平均掌握度</h4>
          <EChart height={320} option={dark({
            grid: { left: 10, right: 20, top: 20, bottom: 90, containLabel: true },
            xAxis: { type: "category", data: kps.map((k) => k.name), axisLabel: { interval: 0, rotate: 34, fontSize: 11 } },
            yAxis: { type: "value", max: 100 },
            series: [{ type: "bar", barWidth: "55%", data: kps.map((_, i) => ({ value: avg[i], itemStyle: { color: kpColor(avg[i]), borderRadius: [5, 5, 0, 0] } })), label: { show: true, position: "top", color: "#e2e8f0" } }],
          })} />
        </Card>
        <Card tone="rose" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">薄弱知识点预警（班级均值 &lt; 75）</h4>
          <EChart height={320} option={dark({
            grid: { left: 10, right: 30, top: 20, bottom: 30, containLabel: true },
            xAxis: { type: "value", max: 100 },
            yAxis: { type: "category", data: weak.map((w) => w.name) },
            series: [{ type: "bar", barWidth: "55%", data: weak.map((w) => w.v), itemStyle: { color: "#f472b6", borderRadius: [0, 5, 5, 0] }, label: { show: true, position: "right", color: "#be185d" } }],
          })} />
          {weak.length === 0 && <p className="mt-2 text-center text-sm text-emerald-600">无薄弱知识点，班级整体扎实</p>}
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
        <label className="mr-2 text-sm text-slate-500">选择学生：</label>
        <select value={sid} onChange={(e) => setSid(e.target.value)} className="rounded-lg border border-slate-900/15 bg-surface/85 px-3 py-2 text-sm text-slate-900 outline-none">
          {D.students.map((x) => <option key={x.id} value={x.id}>{x.name}（{x.tier}）</option>)}
        </select>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card tone="amber" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">三维目标达成雷达</h4>
          <EChart height={280} option={dark({
            radar: { indicator: [{ name: "知识", max: 1 }, { name: "能力", max: 1 }, { name: "素养", max: 1 }], radius: "70%", axisName: { color: "rgba(226,232,240,0.85)" }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } }, axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } } },
            series: [{ type: "radar", data: [{ value: [dimAvg.k, dimAvg.a, dimAvg.q], areaStyle: { color: "rgba(251,191,36,0.25)" }, lineStyle: { color: COL.q, width: 2.5 }, itemStyle: { color: COL.q } }] }],
          })} />
        </Card>
        <Card tone="emerald" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">知识点掌握度</h4>
          <EChart height={280} option={dark({
            grid: { left: 10, right: 20, top: 20, bottom: 90, containLabel: true },
            xAxis: { type: "category", data: kps.map((k) => k.name), axisLabel: { interval: 0, rotate: 36, fontSize: 10 } },
            yAxis: { type: "value", max: 100 },
            series: [{ type: "bar", barWidth: "55%", data: kps.map((k) => ({ value: s.kpMastery[k.id], itemStyle: { color: kpColor(s.kpMastery[k.id]), borderRadius: [4, 4, 0, 0] } })) }],
          })} />
        </Card>
      </div>
      <Card tone="blue" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">课前 / 课中 / 课后 全过程表现</h4>
        <EChart height={280} option={dark({
          legend: { data: ["课前", "课中", "课后"] },
          grid: { left: 10, right: 20, top: 36, bottom: 30, containLabel: true },
          xAxis: { type: "category", data: D.lessons.map((l) => l.name.replace(/任务\d+ /, "")) },
          yAxis: { type: "value", max: 100 },
          series: [
            { name: "课前", type: "line", smooth: true, data: ph.pre, lineStyle: { color: "#22d3ee", width: 2.5 }, itemStyle: { color: "#22d3ee" } },
            { name: "课中", type: "line", smooth: true, data: ph.mid, lineStyle: { color: "#60a5fa", width: 2.5 }, itemStyle: { color: "#60a5fa" } },
            { name: "课后", type: "line", smooth: true, data: ph.post, lineStyle: { color: "#34d399", width: 2.5 }, itemStyle: { color: "#34d399" } },
          ],
        })} />
      </Card>
      <Card tone="violet" className="p-6">
        <h4 className="mb-3 font-semibold text-slate-900">个性化诊断与学习建议</h4>
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <p><b className="text-slate-900">一、基本信息</b> 该生属于 <span className="chip-tone tone-violet rounded-full px-2 py-0.5 text-xs">{s.tier}</span>，项目综合达成度 <b className="text-cyan-600">{pct(totA)}</b>，课前→课后增值 <b className="text-emerald-600">+{va} 分</b>（{vaWord}）。</p>
          <p><b className="text-slate-900">二、三维目标达成</b> 知识 {pct(dimAvg.k)}、能力 {pct(dimAvg.a)}、素养 {pct(dimAvg.q)}。</p>
          <p><b className="text-slate-900">三、分层诊断</b> {tierWord}。</p>
          <p><b className="text-slate-900">四、薄弱知识点</b> {weakK.length ? weakK.join("、") : "无低于75分的薄弱知识点"}。</p>
          <p><b className="text-slate-900">五、学习建议</b> {weakK.length ? `建议围绕 ${weakK.slice(0, 3).join("、")} 等薄弱点回看微课、加练实操，并借助 AI 助学个性化补弱。` : "三维均衡扎实，建议进入拓展层创新任务并承担小组复盘示范。"}</p>
        </div>
      </Card>
    </div>
  );
}

function ValueView({ D }: { D: D }) {
  const stus = D.students;
  const preAvg = stus.map((s) => +(D.lessons.reduce((a, l) => a + l.students[s.id].pre, 0) / 4).toFixed(1));
  const postAvg = stus.map((s) => +(D.lessons.reduce((a, l) => a + l.students[s.id].post, 0) / 4).toFixed(1));
  const tierColor: Record<string, string> = { 基础层: "#22d3ee", 提高层: "#a78bfa", 拓展层: "#f472b6" };
  const pts = stus.map((s, i) => ({ value: [preAvg[i], postAvg[i], s.name], itemStyle: { color: tierColor[s.tier] || "#60a5fa", opacity: 0.8 } }));
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
        <Card tone="cyan" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">全班 课前 vs 课后 得分对比</h4>
          <EChart height={320} option={dark({
            grid: { left: 10, right: 20, top: 30, bottom: 45, containLabel: true },
            xAxis: { type: "value", name: "课前", max: 100, min: 40 },
            yAxis: { type: "value", name: "课后", max: 100, min: 40 },
            series: [{ type: "scatter", data: pts, symbolSize: 11 }],
          })} />
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {Object.entries(tierColor).map(([t, c]) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{t}
              </span>
            ))}
          </div>
        </Card>
        <Card tone="emerald" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">增值（课后−课前）分布</h4>
          <EChart height={320} option={dark({
            grid: { left: 10, right: 20, top: 30, bottom: 35, containLabel: true },
            xAxis: { type: "category", data: labels },
            yAxis: { type: "value", name: "人数" },
            series: [{ type: "bar", barWidth: "55%", data: cnt.map((v, i) => ({ value: v, itemStyle: { color: ["#f472b6", "#fbbf24", "#60a5fa", "#34d399"][i], borderRadius: [6, 6, 0, 0] } })), label: { show: true, position: "top", color: "#e2e8f0" } }],
          })} />
        </Card>
      </div>
      <Card tone="violet" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">学生持续学习轨迹（四堂课综合达成）</h4>
        <EChart height={340} option={dark({
          legend: { data: ["基础层", "提高层", "拓展层", "全班均值"] },
          grid: { left: 10, right: 20, top: 40, bottom: 35, containLabel: true },
          xAxis: { type: "category", boundaryGap: false, data: axis },
          yAxis: { type: "value", max: 1, min: 0.6, axisLabel: { formatter: (v: number) => v * 100 + "%" } },
          series: [
            { name: "基础层", type: "line", smooth: true, data: rep["基础层"], lineStyle: { color: "#22d3ee", width: 2.5 }, itemStyle: { color: "#22d3ee" } },
            { name: "提高层", type: "line", smooth: true, data: rep["提高层"], lineStyle: { color: "#a78bfa", width: 2.5 }, itemStyle: { color: "#a78bfa" } },
            { name: "拓展层", type: "line", smooth: true, data: rep["拓展层"], lineStyle: { color: "#f472b6", width: 2.5 }, itemStyle: { color: "#f472b6" } },
            { name: "全班均值", type: "line", smooth: true, data: classAvg, lineStyle: { color: "#e6f6fb", width: 3, type: "dashed" }, itemStyle: { color: "#e6f6fb" } },
          ],
        })} />
      </Card>
      <Card tone="amber" className="p-6"><h4 className="mb-2 font-semibold text-slate-900">分层目标平均增值对比</h4>
        <EChart height={260} option={dark({
          grid: { left: 10, right: 20, top: 30, bottom: 30, containLabel: true },
          xAxis: { type: "category", data: ["基础层", "提高层", "拓展层"] },
          yAxis: { type: "value", name: "增值(分)" },
          series: [{ type: "bar", barWidth: "50%", data: [tierVa["基础层"], tierVa["提高层"], tierVa["拓展层"]].map((v, i) => ({ value: v, itemStyle: { color: ["#22d3ee", "#a78bfa", "#f472b6"][i], borderRadius: [6, 6, 0, 0] } })), label: { show: true, position: "top", formatter: (p: any) => "+" + p.value, color: "#e2e8f0" } }],
        })} />
      </Card>
    </div>
  );
}