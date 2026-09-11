import express from "express";
import mysql from "mysql2/promise";

// ---- 数据库连接池（EdgeOne 云函数运行时通过 process.env 注入环境变量）----
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: "utf8mb4",
  timezone: "+08:00",
  connectionLimit: 10,
  waitForConnections: true,
  connectTimeout: 15000,
});

const parseOptions = (v) => (typeof v === "string" ? JSON.parse(v) : v);
const ok = (res, data) => res.json(data);
const fail = (res, e) => {
  console.error("[api-error]", e);
  res.status(500).json({ error: String(e.sqlMessage || e.message || e) });
};

async function currentSessionId() {
  const [r] = await pool.query("SELECT id FROM sessions ORDER BY created_at DESC LIMIT 1");
  return r[0]?.id;
}

const app = express();
app.use(express.json({ limit: "6mb" }));

// CORS（本地/跨域调试用；同源部署时也无害）
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", async (_req, res) => {
  try {
    const [r] = await pool.query("SELECT 1 AS ping");
    res.json({ ok: true, ping: r[0].ping, db: process.env.DB_NAME });
  } catch (e) {
    fail(res, e);
  }
});

// ---------- 学生 ----------
app.get("/students", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, class_id AS classId, name, avatar_color AS avatarColor FROM students");
    ok(res, rows);
  } catch (e) { fail(res, e); }
});

// ---------- 课前预习 ----------
app.get("/preview/questions", async (_req, res) => {
  try {
    const sid = await currentSessionId();
    const [rows] = await pool.query(
      "SELECT id, title, options, answer, score FROM preview_questions WHERE session_id=? ORDER BY ord",
      [sid]
    );
    ok(res, rows.map((r) => ({ ...r, options: parseOptions(r.options) })));
  } catch (e) { fail(res, e); }
});

app.get("/preview/scores", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT st.id AS studentId, st.name,
              COALESCE(SUM(CASE WHEN a.correct=1 THEN q.score ELSE 0 END),0) AS score,
              COUNT(a.id) AS answered
       FROM students st
       CROSS JOIN preview_questions q
       LEFT JOIN preview_answers a ON a.student_id=st.id AND a.question_id=q.id
       GROUP BY st.id, st.name
       HAVING answered>0
       ORDER BY score DESC, answered DESC`
    );
    const [t] = await pool.query("SELECT COALESCE(SUM(score),100) AS total FROM preview_questions");
    const total = Number(t[0]?.total ?? 100);
    ok(res, rows.map((r) => ({ ...r, score: Number(r.score), total, answered: Number(r.answered) })));
  } catch (e) { fail(res, e); }
});

app.post("/preview/answers", async (req, res) => {
  try {
    const sid = await currentSessionId();
    const list = Array.isArray(req.body) ? req.body : [];
    const [qs] = await pool.query("SELECT id, answer, score FROM preview_questions");
    const map = Object.fromEntries(qs.map((q) => [q.id, q]));
    for (const a of list) {
      const q = map[a.questionId];
      if (!q) continue;
      const correct = Number(a.selected) === Number(q.answer) ? 1 : 0;
      await pool.query(
        `INSERT INTO preview_answers (session_id, student_id, question_id, selected, correct)
         VALUES (?,?,?,?,?)
         ON DUPLICATE KEY UPDATE selected=VALUES(selected), correct=VALUES(correct), submitted_at=NOW()`,
        [sid, a.studentId, a.questionId, a.selected, correct]
      );
    }
    res.json({ ok: true, saved: list.length });
  } catch (e) { fail(res, e); }
});

// ---------- 课中作业 ----------
app.get("/homework", async (_req, res) => {
  try {
    const sid = await currentSessionId();
    const [rows] = await pool.query(
      "SELECT id, title, description, deadline, dav_path AS davPath FROM homeworks WHERE session_id=?",
      [sid]
    );
    ok(res, rows);
  } catch (e) { fail(res, e); }
});

app.get("/homework/submissions", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT hs.id, hs.homework_id AS homeworkId, hs.student_id AS studentId,
              st.name AS studentName, hs.file_name AS fileName, hs.size,
              DATE_FORMAT(hs.submitted_at, '%H:%i') AS submittedAt, hs.dav_url AS davUrl
       FROM homework_submissions hs JOIN students st ON st.id=hs.student_id
       ORDER BY hs.submitted_at ASC`
    );
    ok(res, rows.map((r) => ({ ...r, id: String(r.id), size: Number(r.size) })));
  } catch (e) { fail(res, e); }
});

