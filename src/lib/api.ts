import type {
  ClassOverview,
  Exercise,
  ExerciseStat,
  Homework,
  HomeworkSubmission,
  PreviewAnswer,
  PreviewQuestion,
  PreviewScore,
  Student,
} from "./types";
import {
  exercises,
  homeworks,
  mockExerciseStats,
  mockHomeworkSubmissions,
  mockOverview,
  mockPreviewScores,
  previewQuestions,
  students,
} from "./mock";

// 生产环境：EdgeOne 云函数与前端同源部署，走 /api 即可。
// 本地开发：vite 已把 /api 代理到本地 Node API（见 vite.config.ts）。
// VITE_USE_MOCK=true 时使用内置 mock 数据（离线演示）。
const BASE = (import.meta.env.VITE_API_BASE as string) || "/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

async function get<T>(path: string, fallback: T): Promise<T> {
  if (USE_MOCK) return structuredClone(fallback);
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

async function post<T, B>(path: string, body: B, fallback: T): Promise<T> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return fallback;
  }
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

export const api = {
  // 学生
  login: (studentId: string): Promise<Student | null> =>
    Promise.resolve(students.find((s) => s.id === studentId) ?? null),

  listStudents: () => get<Student[]>("/students", students),

  // 课前预习
  getPreviewQuestions: () =>
    get<PreviewQuestion[]>("/preview/questions", previewQuestions),
  getPreviewScores: () => get<PreviewScore[]>("/preview/scores", mockPreviewScores()),
  submitPreview: (answers: PreviewAnswer[]) =>
    post("/preview/answers", answers, { ok: true }),

  // 课中作业
  getHomework: () => get<Homework[]>("/homework", homeworks),
  getHomeworkSubmissions: () =>
    get<HomeworkSubmission[]>("/homework/submissions", mockHomeworkSubmissions()),
  // 真实上传：先 PUT 到 WebDAV，再把元数据 POST 到 Function 落库
  submitHomeworkMeta: (meta: Omit<HomeworkSubmission, "id">) =>
    post("/homework/submissions", meta, { ...meta, id: `SUB${Date.now()}` }),

  // 课后习题
  getExercises: () => get<Exercise[]>("/exercises", exercises),
  getExerciseStats: () =>
    get<ExerciseStat[]>("/exercises/stats", mockExerciseStats()),
  submitExercise: (answers: { studentId: string; exerciseId: string; selected: number }[]) =>
    post("/exercises/answers", answers, { ok: true }),

  // 大屏概览
  getOverview: () => get<ClassOverview>("/overview", mockOverview()),
};
