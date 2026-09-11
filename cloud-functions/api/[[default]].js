import { getStore } from "@edgeone/pages-blob";

// 两个 store：class = KV 数据；homework = 作业图片二进制。名字可用环境变量覆盖。
const KV = getStore(process.env.KV_STORE || "class");
const FILES = getStore(process.env.BLOB_STORE || "homework");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8", ...CORS },
  });
const nowHM = () =>
  new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  });

const rj = (key) => KV.get(key, { type: "json", consistency: "strong" });
const wj = (key, val) => KV.setJSON(key, val);
const listKeys = async (prefix) => {
  const { blobs } = await KV.list({ prefix, consistency: "strong" });
  return blobs.map((b) => b.key);
};

// ---------- 种子数据（定义类，首次访问自动写入）----------
const NAMES = ["陈嘉怡","李思远","王雨萱","张浩然","刘梦琪","黄俊杰","周欣妍","吴子轩","徐若曦","孙铭泽","胡静雯","朱天宇","林思彤","何俊豪","郑雅雯","罗子墨","高雨欣","梁浩宇","谢佳琪","宋明轩"];
const COLORS = ["#22d3ee","#34d399","#a78bfa","#f472b6","#fbbf24","#60a5fa","#f87171","#4ade80"];
const SEED_STUDENTS = NAMES.map((name, i) => ({ id: `S${String(i + 1).padStart(3, "0")}`, name, avatarColor: COLORS[i % COLORS.length], classId: "C-2401" }));
const SEED_PQ = [
  { id: "PQ1", title: "在数字绘画软件中，图层混合模式「正片叠底」的主要作用是？", options: ["整体提亮画面", "保留暗部、滤除亮部，用于画阴影", "让颜色完全反相", "锁定图层不被编辑"], answer: 1, score: 25 },
  { id: "PQ2", title: "RGB 色彩模式中，三种基色指的是？", options: ["红黄蓝", "红绿蓝", "青品黄", "黑白灰"], answer: 1, score: 25 },
  { id: "PQ3", title: "使用 Stable Diffusion 生成图像时，CFG Scale 数值越大表示？", options: ["越贴近提示词、自由度越低", "越随机、越脱离提示词", "分辨率越高", "生成速度越快"], answer: 0, score: 25 },
  { id: "PQ4", title: "矢量图相对于位图的最大优势是？", options: ["色彩更丰富", "放大不失真", "文件一定更小", "只支持黑白"], answer: 1, score: 25 },
];
const SEED_EX = [
  { id: "EX1", title: "完成一张作品后，导出用于印刷应优先选择的色彩模式是？", options: ["RGB", "CMYK", "HSL", "LAB"], answer: 1 },
  { id: "EX2", title: "在 AI 绘图工作流中，ControlNet 主要用于？", options: ["压缩文件体积", "对生成结果施加结构与姿态控制", "提高显卡温度", "转换字体格式"], answer: 1 },
  { id: "EX3", title: "下列哪项最能提升画面的视觉焦点？", options: ["均匀铺色", "明暗与虚实对比", "全部使用高饱和", "取消透视"], answer: 1 },
];
const SEED_HW = { id: "HW1", title: "《赛博城市》主题数字插画", description: "运用本节课所学图层与光影知识，完成一张 1920×1080 主题插画，提交 PNG。", deadline: "今日 16:30" };

let seeded = false;
async function ensureSeed() {
  if (seeded) return;
  const s = await rj("students");
  if (!s) {
    await wj("students", SEED_STUDENTS);
    await wj("preview:questions", SEED_PQ);
    await wj("exercises", SEED_EX);
    await wj("homework", SEED_HW);
  }
  seeded = true;
}
async function students() { return (await rj("students")) || []; }

