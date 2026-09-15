import type {
  ClassOverview,
  EvalKind,
  Exercise,
  ExerciseStat,
  GroupEval,
  Homework,
  HomeworkSubmission,
  PreviewAnswer,
  PreviewQuestion,
  PreviewScore,
  PreviewSubmitResult,
  Student,
  TeacherEval,
} from "./types";
import { STUDENTS } from "./course";

// mock 数据惰性加载：只有 VITE_USE_MOCK=true 的离线演示才会拉取该 chunk，
// 生产构建中 USE_MOCK 为字面量 false，此动态 import 会被构建器消除，不进入产物。
const mockMod = () => import("./mock");

// 生产环境：EdgeOne 云函数与前端同源部署，走 /api 即可。
// 本地开发：vite 已把 /api 代理到本地 Node API（见 vite.config.ts）。
// VITE_USE_MOCK=true 时使用内置 mock 数据（离线演示）。
const BASE = (import.meta.env.VITE_API_BASE as string) || "/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

type MaybeLazy<T> = T | (() => T | Promise<T>);
const resolveFallback = async <T>(fb: MaybeLazy<T>): Promise<T> =>
  typeof fb === "function" ? await (fb as () => T | Promise<T>)() : fb;

async function get<T>(path: string, fallback: MaybeLazy<T>): Promise<T> {
  if (USE_MOCK) return structuredClone(await resolveFallback(fallback));
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

async function post<T, B = unknown>(path: string, body: B, fallback: MaybeLazy<T>): Promise<T> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return resolveFallback(fallback);
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
  // 学生（名单无敏感信息，可直接用 course.ts 数据）
  login: (studentId: string): Promise<Student | null> =>
    Promise.resolve(STUDENTS.find((s) => s.id === studentId) ?? null),

  listStudents: () => get<Student[]>("/students", STUDENTS),

  // 课前预习（题目与答案都在服务端；判分在服务端完成）
  getPreviewQuestions: () =>
    get<PreviewQuestion[]>("/preview/questions", async () =>
      (await mockMod()).previewQuestions
    ),
  getPreviewScores: () =>
    get<PreviewScore[]>("/preview/scores", async () =>
      (await mockMod()).mockPreviewScores()
    ),
  submitPreview: (answers: PreviewAnswer[]): Promise<PreviewSubmitResult> =>
    post("/preview/answers", answers, async () => {
      // 离线演示：mock 不含答案，按学号生成演示分数
      const m = await mockMod();
      const total = m.previewQuestions.reduce((s, q) => s + q.score, 0);
      const groups: Record<string, PreviewAnswer[]> = {};
      for (const a of answers) (groups[a.studentId] ||= []).push(a);
      const results: PreviewSubmitResult["results"] = {};
      for (const [sid, arr] of Object.entries(groups)) {
        const seed = Number(sid.slice(-3)) || 1;
        results[sid] = { score: 60 + (seed % 40), total, answered: arr.length };
      }
      return { ok: true, saved: Object.keys(groups).length, results };
    }),

  // 课中作业（图片走 Blob 预签名直传，元数据走 KV；仅 PNG/JPG 且 ≤5MB）
  getHomework: () =>
    get<Homework[]>("/homework", async () => (await mockMod()).homeworks),
  getHomeworkSubmissions: () =>
    get<HomeworkSubmission[]>("/homework/submissions", async () =>
      (await mockMod()).mockHomeworkSubmissions()
    ),
  getHomeworkUploadUrl: (payload: {
    studentId: string;
    fileName: string;
    contentType: string;
    size: number;
  }) =>
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
      name: STUDENTS.find((s) => s.id === meta.studentId)?.name || meta.studentId,
      submittedAt: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }),

  // 课后习题（答案不下发；正确率统计含答案标位，供教师大屏公布）
  getExercises: () =>
    get<Exercise[]>("/exercises", async () => (await mockMod()).exercises),
  getExerciseStats: () =>
    get<ExerciseStat[]>("/exercises/stats", async () =>
      (await mockMod()).mockExerciseStats()
    ),
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
  getOverview: () =>
    get<ClassOverview>("/overview", async () => (await mockMod()).mockOverview()),

  // 教师评价
  getEvaluations: () => get<TeacherEval[]>("/evaluations", []),
  saveEvaluation: (e: { studentId: string; scores: Record<string, number>; comment: string }) =>
    post<TeacherEval>("/evaluations", e, {
      studentId: e.studentId,
      name: STUDENTS.find((s) => s.id === e.studentId)?.name || e.studentId,
      scores: e.scores,
      comment: e.comment,
      updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    }),

  // 小组评价（教师 / 企业 / AI 工具测评，均为小组 × 4 项目打分）
  getGroupEvals: (type: EvalKind) =>
    get<GroupEval[]>(`/group-evals?type=${type}`, []),
  saveGroupEval: (e: Omit<GroupEval, "updatedAt">) =>
    post<GroupEval>("/group-evals", e, {
      ...e,
      updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    }),
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
