import { getStore } from "@edgeone/pages-blob";

// 两个 store：class = KV 数据；homework = 作业图片二进制。名字可用环境变量覆盖。
const KV = getStore(process.env.KV_STORE || "class");
const FILES = getStore(process.env.BLOB_STORE || "homework");

// 阿里 DashScope（通义千问）—— 兼容 OpenAI 协议
const DASHSCOPE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const QWEN_MODEL = process.env.QWEN_MODEL || "qwen3.8-flash";

// 管理端密钥（重置/播种等敏感操作）
const ADMIN_KEY = process.env.ADMIN_KEY || "admin";

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
  new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" });

const rj = (key) => KV.get(key, { type: "json", consistency: "strong" });
const wj = (key, val) => KV.setJSON(key, val);
const listKeys = async (prefix) => {
  const { blobs } = await KV.list({ prefix, consistency: "strong" });
  return blobs.map((b) => b.key);
};

// ---------- 课程：数智社区 · 信息采集 —— 当前任务：传感与视觉数据清洗 ----------
const ROSTER = [["20241216501","孙天一"],["20241216502","王英杰"],["20241216503","马彦如"],["20241216504","杨诗意"],["20241216505","龚宸宇"],["20241216506","张昊祯"],["20241216507","金亮"],["20241216508","朱羿菲"],["20241216509","顾严天保"],["20241216510","陈迎冉"],["20241216511","顾保睿"],["20241216512","公俊超"],["20241216513","姚晨俊"],["20241216514","赵浩宇"],["20241216515","包杨睿"],["20241216516","汤宇轩"],["20241216517","龚皓林"],["20241216518","裴申宇"],["20241216519","黄杨萌"],["20241216520","宋子娴"],["20241216521","葛子骏"],["20241216522","刘佳鑫"],["20241216523","郑智童"],["20241216524","张哲"],["20241216525","周国栋"],["20241216526","张郁贤"]];
const COLORS = ["#22d3ee","#34d399","#a78bfa","#f472b6","#fbbf24","#60a5fa","#f87171","#4ade80"];
const SEED_STUDENTS = ROSTER.map(([id, name], i) => ({ id, name, avatarColor: COLORS[i % COLORS.length], classId: "C-2412" }));

// 课前预习题（传感与视觉数据清洗，带 lesson/kp/dim 标签）
const SEED_PQ = [
  { id: "PQ1", lesson: "L3", kp: "kp7", dim: "能力", title: "多源传感数据融合前，首先要做的是？", options: ["直接求平均", "时间戳对齐与统一采样频率", "删除所有异常值", "转成图片"], answer: 1, score: 25 },
  { id: "PQ2", lesson: "L3", kp: "kp7", dim: "能力", title: "检测数值型异常值常用的统计方法是？", options: ["3σ / IQR 准则", "冒泡排序", "字典序", "哈希"], answer: 0, score: 25 },
  { id: "PQ3", lesson: "L3", kp: "kp7", dim: "知识", title: "图像去噪中，中值滤波特别擅长去除？", options: ["高斯噪声", "椒盐噪声", "运动模糊", "JPEG 压缩"], answer: 1, score: 25 },
  { id: "PQ4", lesson: "L3", kp: "kp10", dim: "能力", title: "点云清洗中去除离群点常用？", options: ["统计/半径滤波", "锐化", "直方图均衡", "灰度化"], answer: 0, score: 25 },
];

// 课后知识点问答题（传感与视觉数据清洗）
const SEED_EX = [
  { id: "EX1", lesson: "L3", kp: "kp7", dim: "能力", title: "连续型缺失值最稳妥的处理方式是？", options: ["一律删除整行", "按分布做均值/中位数插补", "填 0", "随机填充"], answer: 1 },
  { id: "EX2", lesson: "L3", kp: "kp8", dim: "能力", title: "点云与图像配准对齐的关键是？", options: ["统一时间/空间与内外参标定", "都转成 CSV", "提高分辨率", "增加颜色"], answer: 0 },
  { id: "EX3", lesson: "L3", kp: "kp11", dim: "素养", title: "数据清洗记录‘数据质量报告’的主要意义是？", options: ["应付检查", "可追溯、保证工程规范与质量", "拖慢进度", "没有意义"], answer: 1 },
  { id: "EX4", lesson: "L3", kp: "kp12", dim: "素养", title: "采集含人脸的视觉数据，清洗时应注意？", options: ["公开传播", "隐私脱敏与合规", "长期留存原图", "随意标注"], answer: 1 },
];

const SEED_HW = { id: "HW-P2T2", title: "传感与视觉数据清洗成果", description: "提交清洗后的数据集（CSV）与数据质量说明（截图/图表），体现时间对齐、缺失/异常处理、图像去噪与点云滤波、格式归一化流程。", deadline: "今日 16:30" };

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

