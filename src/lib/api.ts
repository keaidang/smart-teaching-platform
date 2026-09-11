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

async function post<T, B = unknown>(path: string, body: B, fallback: T): Promise<T> {
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

  // 课中作业（图片走 Blob 预签名直传，元数据走 KV）
  getHomework: () => get<Homework[]>("/homework", homeworks),
  getHomeworkSubmissions: () =>
    get<HomeworkSubmission[]>("/homework/submissions", mockHomeworkSubmissions()),
  getHomeworkUploadUrl: (payload: { studentId: string; fileName: string; contentType: string }) =>
    post<{ url: string; key: string; expiresAt: number }>(
      "/homework/upload-url",
      payload,
      {
        url: "",
        key: `hw/${payload.studentId}/${Date.now()}-${payload.fileName}`,
        expiresAt: 0,
      }
    ),
  submitHomeworkMeta: (meta: {
    studentId: string;
    fileName: string;
    size: number;
    key: string;
    contentType: string;
  }) =>
    post<HomeworkSubmission>("/homework/submissions", meta, {
      ...meta,
      name: students.find((s) => s.id === meta.studentId)?.name || meta.studentId,
      submittedAt: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }),

  // 课后习题
  getExercises: () => get<Exercise[]>("/exercises", exercises),
  getExerciseStats: () =>
    get<ExerciseStat[]>("/exercises/stats", mockExerciseStats()),
  submitExercise: (answers: { studentId: string; exerciseId: string; selected: number }[]) =>
    post("/exercises/answers", answers, { ok: true }),

  // 大屏概览
  getOverview: () => get<ClassOverview>("/overview", mockOverview()),
};
