// 课程目标达成度评价数据模型（移植自 course-eval/gen_data.py，同结构、可注入真实数据）
import { ROSTER, PROJECTS as COURSE_PROJECTS } from "./course";

export interface Dim3 { k: number; a: number; q: number }
export interface LessonStudent extends Dim3 { pre: number; mid: number; post: number }
export interface KnowledgePoint { id: string; name: string; dim: string; lessons: string[] }
export interface Lesson {
  id: string; idx: number; name: string; pre: string; mid: string; post: string;
  kpIds: string[]; students: Record<string, LessonStudent>; classAchieve: Dim3;
}
export interface Project { id: string; name: string; hours: number; lessons: string[]; achievement: number | null; classAchieve?: Dim3 }
export interface EvalStudent {
  id: string; name: string; tier: string; kpMastery: Record<string, number>;
  valueAdded: number; lessonTrend: number[];
}
export interface EvalData {
  meta: Record<string, string | number>;
  objectives: { knowledge: string[]; ability: string[]; quality: string[] };
  knowledgePoints: KnowledgePoint[];
  projects: Project[];
  lessons: Lesson[];
  students: EvalStudent[];
}

export const META: Record<string, string | number> = {
  course: "信息采集技术",
  project: "数智社区 · 数据采集与治理（4 个项目）",
  hours: 30,
  className: "2465 人工智能",
  teacher: "授课教师",
  semester: "2025-2026 学年第 2 学期",
  model: "全过程 · 多维 · 增值性评价（课前→课中→课后 四阶闭环）",
  dataNote: "看板数据由学生端「课前预习 / 提交作业 / 课后知识点问答」真实作答融合生成。",
};

export const OBJECTIVES = {
  knowledge: [
    "了解多源数据融合的应用场景",
    "理解数据采集处理与可视化的原理",
    "掌握Python编程与多源传感器技术",
    "掌握采集硬件及网络爬虫等核心技术",
  ],
  ability: [
    "能完成多源数据采集",
    "能进行数据清洗、融合分析",
    "能基于数据构建简单可视化应用",
    "具备工程实践与问题解决能力",
  ],
  quality: [
    "树立规范意识、工匠精神与社会责任感",
    "强化团队协作与自主持续学习能力",
    "培养技术实践中的伦理思考与创新意识",
    "实现技能与素养的统一发展",
  ],
};

export const KNOWLEDGE_POINTS: KnowledgePoint[] = [
  { id: "kp1", name: "多源数据融合应用场景", dim: "知识", lessons: ["L1", "L3"] },
  { id: "kp2", name: "数据采集处理与可视化原理", dim: "知识", lessons: ["L1", "L4"] },
  { id: "kp3", name: "Python编程采集", dim: "知识", lessons: ["L2"] },
  { id: "kp4", name: "多源传感器选型与部署", dim: "知识", lessons: ["L2"] },
  { id: "kp5", name: "采集硬件配置", dim: "能力", lessons: ["L2"] },
  { id: "kp6", name: "网络爬虫技术", dim: "能力", lessons: ["L2", "L3"] },
  { id: "kp7", name: "数据清洗", dim: "能力", lessons: ["L3"] },
  { id: "kp8", name: "数据融合分析", dim: "能力", lessons: ["L3"] },
  { id: "kp9", name: "可视化应用构建", dim: "能力", lessons: ["L4"] },
  { id: "kp10", name: "工程实践与问题解决", dim: "能力", lessons: ["L2", "L3", "L4"] },
  { id: "kp11", name: "规范意识与工匠精神", dim: "素养", lessons: ["L1", "L2", "L3", "L4"] },
  { id: "kp12", name: "数据伦理与合规采集", dim: "素养", lessons: ["L3", "L4"] },
];

// 项目口径与「教学评价资源区」打分部分完全一致（同一份 course.ts PROJECTS）：名称 / 学时 / 顺序均以打分区为准。
// 当前课程进行到 项目一（L1、L2 已开展），其余项目未开始（achievement = null，看板显示“未开始”）。
export const PROJECTS: Project[] = COURSE_PROJECTS.map((p) => ({
  id: p.id,
  name: p.title,
  hours: p.hours,
  lessons: p.id === "P1" ? ["L1", "L2"] : [],
  achievement: null,
}));

export const LESSONS: Omit<Lesson, "students" | "classAchieve">[] = [
  { id: "L1", idx: 1, name: "任务1 需求确定与方案设计", pre: "区域环境与设施数据采集需求调研（微课+预习测验）", mid: "需求分析研讨 + 采集方案设计（引-讨-练-展-验-评）", post: "采集方案优化与小组互评", kpIds: ["kp1", "kp2", "kp11"] },
  { id: "L2", idx: 2, name: "任务2 传感部署与采集开发", pre: "传感器与Python采集程序预习（学习平台）", mid: "传感设备部署 + 采集程序开发实操（工坊实操）", post: "采集程序优化与异常排查", kpIds: ["kp3", "kp4", "kp5", "kp10", "kp11"] },
  { id: "L3", idx: 3, name: "任务3 数据清洗与融合分析", pre: "数据清洗与融合方法预习（AI助学）", mid: "多源数据清洗 + 融合分析实操", post: "融合分析报告撰写", kpIds: ["kp1", "kp6", "kp7", "kp8", "kp10", "kp12"] },
  { id: "L4", idx: 4, name: "任务4 可视化构建与工程验收", pre: "可视化工具与工程规范预习", mid: "可视化应用构建 + 工程验收（含复盘）", post: "拓展创新（技术向善应用场景）", kpIds: ["kp2", "kp9", "kp10", "kp11", "kp12"] },
];

