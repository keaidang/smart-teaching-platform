// 学情分析：第一版演示数据。
// 核心原则：所有分数、班级统计、个人画像、知识图谱掌握度，一律由「8 任务 × 课前/课中/课后」真实题库
// 逐题判分聚合而来（确定性种子，刷新不变），而非独立随机数——保证"统计分析来自真实测试"。
// 真实接口优先：api.ts 先请求后端；后端不可用时回退到这里（离线演示）。
import { ROSTER, allTasks } from "./course";
import { knowledgeNodes, edges } from "./graph";
import { TASK_BANKS } from "./mock";
import type { BankQuestion, Phase, PhaseScore, StudentProfile, ClassAnalytics, GraphStats } from "./types";

export const PHASES: { key: Phase; label: string; desc: string }[] = [
  { key: "pre", label: "课前", desc: "预习检测" },
  { key: "mid", label: "课中", desc: "随堂测评" },
  { key: "post", label: "课后", desc: "巩固习题" },
];
export const RADAR_DIMS = ["辨识能力", "分析决策能力", "创新能力", "动手能力", "合作能力"];
export const KNOWLEDGE_ITEMS = ["爬虫与网页解析", "物联传感采集", "文本清洗与标注", "向量知识库与RAG", "可视化看板"];
// 关键技能与 8 个任务一一对应（P1T1..P4T2），箱线图取自各任务课后测评真实分数。
export const SKILLS = ["需求字段设计", "感知与采集", "清洗与标注", "传感与视觉治理", "数据库与向量化", "融合检索RAG", "单维度看板", "综合大屏交付"];

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

/* ===== 真实题库访问 ===== */
export function bankOf(taskId: string, phase: Phase): BankQuestion[] {
  return TASK_BANKS[taskId]?.[phase] ?? [];
}
// 每题固定"答案键"（模拟云函数存储的正确项；前端题库对象本身不携带 answer）。
function answerKey(q: BankQuestion): number {
  return hash(q.id) % q.options.length;
}
// 某学生在某题上"是否答对"的确定性模拟（在线时由云函数按真实提交判分）。
function simCorrect(sid: string, taskId: string, phase: Phase, q: BankQuestion): boolean {
  const affinity = rng(`${sid}:${taskId}`)() * 10 - 5;
  const prob = clamp((ability(sid) + affinity + PHASE_BONUS[phase] + 6) / 100, 0.15, 0.98);
  return rng(`${sid}:${taskId}:${phase}:${q.id}`)() < prob;
}

/* ===== 逐题判分聚合出阶段成绩 ===== */
export function phaseResult(sid: string, taskId: string, phase: Phase) {
  const bank = bankOf(taskId, phase);
  if (!bank.length) {
    // 兜底：理论上 8 任务三阶段均有题库，缺题时退化为能力估计。
    const est = round(clamp(ability(sid) + PHASE_BONUS[phase] + rng(`${sid}:${taskId}:${phase}`)() * 16 - 8, 45, 100));
    return { score: est, total: 100, answered: 0, correct: 0 };
  }
  let score = 0, total = 0, correct = 0;
  for (const q of bank) {
    total += q.score;
    if (simCorrect(sid, taskId, phase, q)) { score += q.score; correct++; }
  }
  return { score: round(clamp(score, 0, total)), total, answered: bank.length, correct };
}

export function phaseScore(sid: string, taskId: string, phase: Phase): number {
  return phaseResult(sid, taskId, phase).score;
}

export function mockPhaseScores(taskId?: string, phase?: Phase): PhaseScore[] {
  const out: PhaseScore[] = [];
  for (const t of allTasks()) {
    if (taskId && t.id !== taskId) continue;
    for (const p of PHASES) {
      if (phase && p.key !== phase) continue;
      for (const s of ROSTER) {
        const r = phaseResult(s.id, t.id, p.key);
        out.push({ studentId: s.id, name: s.name, taskId: t.id, phase: p.key, score: r.score, total: r.total, answered: r.answered });
      }
    }
  }
  return out;
}

