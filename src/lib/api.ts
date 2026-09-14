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

  // 在线心跳
  pingPresence: (studentId: string) =>
    post("/presence", { studentId }, { ok: true }),

  // AI 问答（阿里通义千问，流式）
  aiChatStream: async (
    messages: { role: string; content: string }[],
    onEvent: (e: { type: "reasoning" | "content" | "done" | "error"; text?: string }) => void
  ) => {
    if (USE_MOCK) {
      const mock =
        "【离线演示】部署到 EdgeOne 后，我会基于《信息采集技术》课程内容（Python 数据采集、传感器、爬虫、清洗融合、可视化、数据合规）**流式**作答，并展示思考过程。";
      for (const ch of mock) {
        onEvent({ type: "content", text: ch });
        await new Promise((r) => setTimeout(r, 18));
      }
      onEvent({ type: "done" });
      return;
    }
    const res = await fetch(`${BASE}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok || !res.body) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = j.error || j.detail || msg;
      } catch {
        /* ignore */
      }
      onEvent({ type: "error", text: String(msg) });
      onEvent({ type: "done" });
      return;
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          onEvent({ type: "done" });
          return;
        }
        try {
          const j = JSON.parse(data);
          const delta = j.choices?.[0]?.delta || {};
          if (delta.reasoning_content) onEvent({ type: "reasoning", text: delta.reasoning_content });
          if (delta.content) onEvent({ type: "content", text: delta.content });
        } catch {
          /* partial json, ignore */
        }
      }
    }
    onEvent({ type: "done" });
  },

  // 大屏概览
  getOverview: () => get<ClassOverview>("/overview", mockOverview()),
};

// ---------- 管理端（始终走真实后端，不受 mock 影响） ----------
async function adminReq<T>(path: string, method: "GET" | "POST", key: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", "x-admin-key": key },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export interface AdminStats {
  studentCount: number;
  previewDone: number;
  homeworkSubmitted: number;
  exerciseDone: number;
  online: number;
}

export const adminApi = {
  stats: (key: string) => adminReq<AdminStats>("/admin/stats", "GET", key),
  resetSubmissions: (key: string) =>
    adminReq<{ ok: boolean; deleted: number }>("/admin/reset-submissions", "POST", key),
  clearBlob: (key: string) =>
    adminReq<{ ok: boolean; deleted: number }>("/admin/clear-blob", "POST", key),
  resetAll: (key: string) =>
    adminReq<{ ok: boolean; kvDeleted: number; blobDeleted: number }>("/admin/reset-all", "POST", key),
  reseed: (key: string) =>
    adminReq<{ ok: boolean; deleted: number; students: number }>("/reseed", "POST", key),
};
