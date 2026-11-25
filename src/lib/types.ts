export interface Student {
  id: string;
  name: string;
  avatarColor: string;
  classId: string;
}

export interface PreviewQuestion {
  id: string;
  title: string;
  options: string[];
  // 答案仅存在于服务端（云函数 KV），任何 GET 接口都不下发；离线 mock 也不携带
  answer?: number;
  score: number;
}

export interface PreviewAnswer {
  studentId: string;
  questionId: string;
  selected: number;
  // 由服务端判分后写入，客户端不计算
  correct?: boolean;
}

// 提交预习后的服务端返回：判分在服务端完成，results 按学号给出成绩
export interface PreviewSubmitResult {
  ok: boolean;
  saved?: number;
  results?: Record<string, { score: number; total: number; answered: number }>;
}

export interface PreviewScore {
  studentId: string;
  name: string;
  score: number;
  total: number;
  answered: number;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  deadline: string;
}

export interface HomeworkSubmission {
  studentId: string;
  name: string;
  fileName: string;
  size: number;
  key: string;
  // 缩略图 Blob key（上传时前端生成的小图）；老提交缺省 → 读图回退原图
  thumbKey?: string;
  contentType?: string;
  submittedAt: string;
  // 任务级作业标记（如 P4T1）；缺省 = P1T2 默认作业
  task?: string;
}

export interface Exercise {
  id: string;
  title: string;
  options: string[];
  // 答案仅存在于服务端；学生端获取题目时不下发
  answer?: number;
}

export interface ExerciseStat {
  exerciseId: string;
  title: string;
  // 教师大屏「公布答案」标位使用（来自服务端统计接口）
  answer?: number;
  correctRate: number;
  attempts: number;
  distribution: number[];
}

export interface ClassOverview {
  className: string;
  sessionTitle: string;
  studentCount: number;
  onlineCount: number;
  previewDone: number;
  homeworkSubmitted: number;
  exerciseAvg: number;
}

export interface TeacherEval {
  studentId: string;
  name: string;
  scores: Record<string, number>;
  comment: string;
  updatedAt: string;
}

// 小组评价：教师 / 企业 / AI 工具测评 三类，均为「6 个小组 × 4 个项目」打分（0–100）
export type EvalKind = "teacher" | "enterprise" | "ai";
export interface GroupEval {
  type: EvalKind;
  groupId: string;
  name: string;
  scores: Record<string, number>;
  comment: string;
  updatedAt: string;
}

// ===== 全过程测评（8 任务 × 课前/课中/课后）与学情分析 =====
export type Phase = "pre" | "mid" | "post";

export interface BankQuestion {
  id: string;
  title: string;
  options: string[];
  score: number;
  // 答案仅存在于服务端；前端题库（含 mock）不携带
}

export interface PhaseScore {
  studentId: string;
  name: string;
  taskId: string;
  phase: Phase;
  score: number;
  total: number;
  answered: number;
}

export interface StudentProfile {
  studentId: string;
  name: string;
  // 确定性随机头像：图标(emoji) + 渐变配色 + 短编号
  avatar: { glyph: string; color: string; from: string; to: string; code: string };
  rank: number;          // 班级掌握率排名
  total: number;         // 参与排名人数
  band: "待达标" | "基本掌握" | "熟练掌握";
  radarPre: number[];    // 五维能力（课前）
  radarPost: number[];   // 五维能力（课后）
  dims: { name: string; pre: number; post: number }[]; // 五维明细
  knowledge: { name: string; score: number }[];        // 关键知识项得分
  tasks: { id: string; title: string; pre: number; mid: number; post: number }[]; // 8 任务三阶段
  skills: { name: string; score: number }[];           // 8 关键技能掌握（课后测评）
  attendance: number;    // 出勤率
  interaction: number;   // 课堂互动次数
  homeworkDone: number;  // 作业提交数
  preAvg: number;
  postAvg: number;
  growth: number;
  completion: number;
  mastery: number;
  strengths: string[];   // 优势项
  weaknesses: string[];  // 待提升项
}

export interface ClassAnalytics {
  taskAvg: { id: string; title: string; avg: number; pre: number; mid: number; post: number }[];
  skills: { name: string; values: number[] }[];
  students: { id: string; name: string; pre: number; post: number }[];
  profiles: StudentProfile[];
}

export interface GraphStats {
  totalKnowledge: number;
  linkedKnowledge: number;
  masteryAvg: number;
  completionAvg: number;
  taskLink: { classroom: number; ideology: number; training: number; exam: number };
  cloud: { name: string; heat: number }[];
  bands: { label: string; value: number }[];
  students: { id: string; name: string; completion: number; mastery: number }[];
  knowledge: { id: string; name: string; type: string; mark: string; task: string; mastery: number; completion: number }[];
}
