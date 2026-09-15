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
  "Access-Control-Allow-Headers": "Content-Type,x-admin-key,x-student-token",
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    // JSON 一律禁缓存：名单/提交/成绩都是实时课堂数据，轮询必须拿到最新值
    // （作业图片走 /homework/file，单独用 v 版本参数 + 长缓存，互不影响）
    headers: { "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "no-store", ...CORS },
  });
const nowHM = () =>
  new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" });

const rj = (key) => KV.get(key, { type: "json", consistency: "strong" });
const wj = (key, val) => KV.setJSON(key, val);
const listKeys = async (prefix) => {
  const { blobs } = await KV.list({ prefix, consistency: "strong" });
  return blobs.map((b) => b.key);
};

// ---------- 课程：数智社区 · 信息采集 —— 当前任务：项目一·任务2 传感与视觉数据采集（工单 SQ-2026-001） ----------
const ROSTER = [["20241216501","孙天一"],["20241216502","王英杰"],["20241216503","马彦如"],["20241216504","杨诗意"],["20241216505","龚宸宇"],["20241216506","张昊祯"],["20241216507","金亮"],["20241216508","朱羿菲"],["20241216509","顾严天保"],["20241216510","陈迎冉"],["20241216511","顾保睿"],["20241216512","公俊超"],["20241216513","姚晨俊"],["20241216514","赵浩宇"],["20241216515","包杨睿"],["20241216516","汤宇轩"],["20241216517","龚皓林"],["20241216518","裴申宇"],["20241216519","黄杨萌"],["20241216520","宋子娴"],["20241216521","葛子骏"],["20241216522","刘佳鑫"],["20241216523","郑智童"],["20241216524","张哲"],["20241216525","周国栋"],["20241216526","张郁贤"]];
const COLORS = ["#22d3ee","#34d399","#a78bfa","#f472b6","#fbbf24","#60a5fa","#f87171","#4ade80"];
const SEED_STUDENTS = ROSTER.map(([id, name], i) => ({ id, name, avatarColor: COLORS[i % COLORS.length], classId: "C-2412" }));

// 课前检测：图像采集基础知识（项目一·任务2，对应工单 SQ-2026-001；6 题，分值合计 100）
const SEED_PQ = [
  { id: "PQ1", lesson: "L2", kp: "kp5", dim: "能力", title: "在采集人脸图像时，工单要求图像质量分不能低于（ ），才能被视为基础合格。", options: ["0.3", "0.5", "0.8", "1.0"], answer: 1, score: 15 },
  { id: "PQ2", lesson: "L2", kp: "kp5", dim: "能力", title: "人脸区域的最小边长必须达到（ ）像素，才能满足后续底库建模的尺寸要求。", options: ["40", "60", "80", "120"], answer: 2, score: 15 },
  { id: "PQ3", lesson: "L2", kp: "kp5", dim: "知识", title: "为了避免人脸被裁切导致特征提取失败，检测框距离图像边缘的最小距离应不低于（ ）像素。", options: ["0", "5", "10", "50"], answer: 2, score: 15 },
  { id: "PQ4", lesson: "L2", kp: "kp10", dim: "能力", title: "为了让模型能适应不同角度的人脸，采集时同一人至少需要采集（ ）张不同姿态的样本。", options: ["1", "2", "3", "5"], answer: 2, score: 15 },
  { id: "PQ5", lesson: "L2", kp: "kp10", dim: "知识", title: "按照任务工单中企业交付验收标准，试点批次人脸数据的可用样本占比（可用率）不得低于（ ），否则一票否决。", options: ["50%", "70%", "80%", "95%"], answer: 2, score: 20 },
  { id: "PQ6", lesson: "L2", kp: "kp12", dim: "素养", title: "关于合规底线，采集与处理人脸数据时，以下哪种做法是正确的？（ ）", options: ["将拍摄的原始人脸照片和特征数据一起存入底库，方便比对", "原始人脸图像提取特征后必须立即删除，不得存储", "为了方便联系，直接在 CSV 表格中写入被采集人的真实姓名", "为了数据安全，将包含人脸信息的 CSV 文件通过互联网发送给甲方"], answer: 1, score: 20 },
];