// ---------- 路由 ----------
export async function onRequest(context) {
  const { request } = context;
  const method = request.method;
  const url = new URL(request.url);
  let path = url.pathname.replace(/^\/api/, "");
  if (!path.startsWith("/")) path = "/" + path;

  if (method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    await ensureSeed();

    if (path === "/health") return json({ ok: true, kv: process.env.KV_STORE || "class", blob: process.env.BLOB_STORE || "homework" });

    // 学生
    if (path === "/students" && method === "GET") return json(await students());

    // 大屏概览
    if (path === "/overview" && method === "GET") {
      const st = await students();
      const pvKeys = await listKeys("preview:answer:");
      const hwKeys = await listKeys("homework:sub:");
      const exKeys = await listKeys("exercise:answer:");
      let correct = 0, total = 0;
      for (const k of exKeys) {
        const doc = await rj(k);
        for (const a of doc?.answers || []) { total++; if (a.correct) correct++; }
      }
      return json({
        className: "数字媒体 2401 班",
        sessionTitle: "第 7 讲 · AI 辅助数字插画创作",
        studentCount: st.length,
        onlineCount: new Set([...pvKeys, ...hwKeys].map((k) => k.split(":").pop())).size,
        previewDone: pvKeys.length,
        homeworkSubmitted: hwKeys.length,
        exerciseAvg: total ? Math.round((correct / total) * 100) : 0,
      });
    }

    // 课前预习
    if (path === "/preview/questions" && method === "GET") return json(await rj("preview:questions"));
    if (path === "/preview/scores" && method === "GET") {
      const keys = await listKeys("preview:answer:");
      const rows = [];
      for (const k of keys) { const d = await rj(k); if (d) rows.push(d); }
      rows.sort((a, b) => b.score - a.score || b.answered - a.answered);
      return json(rows.map((r) => ({ ...r, total: 100 })));
    }
    if (path === "/preview/answers" && method === "POST") {
      const list = await request.json();
      const qs = await rj("preview:questions");
      const qmap = Object.fromEntries(qs.map((q) => [q.id, q]));
      const st = await students();
      const byId = Object.fromEntries(st.map((s) => [s.id, s]));
      const groups = {};
      for (const a of list) (groups[a.studentId] ||= []).push(a);
      for (const [sid, arr] of Object.entries(groups)) {
        let score = 0; const answers = [];
        for (const a of arr) {
          const q = qmap[a.questionId]; if (!q) continue;
          const correct = Number(a.selected) === Number(q.answer);
          if (correct) score += q.score;
          answers.push({ questionId: a.questionId, selected: a.selected, correct });
        }
        await wj(`preview:answer:${sid}`, {
          studentId: sid, name: byId[sid]?.name || sid, score, answered: answers.length,
        });
      }
      return json({ ok: true, saved: Object.keys(groups).length });
    }

    // 课中作业
    if (path === "/homework" && method === "GET") return json([await rj("homework")]);
    if (path === "/homework/submissions" && method === "GET") {
      const keys = await listKeys("homework:sub:");
      const rows = [];
      for (const k of keys) { const d = await rj(k); if (d) rows.push(d); }
      return json(rows);
    }
    if (path === "/homework/upload-url" && method === "POST") {
      const { studentId, fileName, contentType } = await request.json();
      const safe = String(fileName || "upload").replace(/[^\w.\-\u4e00-\u9fa5]/g, "_");
      const key = `hw/${studentId}/${Date.now()}-${safe}`;
      const { url: putUrl, expiresAt } = await FILES.createUploadUrl(key, {
        contentType: contentType || "application/octet-stream",
        expireSeconds: 3600,
      });
      return json({ url: putUrl, key, expiresAt });
    }
    if (path === "/homework/submissions" && method === "POST") {
      const m = await request.json();
      const st = await students();
      const byId = Object.fromEntries(st.map((s) => [s.id, s]));
      const meta = {
        studentId: m.studentId, name: byId[m.studentId]?.name || m.studentId,
        fileName: m.fileName, size: Number(m.size) || 0, key: m.key,
        contentType: m.contentType || "image/png", submittedAt: nowHM(),
      };
      await wj(`homework:sub:${m.studentId}`, meta);
      return json(meta, 201);
    }
    if (path.startsWith("/homework/file") && method === "GET") {
      const sid = url.searchParams.get("sid");
      if (!sid) return json({ error: "sid required" }, 400);
      const meta = await rj(`homework:sub:${sid}`);
      if (!meta?.key) return new Response("not found", { status: 404, headers: CORS });
      const buf = await FILES.get(meta.key, { type: "arrayBuffer", consistency: "strong" });
      if (!buf) return new Response("not found", { status: 404, headers: CORS });
      return new Response(buf, { headers: { "Content-Type": meta.contentType || "image/png", "Cache-Control": "no-cache", ...CORS } });
    }

    // 课后习题
    if (path === "/exercises" && method === "GET") return json(await rj("exercises"));
    if (path === "/exercises/stats" && method === "GET") {
      const exs = await rj("exercises");
      const keys = await listKeys("exercise:answer:");
      const stats = exs.map((e) => ({ exerciseId: e.id, title: e.title, options: e.options, answer: e.answer, attempts: 0, correctCount: 0, distribution: e.options.map(() => 0) }));
      const smap = Object.fromEntries(stats.map((s) => [s.exerciseId, s]));
      for (const k of keys) {
        const doc = await rj(k);
        for (const a of doc?.answers || []) {
          const s = smap[a.exerciseId]; if (!s) continue;
          s.attempts++; if (a.correct) s.correctCount++;
          s.distribution[a.selected] = (s.distribution[a.selected] || 0) + 1;
        }
      }
      return json(stats.map((s) => ({ exerciseId: s.exerciseId, title: s.title, correctRate: s.attempts ? Math.round((s.correctCount / s.attempts) * 100) : 0, attempts: s.attempts, distribution: s.distribution })));
    }
    if (path === "/exercises/answers" && method === "POST") {
      const list = await request.json();
      const exs = await rj("exercises");
      const emap = Object.fromEntries(exs.map((e) => [e.id, e]));
      const groups = {};
      for (const a of list) (groups[a.studentId] ||= []).push(a);
      for (const [sid, arr] of Object.entries(groups)) {
        const answers = [];
        for (const a of arr) {
          const e = emap[a.exerciseId]; if (!e) continue;
          answers.push({ exerciseId: a.exerciseId, selected: a.selected, correct: Number(a.selected) === Number(e.answer) });
        }
        await wj(`exercise:answer:${sid}`, { studentId: sid, answers });
      }
      return json({ ok: true, saved: Object.keys(groups).length });
    }

    return json({ error: "not found", path }, 404);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
}