app.post("/homework/submissions", async (req, res) => {
  try {
    const m = req.body || {};
    const [r] = await pool.query(
      `INSERT INTO homework_submissions (homework_id, student_id, file_name, size, dav_url)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE file_name=VALUES(file_name), size=VALUES(size), dav_url=VALUES(dav_url), submitted_at=NOW()`,
      [m.homeworkId, m.studentId, m.fileName, m.size || 0, m.davUrl || ""]
    );
    const [rows] = await pool.query(
      `SELECT hs.id, hs.homework_id AS homeworkId, hs.student_id AS studentId,
              st.name AS studentName, hs.file_name AS fileName, hs.size,
              DATE_FORMAT(hs.submitted_at, '%H:%i') AS submittedAt, hs.dav_url AS davUrl
       FROM homework_submissions hs JOIN students st ON st.id=hs.student_id WHERE hs.id=?`,
      [r.insertId]
    );
    const created = rows[0];
    res.status(201).json({ ...created, id: String(created.id), size: Number(created.size) });
  } catch (e) { fail(res, e); }
});

// ---------- 课后习题 ----------
app.get("/exercises", async (_req, res) => {
  try {
    const sid = await currentSessionId();
    const [rows] = await pool.query(
      "SELECT id, title, options, answer FROM exercises WHERE session_id=? ORDER BY ord",
      [sid]
    );
    ok(res, rows.map((r) => ({ ...r, options: parseOptions(r.options) })));
  } catch (e) { fail(res, e); }
});

app.get("/exercises/stats", async (_req, res) => {
  try {
    const [base] = await pool.query(
      `SELECT e.id AS exerciseId, e.title, e.options, e.answer,
              COUNT(a.id) AS attempts, COALESCE(SUM(a.correct),0) AS correctCount
       FROM exercises e LEFT JOIN exercise_answers a ON a.exercise_id=e.id
       GROUP BY e.id ORDER BY e.ord`
    );
    const [dist] = await pool.query(
      "SELECT exercise_id AS exerciseId, selected, COUNT(*) AS c FROM exercise_answers GROUP BY exercise_id, selected"
    );
    const distMap = {};
    for (const d of dist) (distMap[d.exerciseId] ||= {})[Number(d.selected)] = Number(d.c);
    const out = base.map((b) => {
      const options = parseOptions(b.options);
      const attempts = Number(b.attempts);
      const distribution = options.map((_, oi) => distMap[b.exerciseId]?.[oi] ?? 0);
      const correctRate = attempts ? Math.round((Number(b.correctCount) / attempts) * 100) : 0;
      return { exerciseId: b.exerciseId, title: b.title, correctRate, attempts, distribution };
    });
    ok(res, out);
  } catch (e) { fail(res, e); }
});

app.post("/exercises/answers", async (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : [];
    const [qs] = await pool.query("SELECT id, answer FROM exercises");
    const map = Object.fromEntries(qs.map((q) => [q.id, q]));
    for (const a of list) {
      const q = map[a.exerciseId];
      if (!q) continue;
      const correct = Number(a.selected) === Number(q.answer) ? 1 : 0;
      await pool.query(
        `INSERT INTO exercise_answers (exercise_id, student_id, selected, correct)
         VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE selected=VALUES(selected), correct=VALUES(correct), submitted_at=NOW()`,
        [a.exerciseId, a.studentId, a.selected, correct]
      );
    }
    res.json({ ok: true, saved: list.length });
  } catch (e) { fail(res, e); }
});

// ---------- 大屏概览 ----------
app.get("/overview", async (_req, res) => {
  try {
    const [[cls]] = await pool.query("SELECT name AS className FROM classes LIMIT 1");
    const [[ses]] = await pool.query("SELECT title AS sessionTitle FROM sessions ORDER BY created_at DESC LIMIT 1");
    const [[sc]] = await pool.query("SELECT COUNT(*) AS n FROM students");
    const [[online]] = await pool.query(
      "SELECT COUNT(DISTINCT sid) AS n FROM (SELECT student_id sid FROM preview_answers UNION SELECT student_id FROM homework_submissions) t"
    );
    const [[pv]] = await pool.query("SELECT COUNT(DISTINCT student_id) AS n FROM preview_answers");
    const [[hw]] = await pool.query("SELECT COUNT(*) AS n FROM homework_submissions");
    const [[ex]] = await pool.query("SELECT COALESCE(ROUND(AVG(correct)*100),0) AS n FROM exercise_answers");
    ok(res, {
      className: cls?.className ?? "",
      sessionTitle: ses?.sessionTitle ?? "",
      studentCount: Number(sc.n),
      onlineCount: Number(online.n),
      previewDone: Number(pv.n),
      homeworkSubmitted: Number(hw.n),
      exerciseAvg: Number(ex.n),
    });
  } catch (e) { fail(res, e); }
});

export default app;