// 课后知识点问答题（传感与视觉数据采集 · 对应工单 SQ-2026-001；答案仅存服务端，不下发前端）
const SEED_EX = [
  { id: "EX1", lesson: "L2", kp: "kp5", dim: "能力", title: "质量筛选时发现某张人脸样本的人脸框最小边只有 60 像素（工单要求 ≥80px），正确的处理方式是？", options: ["把图像放大 1.5 倍，让人脸框达到 80 像素后入库", "判定为不可用样本，安排补拍并重新采集", "降低筛选阈值，直接放行入库", "裁掉人脸框以外的背景，使边长相对变大"], answer: 1 },
  { id: "EX2", lesson: "L2", kp: "kp12", dim: "素养", title: "特征提取完成后，设备本地还残留一批原始人脸照片，符合工单合规要求的做法是？", options: ["压缩打包留档，方便日后核查", "移动到备份目录长期保存", "加密后连同特征一起交付给委托方", "立即删除，并在删除日志中记录"], answer: 3 },
  { id: "EX3", lesson: "L2", kp: "kp12", dim: "素养", title: "metadata.csv 中的 person_id 字段应如何填写？", options: ["直接填写被采集人的真实姓名，便于追溯", "填写手机号，方便联系本人", "使用假名化编号（如 P001）", "留空不填，交付时再补"], answer: 2 },
  { id: "EX4", lesson: "L2", kp: "kp10", dim: "能力", title: "试点批次统计可用率为 76%，低于验收标准（≥80%，一票否决项），正确的处置是？", options: ["修改统计口径，把边缘样本计入可用", "直接交付，并向委托方说明客观原因", "删除不合格样本后按剩余数量重新计算比例", "按工单要求补拍补采，直至可用率达到 80% 以上再交付"], answer: 3 },
  { id: "EX5", lesson: "L2", kp: "kp5", dim: "能力", title: "质量筛选时某张样本的质量分只有 0.42（工单要求 ≥0.5 才能被底库采用），正确的处理方式是？", options: ["判定为不合格样本，不进入底库，重新采集该样本", "只要人脸完整清晰就可以直接入库", "手动把质量分改成 0.5 以上再入库", "交给特征提取环节，模型会自动纠错"], answer: 0 },
  { id: "EX6", lesson: "L2", kp: "kp10", dim: "能力", title: "为了让模型适应不同角度的人脸，采集时同一名被采集人至少需要采集哪些样本？", options: ["1 张正脸就足够", "2 张：正脸 + 左侧脸", "至少 3 张不同姿态：正脸 + 左侧脸 + 右侧脸", "越多越好，直接用视频逐帧截取，不用筛选"], answer: 2 },
  { id: "EX7", lesson: "L2", kp: "kp12", dim: "素养", title: "按照合规要求，采集人脸数据前应做的第一步是？", options: ["直接开始采集，事后补签同意即可", "先向被采集人说明数据用途与处理方式，签署知情同意卡后再采集", "被采集人口头答应就行，不用留下记录", "把同意书扫描件和原始照片一起存入底库"], answer: 1 },
  { id: "EX8", lesson: "L2", kp: "kp12", dim: "素养", title: "最终交付打包时，符合工单提交要求的做法是？", options: ["把全部原始人脸照片和特征数据一起压缩上传", "按 SQ-2026-001_第X组.zip 命名打包，包含特征数据集、metadata.csv、datacard.md 与合规记录，不含原始图像", "只交特征数据集，索引表、数据卡和合规记录可以不交", "用聊天工具把文件逐个发给老师，不需要打包命名"], answer: 1 },
];