async function onlineStudents() {
  const keys = await listKeys("presence:");
  const now = Date.now();
  const ids = [];
  for (const k of keys) {
    const d = await rj(k);
    if (d && now - Number(d.ts) <= 60000) ids.push(d.studentId || k.split(":").pop());
  }
  return { ids };
}

// ---------- AI 问答系统提示词（导入课程介绍，限定答题范围）----------
const COURSE_SYSTEM_PROMPT = `你是《信息采集技术》课程的 AI 助学助手，本项目的主题是“城市‘小微区域’环境与设施数据智能采集”，以 Python 数据采集为核心。
课程围绕数据生命周期四阶段展开：
1) 需求确定与方案设计（采集指标、场景调研）；
2) 传感部署与采集开发（多源传感器选型部署、pyserial 串口采集、网络爬虫、采集硬件配置）；
3) 数据清洗与融合分析（缺失/异常处理、多源数据对齐融合）；
4) 可视化构建与工程验收（图表选型、可视化应用、工程规范与复盘）。
同时强调数据伦理、隐私脱敏、合规采集、规范意识与工匠精神。

请遵守以下规则：
- 只回答与本课程内容（Python 数据采集、传感器、爬虫、数据清洗融合、可视化、工程规范、数据合规）相关的问题；
- 回答要贴合职业院校学生水平，条理清晰、可操作，适当给出 Python 代码或方法示例；
- 若学生问题超出课程范围，请礼貌说明并引导回到课程主题；
- 不要编造与课程无关的内容。`;

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

    if (path === "/health") return json({ ok: true, kv: process.env.KV_STORE || "class", blob: process.env.BLOB_STORE || "homework", ai: !!process.env.DASHSCOPE_API_KEY });

    // 管理端：统计 / 重置提交记录（保留名单）/ 重播种（名单+题目）
    const authorized = () => {
      const k = url.searchParams.get("key") || request.headers.get("x-admin-key");
      return k === ADMIN_KEY;
    };

    if (path === "/admin/stats" && method === "GET") {
      if (!authorized()) return json({ error: "forbidden" }, 403);
      const st = await students();
      const pv = await listKeys("preview:answer:");
      const hw = await listKeys("homework:sub:");
      const ex = await listKeys("exercise:answer:");
      const online = await onlineStudents();
      return json({
        studentCount: st.length,
        previewDone: pv.length,
        homeworkSubmitted: hw.length,
        exerciseDone: ex.length,
        online: online.ids.length,
      });
    }

    if (path === "/admin/reset-submissions" && method === "POST") {
      if (!authorized()) return json({ error: "forbidden" }, 403);
      const keep = new Set(["students", "preview:questions", "exercises", "homework"]);
      const all = await KV.list({ consistency: "strong" });
      let deleted = 0;
      for (const b of all.blobs) {
        if (keep.has(b.key)) continue;
        try { await KV.delete(b.key); deleted++; } catch { /* ignore */ }
      }
      return json({ ok: true, deleted, kept: [...keep] });
    }

    if (path === "/admin/clear-blob" && method === "POST") {
      if (!authorized()) return json({ error: "forbidden" }, 403);
      const all = await FILES.list({ consistency: "strong" });
      let deleted = 0;
      for (const b of all.blobs) {
        try { await FILES.delete(b.key); deleted++; } catch { /* ignore */ }
      }
      return json({ ok: true, deleted });
    }

    if (path === "/admin/reset-all" && method === "POST") {
      if (!authorized()) return json({ error: "forbidden" }, 403);
      const keep = new Set(["students", "preview:questions", "exercises", "homework"]);
      const all = await KV.list({ consistency: "strong" });
      let kvDeleted = 0;
      for (const b of all.blobs) {
        if (keep.has(b.key)) continue;
        try { await KV.delete(b.key); kvDeleted++; } catch { /* ignore */ }
      }
      const files = await FILES.list({ consistency: "strong" });
      let blobDeleted = 0;
      for (const b of files.blobs) {
        try { await FILES.delete(b.key); blobDeleted++; } catch { /* ignore */ }
      }
      return json({ ok: true, kvDeleted, blobDeleted });
    }

    if (path === "/reseed" && method === "POST") {
      if (!authorized()) return json({ error: "forbidden" }, 403);
      const all = await KV.list({ consistency: "strong" });
      let deleted = 0;
      for (const b of all.blobs) { try { await KV.delete(b.key); deleted++; } catch { /* ignore */ } }
      await wj("students", SEED_STUDENTS);
      await wj("preview:questions", SEED_PQ);
      await wj("exercises", SEED_EX);
      await wj("homework", SEED_HW);
      seeded = true;
      return json({ ok: true, deleted, students: SEED_STUDENTS.length, preview: SEED_PQ.length, exercises: SEED_EX.length });
    }

    if (path === "/students" && method === "GET") return json(await students());

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
      const online = await onlineStudents();
      return json({
        className: "2465 人工智能",
        sessionTitle: "任务：传感与视觉数据清洗",
        studentCount: st.length,
        onlineCount: online.ids.length,
        previewDone: pvKeys.length,
        homeworkSubmitted: hwKeys.length,
        exerciseAvg: total ? Math.round((correct / total) * 100) : 0,
      });
    }

    // 在线心跳（学生端每 ~20s 调用；近 60s 有心跳 = 在线）
    if (path === "/presence" && method === "POST") {
      const { studentId } = await request.json();
      if (!studentId) return json({ error: "studentId required" }, 400);
      await wj(`presence:${studentId}`, { studentId, ts: Date.now() });
      return json({ ok: true, ts: Date.now() });
    }
    if (path === "/presence" && method === "GET") {
      const online = await onlineStudents();
      return json({ onlineCount: online.ids.length, ids: online.ids });
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
      const byId = Object.fromEntries((await students()).map((s) => [s.id, s]));
      const groups = {};
      for (const a of list) (groups[a.studentId] ||= []).push(a);
      for (const [sid, arr] of Object.entries(groups)) {
        let score = 0; const answers = [];
        for (const a of arr) {
          const q = qmap[a.questionId]; if (!q) continue;
          const correct = Number(a.selected) === Number(q.answer);
          if (correct) score += q.score;
          answers.push({ questionId: a.questionId, lesson: q.lesson, kp: q.kp, dim: q.dim, selected: a.selected, correct });
        }
        await wj(`preview:answer:${sid}`, { studentId: sid, name: byId[sid]?.name || sid, score, answered: answers.length, answers });
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
      const safe = String(fileName || "upload").replace(/[^\w.\-一-龥]/g, "_");
      const key = `hw/${studentId}/${Date.now()}-${safe}`;
      const { url: putUrl, expiresAt } = await FILES.createUploadUrl(key, { contentType: contentType || "application/octet-stream", expireSeconds: 3600 });
      return json({ url: putUrl, key, expiresAt });
    }
    if (path === "/homework/submissions" && method === "POST") {
      const m = await request.json();
      const byId = Object.fromEntries((await students()).map((s) => [s.id, s]));
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

    // 课后知识点问答
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
          answers.push({ exerciseId: a.exerciseId, lesson: e.lesson, kp: e.kp, dim: e.dim, selected: a.selected, correct: Number(a.selected) === Number(e.answer) });
        }
        await wj(`exercise:answer:${sid}`, { studentId: sid, answers });
      }
      return json({ ok: true, saved: Object.keys(groups).length });
    }

    // 教师评价（4 维度打分 + 评语），存 KV
    if (path === "/evaluations" && method === "GET") {
      const keys = await listKeys("teacher-eval:");
      const rows = [];
      for (const k of keys) { const d = await rj(k); if (d) rows.push(d); }
      return json(rows);
    }
    if (path === "/evaluations" && method === "POST") {
      const m = await request.json();
      const byId = Object.fromEntries((await students()).map((s) => [s.id, s]));
      const doc = {
        studentId: m.studentId,
        name: byId[m.studentId]?.name || m.studentId,
        scores: m.scores || {},
        comment: m.comment || "",
        updatedAt: nowHM(),
      };
      await wj(`teacher-eval:${m.studentId}`, doc);
      return json(doc, 201);
    }

    // AI 问答（阿里通义千问 qwen，SSE 流式透传 + 思维链）
    if (path === "/ai/chat" && method === "POST") {
      const key = process.env.DASHSCOPE_API_KEY;
      if (!key) return json({ error: "AI 未配置：请在 EdgeOne 环境变量中设置 DASHSCOPE_API_KEY" }, 503);
      const body = await request.json();
      const history = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
      const upstream = await fetch(DASHSCOPE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: QWEN_MODEL,
          messages: [{ role: "system", content: COURSE_SYSTEM_PROMPT }, ...history],
          temperature: 0.7,
          stream: true,
          stream_options: { include_usage: true },
          enable_thinking: true,
        }),
      });
      if (!upstream.ok || !upstream.body) {
        const t = await upstream.text().catch(() => "");
        return json({ error: "AI 调用失败", status: upstream.status, detail: t }, 502);
      }
      return new Response(upstream.body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
          ...CORS,
        },
      });
    }

    return json({ error: "not found", path }, 404);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
}
