// 学情分析第一版演示数据：确定性种子生成（刷新不变），覆盖全部 28 名学生。
// 真实接口优先：api.ts 先请求后端，后端不可用时回退到这里。
import { ROSTER, allTasks } from "./course";
import { knowledgeNodes, edges } from "./graph";
import type { Phase, PhaseScore, StudentProfile, ClassAnalytics, GraphStats } from "./types";

export const PHASES: { key: Phase; label: string; desc: string }[] = [
  { key: "pre", label: "课前", desc: "预习检测" },
  { key: "mid", label: "课中", desc: "随堂测评" },
  { key: "post", label: "课后", desc: "巩固习题" },
];
export const RADAR_DIMS = ["辨识能力", "分析决策能力", "创新能力", "动手能力", "合作能力"];
export const KNOWLEDGE_ITEMS = ["爬虫与网页解析", "物联传感采集", "文本清洗与标注", "向量知识库与RAG", "可视化看板"];
export const SKILLS = ["需求字段设计", "爬虫采集实现", "物联感知采集", "视觉特征构建", "清洗与标注", "数据治理对齐", "融合检索RAG", "可视化交付"];

/* ===== 确定性随机 ===== */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: string) {
  let a = hash(seed);
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const round = Math.round;
const mean = (xs: number[]) => round(xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length));

const ability = (sid: string) => 60 + rng(sid + ":ability")() * 32;
const PHASE_BONUS: Record<Phase, number> = { pre: -7, mid: 0, post: 8 };

export function phaseScore(sid: string, taskId: string, phase: Phase): number {
  const r = rng(`${sid}:${taskId}:${phase}`);
  const affinity = rng(sid + ":" + taskId)() * 10 - 5;
  return round(clamp(ability(sid) + affinity + PHASE_BONUS[phase] + r() * 16 - 8, 45, 100));
}

export function mockPhaseScores(taskId?: string, phase?: Phase): PhaseScore[] {
  const out: PhaseScore[] = [];
  for (const t of allTasks()) {
    if (taskId && t.id !== taskId) continue;
    for (const p of PHASES) {
      if (phase && p.key !== phase) continue;
      for (const s of ROSTER) {
        out.push({ studentId: s.id, name: s.name, taskId: t.id, phase: p.key, score: phaseScore(s.id, t.id, p.key), total: 100, answered: 4 });
      }
    }
  }
  return out;
}

export function mockSubmitPhase(sid: string, taskId: string, phase: Phase, answered: number) {
  return { ok: true, score: phaseScore(sid, taskId, phase), total: 100, answered };
}

/* ===== 个人数字画像 ===== */
export function mockProfiles(): StudentProfile[] {
  return ROSTER.map((s) => {
    const r = rng(s.id + ":profile");
    const base = ability(s.id);
    const radarPre = RADAR_DIMS.map(() => round(clamp(base - 14 + r() * 18, 40, 92)));
    const radarPost = radarPre.map((v) => round(clamp(v + 6 + r() * 16, 50, 100)));
    const knowledge = KNOWLEDGE_ITEMS.map((name) => ({ name, score: round(clamp(base - 8 + r() * 26, 50, 100)) }));
    const preAvg = mean(allTasks().map((t) => phaseScore(s.id, t.id, "pre")));
    const postAvg = mean(allTasks().map((t) => phaseScore(s.id, t.id, "post")));
    const completion = round(clamp(58 + r() * 42, 40, 100));
    const mastery = round(clamp(completion - 12 + r() * 22, 40, 100));
    return { studentId: s.id, name: s.name, radarPre, radarPost, knowledge, preAvg, postAvg, growth: postAvg - preAvg, completion, mastery };
  });
}

/* ===== 班级学情分析 ===== */
export function mockClassAnalytics(): ClassAnalytics {
  const tasks = allTasks();
  const taskAvg = tasks.map((t) => {
    const per = (ph: Phase) => mean(ROSTER.map((s) => phaseScore(s.id, t.id, ph)));
    const pre = per("pre"), mid = per("mid"), post = per("post");
    return { id: t.id, title: t.title, avg: mean([pre, mid, post]), pre, mid, post };
  });
  const skills = SKILLS.map((name) => ({
    name,
    values: ROSTER.map((s) => round(clamp(ability(s.id) + rng(s.id + ":" + name)() * 26 - 13, 50, 100))),
  }));
  const profiles = mockProfiles();
  const students = profiles.map((p) => ({ id: p.studentId, name: p.name, pre: p.preAvg, post: p.postAvg }));
  return { taskAvg, skills, students, profiles };
}

/* ===== 知识图谱统计分析 ===== */
const taskLabelOf = (n: { project: number; lesson: number }) =>
  n.lesson ? `P${n.project}T${n.lesson - (n.project - 1) * 2}` : "课程共用";

export function knowledgeMastery(id: string) {
  const r = rng(id + ":mastery");
  const mastery = round(clamp(52 + r() * 46, 35, 98));
  const completion = round(clamp(mastery + 4 + r() * 16, 40, 100));
  return { mastery, completion };
}

export function mockGraphStats(): GraphStats {
  const profiles = mockProfiles();
  const knowledge = knowledgeNodes.map((n) => {
    const m = knowledgeMastery(n.id);
    return { id: n.id, name: n.name, type: n.type, mark: n.mark, task: taskLabelOf(n), ...m };
  });
  const linked = knowledge.filter((k) => k.task !== "课程共用" || edges.some((e) => e.a.id === k.id && e.t === "应用于"));
  const masteryAvg = mean(knowledge.map((k) => k.mastery));
  const completionAvg = mean(knowledge.map((k) => k.completion));
  const ideology = knowledgeNodes.filter((n) => n.type.includes("规范") || /合规|隐私|安全|脱敏/.test(n.name)).length;
  const cloud = knowledgeNodes
    .map((n) => ({ name: n.name, heat: round(30 + rng(n.id + ":heat")() * 70) }))
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 16);
  const bands = [
    { label: "待达标 <60", value: profiles.filter((p) => p.mastery < 60).length },
    { label: "基本掌握 60–79", value: profiles.filter((p) => p.mastery >= 60 && p.mastery < 80).length },
    { label: "熟练掌握 ≥80", value: profiles.filter((p) => p.mastery >= 80).length },
  ];
  return {
    totalKnowledge: knowledgeNodes.length,
    linkedKnowledge: linked.length,
    masteryAvg,
    completionAvg,
    taskLink: { classroom: knowledgeNodes.filter((n) => n.lesson > 0).length, ideology, training: linked.filter((k) => k.task === "课程共用").length, exam: 0 },
    cloud,
    bands,
    students: profiles.map((p) => ({ id: p.studentId, name: p.name, completion: p.completion, mastery: p.mastery })).sort((a, b) => b.mastery - a.mastery),
    knowledge: knowledge.sort((a, b) => a.mastery - b.mastery),
  };
}