const SEED_HW = { id: "HW-P1T2", title: "数据质检报告", description: "提交数据质检报告截图：按任务工单 SQ-2026-001 验收标准，截图需包含质量筛选结果（单张质量分 ≥0.5、人脸框最小边 ≥80px、距边缘 ≥10px、可用率 ≥80%）及假名化、无原图残留等合规自查项的检查结果。", deadline: "今日 16:30" };

// 任务级作业（与 P1T2 的「数据质检报告」相互独立）：KV 键 homework:task:{taskId}，提交存 homework:sub:{taskId}:{学号}，图片 Blob 前缀 hw/{taskId}/
// 不带 task 参数的旧接口仍走 homework / homework:sub:{学号}（P1T2 专用），互不影响
const TASK_HOMEWORKS = {
  P4T1: { id: "HW-P4T1", title: "社区物联感知看板设计与实现", description: "提交看板作品截图：基于社区物联感知数据（如环境温湿度、人流变化、设备状态等任一维度），设计并实现一个单维度数据看板（ECharts 等图表工具均可），截图需完整包含看板标题、图表效果与关键数据结论。", deadline: "今日 16:30" },
};

let seeded = false;
async function ensureSeed() {
  if (seeded) return;
  const s = await rj("students");
  if (!s) {
      await wj("students", SEED_STUDENTS);
      await wj("preview:questions", SEED_PQ);
      await wj("exercises", SEED_EX);
      await wj("homework", SEED_HW);
      for (const [tid, hw] of Object.entries(TASK_HOMEWORKS)) await wj(`homework:task:${tid}`, hw);
    }
    seeded = true;
}
async function students() { return (await rj("students")) || []; }

