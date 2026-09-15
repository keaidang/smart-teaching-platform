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
  contentType?: string;
  submittedAt: string;
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