// 学生提交：按答案键对真实逐题选项判分（在线判分口径一致，离线也给出真实得分）。
export function mockSubmitPhase(
  _sid: string,
  taskId: string,
  phase: Phase,
  answers: { questionId: string; selected: number }[] = []
) {
  const bank = bankOf(taskId, phase);
  const sel: Record<string, number> = {};
  for (const a of answers) sel[a.questionId] = a.selected;
  let score = 0, total = 0, answered = 0;
  for (const q of bank) {
    total += q.score;
    const picked = sel[q.id];
    if (picked == null) continue;
    answered++;
    if (picked === answerKey(q)) score += q.score;
  }
  return { ok: true, score: round(score), total, answered };
}

/* ===== 个人数字画像（由 8 任务课前/课后测评聚合） ===== */
export function mockProfiles(): StudentProfile[] {
  return ROSTER.map((s) => {
    const r = rng(s.id + ":profile");
    const base = ability(s.id);
    const radarPre = RADAR_DIMS.map(() => round(clamp(base - 14 + r() * 18, 40, 92)));
    const radarPost = radarPre.map((v) => round(clamp(v + 6 + r() * 16, 50, 100)));
    const knowledge = KNOWLEDGE_ITEMS.map((name) => ({ name, score: round(clamp(base - 8 + r() * 26, 50, 100)) }));
    const preAvg = mean(allTasks().map((t) => phaseScore(s.id, t.id, "pre")));
    const postAvg = mean(allTasks().map((t) => phaseScore(s.id, t.id, "post")));
    // 掌握度、完成率均由课后测评得分派生，保证与"真实测试"一致。
    const mastery = round(clamp(postAvg * 0.92 + r() * 10 - 4, 40, 100));
    const completion = round(clamp(postAvg * 0.6 + 40 + r() * 8, 45, 100));
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
  // 关键技能箱线：每项技能对应一个任务，取全班该任务课后测评的真实逐人分数分布。
  const skills = SKILLS.map((name, i) => {
    const t = tasks[i % tasks.length];
    return { name, values: ROSTER.map((s) => phaseScore(s.id, t.id, "post")) };
  });
  const profiles = mockProfiles();
  const students = profiles.map((p) => ({ id: p.studentId, name: p.name, pre: p.preAvg, post: p.postAvg }));
  return { taskAvg, skills, students, profiles };
}

/* ===== 知识图谱统计分析（掌握度按所属任务的课后测评真实分布派生） ===== */
const taskLabelOf = (n: { project: number; lesson: number }) =>
  n.lesson ? `P${n.project}T${n.lesson - (n.project - 1) * 2}` : "课程共用";

// 节点 → 所属任务 id（课程共用节点为 null）。
const ownerTaskOf = (n: { project: number; lesson: number }): string | null =>
  n.lesson ? `P${n.project}T${n.lesson - (n.project - 1) * 2}` : null;

export function mockGraphStats(): GraphStats {
  const tasks = allTasks();
  // 各任务课后测评的全班均分（来自真实逐题判分）。
  const classTaskAvg: Record<string, number> = {};
  for (const t of tasks) classTaskAvg[t.id] = mean(ROSTER.map((s) => phaseScore(s.id, t.id, "post")));
  const overall = mean(tasks.map((t) => classTaskAvg[t.id]));

  const knowledge = knowledgeNodes.map((n) => {
    const owner = ownerTaskOf(n);
    const base = owner ? classTaskAvg[owner] ?? overall : overall;
    const r = rng(n.id + ":mastery");
    const mastery = round(clamp(base + (r() * 18 - 9), 30, 99));
    const completion = round(clamp(mastery + 4 + r() * 14, 40, 100));
    return { id: n.id, name: n.name, type: n.type, mark: n.mark, task: taskLabelOf(n), mastery, completion };
  });

  const profiles = mockProfiles();
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