// ---------- 学生会话令牌：登录签发，写接口校验（x-student-token）----------
// 一个学号同一时间只保留最新一个有效令牌：新设备登录会使旧设备令牌失效
async function issueToken(studentId) {
  const token = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`).replace(/-/g, "");
  await wj(`session:${studentId}`, { token, ts: Date.now() });
  return token;
}
async function checkStudentAuth(request, studentId) {
  const token = request.headers.get("x-student-token");
  if (!token || !studentId) return false;
  const s = await rj(`session:${studentId}`);
  return !!s && s.token === token;
}

// 作业上传限制：仅 PNG / JPG，且不超过 5MB（与前端校验一致，服务端为准）
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_UPLOAD = 5 * 1024 * 1024;

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
        // homework:task:* 是任务作业种子数据，重置提交时保留
        if (keep.has(b.key) || b.key.startsWith("homework:task:")) continue;
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

    // 清空打分：教师评价（teacher-eval:*）+ 小组打分（group-eval:*，教师/企业/AI 三类）
    if (path === "/admin/clear-evals" && method === "POST") {
      if (!authorized()) return json({ error: "forbidden" }, 403);
      const all = await KV.list({ consistency: "strong" });
      let deleted = 0;
      for (const b of all.blobs) {
        if (/^(teacher-eval:|group-eval:)/.test(b.key)) {
          try { await KV.delete(b.key); deleted++; } catch { /* ignore */ }
        }
      }
      return json({ ok: true, deleted });
    }

    if (path === "/admin/reset-all" && method === "POST") {
      if (!authorized()) return json({ error: "forbidden" }, 403);
      const keep = new Set(["students", "preview:questions", "exercises", "homework"]);
      const all = await KV.list({ consistency: "strong" });
      let kvDeleted = 0;
      for (const b of all.blobs) {
        if (keep.has(b.key) || b.key.startsWith("homework:task:")) continue;
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
      for (const b of all.blobs) {
        // 只清除作答 / 提交 / 心跳类数据；小组评价（group-eval:*）与教师评价（teacher-eval:*）保留
        if (/^(preview:answer:|exercise:answer:|homework:sub:|presence:)/.test(b.key)) {
          try { await KV.delete(b.key); deleted++; } catch { /* ignore */ }
        }
      }
      await wj("students", SEED_STUDENTS);
      await wj("preview:questions", SEED_PQ);
      await wj("exercises", SEED_EX);
      await wj("homework", SEED_HW);
      for (const [tid, hw] of Object.entries(TASK_HOMEWORKS)) await wj(`homework:task:${tid}`, hw);
      seeded = true;
      return json({ ok: true, deleted, students: SEED_STUDENTS.length, preview: SEED_PQ.length, exercises: SEED_EX.length });
    }

    if (path === "/students" && method === "GET") return json(await students());

    // 学生登录：校验学号（姓名若提供则一并校验），签发会话令牌
    if (path === "/student/login" && method === "POST") {
      const { studentId, name } = await request.json();
      const sid = String(studentId || "").trim().toUpperCase();
      const st = (await students()).find((s) => s.id === sid);
      if (!st) return json({ error: "学号不存在，请核对后重试" }, 401);
      const nm = String(name || "").trim();
      if (nm && nm !== st.name) return json({ error: "学号与姓名不匹配，请核对后重试" }, 401);
      const token = await issueToken(st.id);
      return json({ ok: true, token, student: st });
    }
    // 学生退出登录：注销会话令牌
    if (path === "/student/logout" && method === "POST") {
      const { studentId } = await request.json();
      if (studentId) { try { await KV.delete(`session:${studentId}`); } catch { /* ignore */ } }
      return json({ ok: true });
    }

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
        sessionTitle: "任务：传感与视觉数据采集",
        studentCount: st.length,
        onlineCount: online.ids.length,
        previewDone: pvKeys.length,
        homeworkSubmitted: hwKeys.length,
        exerciseAvg: total ? Math.round((correct / total) * 100) : 0,
      });
    }

    // 在线心跳（学生端每 ~20s 调用；近 60s 有心跳 = 在线；需会话令牌）
    if (path === "/presence" && method === "POST") {
      const { studentId } = await request.json();
      if (!studentId) return json({ error: "studentId required" }, 400);
      if (!(await checkStudentAuth(request, studentId))) return json({ error: "请先登录" }, 401);
      await wj(`presence:${studentId}`, { studentId, ts: Date.now() });
      return json({ ok: true, ts: Date.now() });
    }
    if (path === "/presence" && method === "GET") {
      const online = await onlineStudents();
      return json({ onlineCount: online.ids.length, ids: online.ids });
    }

    // 课前预习（答案不下发，判分在服务端）
    if (path === "/preview/questions" && method === "GET") {
      const qs = (await rj("preview:questions")) || [];
      return json(qs.map(({ answer, ...q }) => q));
    }
    if (path === "/preview/scores" && method === "GET") {
      const keys = await listKeys("preview:answer:");
      const rows = [];
      for (const k of keys) { const d = await rj(k); if (d) rows.push(d); }
      rows.sort((a, b) => b.score - a.score || b.answered - a.answered);
      return json(rows.map((r) => ({ ...r, total: 100 })));
    }
    if (path === "/preview/answers" && method === "POST") {
      const arr = (await request.json().catch(() => null)) || [];
      if (!Array.isArray(arr)) return json({ error: "invalid body" }, 400);
      const sid0 = arr[0]?.studentId;
      // 会话鉴权：只能以登录学号本人身份提交
      if (!(await checkStudentAuth(request, sid0))) return json({ error: "请先登录后再提交" }, 401);
      const list = arr.filter((a) => a.studentId === sid0);
      const qs = await rj("preview:questions");
      const qmap = Object.fromEntries(qs.map((q) => [q.id, q]));
      const total = qs.reduce((s, q) => s + (q.score || 0), 0);
      const byId = Object.fromEntries((await students()).map((s) => [s.id, s]));
      const groups = {};
      for (const a of list) (groups[a.studentId] ||= []).push(a);
      const results = {};
      for (const [sid, arr] of Object.entries(groups)) {
        let score = 0; const answers = [];
        for (const a of arr) {
          const q = qmap[a.questionId]; if (!q) continue;
          const correct = Number(a.selected) === Number(q.answer);
          if (correct) score += q.score;
          answers.push({ questionId: a.questionId, lesson: q.lesson, kp: q.kp, dim: q.dim, selected: a.selected, correct });
        }
        await wj(`preview:answer:${sid}`, { studentId: sid, name: byId[sid]?.name || sid, score, answered: answers.length, answers });
        results[sid] = { score, total, answered: answers.length };
      }
      // 重复提交：同号覆盖写入（以最后一次为准），并把成绩返回给学生端展示
      return json({ ok: true, saved: Object.keys(groups).length, results });
    }

    // 课中作业（?task=P4T1 等任务参数 → 任务级作业；不传 → P1T2 默认作业，逻辑不变）
    if (path === "/homework" && method === "GET") {
      const task = url.searchParams.get("task") || "";
      if (task && TASK_HOMEWORKS[task]) {
        let meta = await rj(`homework:task:${task}`);
        if (!meta) { meta = TASK_HOMEWORKS[task]; await wj(`homework:task:${task}`, meta); } // 懒播种
        return json([meta]);
      }
      return json([await rj("homework")]);
    }
    if (path === "/homework/submissions" && method === "GET") {
      const task = url.searchParams.get("task") || "";
      const keys = await listKeys("homework:sub:");
      // 任务级键形如 homework:sub:P4T1:{学号}；旧 P1T2 键为 homework:sub:{纯数字学号}，互不混入
      const wanted = task ? keys.filter((k) => k.startsWith(`homework:sub:${task}:`)) : keys.filter((k) => /^homework:sub:\d+$/.test(k));
      const rows = [];
      for (const k of wanted) { const d = await rj(k); if (d) rows.push(d); }
      return json(rows);
    }
    if (path === "/homework/upload-url" && method === "POST") {
      const { studentId, fileName, contentType, size, task: bodyTask } = await request.json();
      // 会话鉴权：仅登录学生可为本人申请上传签名
      if (!(await checkStudentAuth(request, studentId))) return json({ error: "请先登录后再提交作业" }, 401);
      // 服务端强制校验：仅 PNG / JPG，且 ≤ 5MB
      if (!ALLOWED_TYPES.includes(contentType)) return json({ error: "仅支持 PNG / JPG 格式图片" }, 400);
      const sz = Number(size);
      if (!(sz > 0) || sz > MAX_UPLOAD) return json({ error: "图片大小必须在 5MB 以内" }, 400);
      const safe = String(fileName || "upload").replace(/[^\w.\-一-龥]/g, "_");
      const task = String(bodyTask || "");
      const key = task ? `hw/${task}/${studentId}/${Date.now()}-${safe}` : `hw/${studentId}/${Date.now()}-${safe}`;
      const { url: putUrl, expiresAt } = await FILES.createUploadUrl(key, { contentType: contentType || "application/octet-stream", expireSeconds: 3600 });
      return json({ url: putUrl, key, expiresAt });
    }
    if (path === "/homework/submissions" && method === "POST") {
      const m = await request.json();
      // 会话鉴权：仅登录学生可为本人提交作业元数据
      if (!(await checkStudentAuth(request, m.studentId))) return json({ error: "请先登录后再提交作业" }, 401);
      // 元数据入库同样校验格式与大小
      if (!ALLOWED_TYPES.includes(m.contentType)) return json({ error: "仅支持 PNG / JPG 格式图片" }, 400);
      const sz = Number(m.size);
      if (!(sz > 0) || sz > MAX_UPLOAD) return json({ error: "图片大小必须在 5MB 以内" }, 400);
      const byId = Object.fromEntries((await students()).map((s) => [s.id, s]));
      const task = TASK_HOMEWORKS[m.task] ? m.task : "";
      // thumbKey：可选的缩略图 Blob key（前端上传时生成的小图）；老提交无此字段，读图时回退原图
      const meta = {
        studentId: m.studentId, name: byId[m.studentId]?.name || m.studentId,
        fileName: m.fileName, size: Number(m.size) || 0, key: m.key,
        contentType: m.contentType || "image/png", submittedAt: nowHM(),
        ...(m.thumbKey ? { thumbKey: String(m.thumbKey) } : {}),
        ...(task ? { task } : {}),
      };
      await wj(task ? `homework:sub:${task}:${m.studentId}` : `homework:sub:${m.studentId}`, meta);
      return json(meta, 201);
    }
    if (path.startsWith("/homework/file") && method === "GET") {
      const sid = url.searchParams.get("sid");
      const task = url.searchParams.get("task") || "";
      const wantThumb = url.searchParams.get("thumb") === "1";
      if (!sid) return json({ error: "sid required" }, 400);
      const meta = await rj(task ? `homework:sub:${task}:${sid}` : `homework:sub:${sid}`);
      if (!meta?.key) return new Response("not found", { status: 404, headers: CORS });
      // 缩略图请求优先用 thumbKey，没有则回退原图；URL 带 v（=key）版本参数，内容可长缓存
      const blobKey = wantThumb && meta.thumbKey ? meta.thumbKey : meta.key;
      const buf = await FILES.get(blobKey, { type: "arrayBuffer", consistency: "strong" });
      if (!buf) return new Response("not found", { status: 404, headers: CORS });
      const contentType = wantThumb && meta.thumbKey ? "image/jpeg" : meta.contentType || "image/png";
      return new Response(buf, { headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=604800", ...CORS } });
    }

    // 课后知识点问答（答案不下发；正确率统计接口携带答案标位，供教师大屏公布）
    if (path === "/exercises" && method === "GET") {
      const exs = (await rj("exercises")) || [];
      return json(exs.map(({ answer, ...e }) => e));
    }
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
      return json(stats.map((s) => ({ exerciseId: s.exerciseId, title: s.title, answer: s.answer, correctRate: s.attempts ? Math.round((s.correctCount / s.attempts) * 100) : 0, attempts: s.attempts, distribution: s.distribution })));
    }
    if (path === "/exercises/answers" && method === "POST") {
      const arr = (await request.json().catch(() => null)) || [];
      if (!Array.isArray(arr)) return json({ error: "invalid body" }, 400);
      const sid0 = arr[0]?.studentId;
      // 会话鉴权：只能以登录学号本人身份提交
      if (!(await checkStudentAuth(request, sid0))) return json({ error: "请先登录后再提交" }, 401);
      const list = arr.filter((a) => a.studentId === sid0);
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

    // 小组评价（teacher/enterprise/ai 三类，按小组 × 4 项目打分 0–100，存 KV）
    if (path === "/group-evals" && method === "GET") {
      const type = url.searchParams.get("type") || "teacher";
      if (!["teacher", "enterprise", "ai"].includes(type)) return json({ error: "invalid type" }, 400);
      const keys = await listKeys(`group-eval:${type}:`);
      const rows = [];
      for (const k of keys) { const d = await rj(k); if (d) rows.push(d); }
      return json(rows);
    }
    if (path === "/group-evals" && method === "POST") {
      const m = await request.json();
      if (!["teacher", "enterprise", "ai"].includes(m.type)) return json({ error: "invalid type" }, 400);
      if (!m.groupId) return json({ error: "groupId required" }, 400);
      const doc = {
        type: m.type,
        groupId: m.groupId,
        name: m.name || m.groupId,
        scores: m.scores || {},
        comment: m.comment || "",
        updatedAt: nowHM(),
      };
      await wj(`group-eval:${m.type}:${m.groupId}`, doc);
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
