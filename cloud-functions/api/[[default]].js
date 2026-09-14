import { getStore } from "@edgeone/pages-blob";

// 两个 store：class = KV 数据；homework = 作业图片二进制。名字可用环境变量覆盖。
const KV = getStore(process.env.KV_STORE || "class");
const FILES = getStore(process.env.BLOB_STORE || "homework");

// 阿里 DashScope（通义千问）—— 兼容 OpenAI 协议
const DASHSCOPE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const QWEN_MODEL = process.env.QWEN_MODEL || "qwen3.8-flash";

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

// ---------- 课程：信息采集技术 · 城市“小微区域”环境与设施数据智能采集 ----------
const NAMES = ["王梓涵","李宇轩","张欣怡","刘浩然","陈雨桐","杨俊杰","黄梦琪","赵子墨","周佳怡","吴天佑","徐诗琪","孙晨曦","马若曦","朱一鸣","胡嘉豪","郭雅婷","何睿哲","高可欣","林博文","郑静宜","谢志强","罗晓彤","梁文博","宋佳琪","唐泽宇","许安琪","韩立诚","冯悦溪","邓铭轩","曹乐萱","王宏毅","李思远"];
const COLORS = ["#22d3ee","#34d399","#a78bfa","#f472b6","#fbbf24","#60a5fa","#f87171","#4ade80"];
const SEED_STUDENTS = NAMES.map((name, i) => ({ id: `S${String(i + 1).padStart(2, "0")}`, name, avatarColor: COLORS[i % COLORS.length], classId: "C-2402" }));

// 课前预习题（带 lesson/kp/dim 标签，供达成度看板融合）
const SEED_PQ = [
  { id: "PQ1", lesson: "L1", kp: "kp1", dim: "知识", title: "开展城市小微区域数据采集，首先应完成的工作是？", options: ["直接编写爬虫", "确定采集需求与设计方案", "购买服务器", "绘制可视化大屏"], answer: 1, score: 25 },
  { id: "PQ2", lesson: "L1", kp: "kp2", dim: "知识", title: "下列哪项不属于常见的环境类采集指标？", options: ["温度", "湿度", "PM2.5", "股票价格"], answer: 3, score: 25 },
  { id: "PQ3", lesson: "L2", kp: "kp3", dim: "知识", title: "Python 中读取串口传感器数据最常用的库是？", options: ["pyserial", "requests", "flask", "numpy"], answer: 0, score: 25 },
  { id: "PQ4", lesson: "L2", kp: "kp5", dim: "能力", title: "多传感器部署时，首要应考虑的是？", options: ["外观颜色", "采样频率与供电/网络稳定性", "品牌知名度", "价格最低"], answer: 1, score: 25 },
  { id: "PQ5", lesson: "L3", kp: "kp7", dim: "能力", title: "数据清洗中处理连续型缺失值常用方法是？", options: ["直接删除全部数据", "均值/中位数插补", "随机填充", "不做处理"], answer: 1, score: 25 },
  { id: "PQ6", lesson: "L4", kp: "kp9", dim: "能力", title: "展示各区域设施数量占比，最合适的图表是？", options: ["折线图", "饼图/环形图", "散点图", "词云"], answer: 1, score: 25 },
];

// 课后知识点问答题（带标签）
const SEED_EX = [
  { id: "EX1", lesson: "L1", kp: "kp11", dim: "素养", title: "在公共区域采集数据时，首先应遵守的是？", options: ["采集越多越好", "合法合规与隐私保护", "只追求精度", "无需告知"], answer: 1 },
  { id: "EX2", lesson: "L3", kp: "kp6", dim: "能力", title: "网络爬虫遵守 robots 协议与频控，主要目的是？", options: ["提高抓取速度", "尊重站点规则、降低服务器压力", "绕过反爬", "隐藏身份"], answer: 1 },
  { id: "EX3", lesson: "L3", kp: "kp8", dim: "能力", title: "多源数据融合对齐的关键在于？", options: ["统一时间/空间与字段口径", "全部转成图片", "删除异常值", "只保留一个来源"], answer: 0 },
  { id: "EX4", lesson: "L3", kp: "kp12", dim: "素养", title: "涉及个人信息的数据，采集后应做？", options: ["公开共享", "脱敏处理", "长期留存", "随意转发"], answer: 1 },
  { id: "EX5", lesson: "L4", kp: "kp2", dim: "知识", title: "数据可视化三要素不包括？", options: ["数据", "视觉编码", "交互/语境", "服务器型号"], answer: 3 },
  { id: "EX6", lesson: "L4", kp: "kp10", dim: "能力", title: "工程验收环节通常不包括？", options: ["数据质量核验", "方案复盘", "随手删除原始数据", "成果演示"], answer: 2 },
];

const SEED_HW = { id: "HW1", title: "城市小微区域环境与设施数据采集成果", description: "提交本次任务的采集数据集（CSV）与采集方案说明（PNG/文档截图），体现需求-采集-清洗-可视化流程。", deadline: "今日 16:30" };

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
        className: "计算机应用技术 2024 级 2 班",
        sessionTitle: "城市“小微区域”环境与设施数据智能采集",
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

    // AI 问答（阿里通义千问 qwen）
    if (path === "/ai/chat" && method === "POST") {
      const key = process.env.DASHSCOPE_API_KEY;
      if (!key) return json({ error: "AI 未配置：请在 EdgeOne 环境变量中设置 DASHSCOPE_API_KEY" }, 503);
      const body = await request.json();
      const history = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
      const upstream = await fetch(DASHSCOPE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: QWEN_MODEL,
          messages: [{ role: "system", content: COURSE_SYSTEM_PROMPT }, ...history],
          temperature: 0.7,
        }),
      });
      const data = await upstream.json();
      if (!upstream.ok) return json({ error: data?.error?.message || data?.message || "AI 调用失败", detail: data }, 502);
      const content = data?.choices?.[0]?.message?.content || "（未获取到回复）";
      return json({ content, usage: data?.usage });
    }

    return json({ error: "not found", path }, 404);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
}