const TIERS = [...Array(12).fill("基础层"), ...Array(12).fill("提高层"), ...Array(6).fill("拓展层")];
const TIER_BASE: Record<string, [number, number, number]> = { 基础层: [55, 62, 72], 提高层: [68, 78, 86], 拓展层: [80, 88, 93] };

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

// 真实数据注入：pre/mid/post 每学生每堂课（0-100），来自学生端预习/作业/问答
export interface RealScores { [studentId: string]: { [lessonId: string]: { pre?: number; mid?: number; post?: number } } }

export function buildEvalData(real: RealScores = {}): EvalData {
  const rnd = mulberry32(20260907);
  const rand = (lo: number, hi: number) => lo + rnd() * (hi - lo);

  const students = ROSTER.map((r, i) => {
    const tier = TIERS[i % TIERS.length];
    const ability = rand(-4, 4);
    return { id: r.id, name: r.name, tier, ability };
  });

  const lessons: Lesson[] = LESSONS.map((les) => {
    const st: Record<string, LessonStudent> = {};
    students.forEach((s) => {
      const [bpre, bmid, bpost] = TIER_BASE[s.tier];
      const a = s.ability;
      const p = les.idx - 1;
      let pre = Math.round(clamp(bpre + a + rand(-5, 5)));
      let mid = Math.round(clamp(bmid + a + p * 1.2 + rand(-5, 5)));
      let post = Math.round(clamp(bpost + a + p * 1.8 + rand(-4, 4)));
      const r = real[s.id]?.[les.id];
      if (r) {
        if (typeof r.pre === "number") pre = Math.round(clamp(r.pre));
        if (typeof r.mid === "number") mid = Math.round(clamp(r.mid));
        if (typeof r.post === "number") post = Math.round(clamp(r.post));
      }
      const k = 0.25 * pre + 0.45 * mid + 0.3 * post;
      const ab = 0.15 * pre + 0.55 * mid + 0.3 * post;
      const q = 0.1 * pre + 0.4 * mid + 0.5 * post;
      st[s.id] = { pre, mid, post, k: +(k / 100).toFixed(3), a: +(ab / 100).toFixed(3), q: +(q / 100).toFixed(3) };
    });
    const ks = Object.values(st).map((v) => v.k);
    const as = Object.values(st).map((v) => v.a);
    const qs = Object.values(st).map((v) => v.q);
    const classAchieve = {
      k: +(ks.reduce((x, y) => x + y, 0) / ks.length).toFixed(3),
      a: +(as.reduce((x, y) => x + y, 0) / as.length).toFixed(3),
      q: +(qs.reduce((x, y) => x + y, 0) / qs.length).toFixed(3),
    };
    return { ...les, students: st, classAchieve };
  });

  const kpFactor: Record<string, number> = {};
  KNOWLEDGE_POINTS.forEach((kp) => (kpFactor[kp.id] = rand(0.86, 1.06)));

  const evalStudents: EvalStudent[] = students.map((s) => {
    const overallPost = lessons.reduce((a, l) => a + l.students[s.id].post, 0) / 4;
    const kpMastery: Record<string, number> = {};
    KNOWLEDGE_POINTS.forEach((kp) => {
      kpMastery[kp.id] = Math.round(clamp(overallPost * kpFactor[kp.id] + rand(-4, 4), 0, 100));
    });
    const avgPre = lessons.reduce((a, l) => a + l.students[s.id].pre, 0) / 4;
    const valueAdded = +(overallPost - avgPre).toFixed(1);
    const lessonTrend = lessons.map((l) => {
      const v = l.students[s.id];
      return +((v.k + v.a + v.q) / 3).toFixed(3);
    });
    return { id: s.id, name: s.name, tier: s.tier, kpMastery, valueAdded, lessonTrend };
  });

  // 已开课项目（有 lessons）按其各堂课 classAchieve 均值计算达成度；未开课项目保持 null（未开始）
  const projects = PROJECTS.map((p) => {
    const ls = p.lessons
      .map((id) => lessons.find((l) => l.id === id))
      .filter((l): l is Lesson => !!l);
    if (!ls.length) return p;
    const k = +(ls.reduce((acc, l) => acc + l.classAchieve.k, 0) / ls.length).toFixed(3);
    const a = +(ls.reduce((acc, l) => acc + l.classAchieve.a, 0) / ls.length).toFixed(3);
    const q = +(ls.reduce((acc, l) => acc + l.classAchieve.q, 0) / ls.length).toFixed(3);
    return { ...p, classAchieve: { k, a, q }, achievement: +((k + a + q) / 3).toFixed(3) };
  });

  return { meta: META, objectives: OBJECTIVES, knowledgePoints: KNOWLEDGE_POINTS, projects, lessons, students: evalStudents };
}

export const DIM = { k: "知识", a: "能力", q: "素养" } as const;
export const COL = { k: "#22d3ee", a: "#34d399", q: "#fbbf24" } as const;
export const pct = (x: number) => (x * 100).toFixed(1) + "%";
