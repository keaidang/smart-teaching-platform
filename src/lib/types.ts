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
  answer: number;
  score: number;
}

export interface PreviewAnswer {
  studentId: string;
  questionId: string;
  selected: number;
  correct: boolean;
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
  answer: number;
}

export interface ExerciseStat {
  exerciseId: string;
  title: string;
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
