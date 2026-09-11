import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import mysql from "mysql2/promise";

const __dirname = dirname(fileURLToPath(import.meta.url));

const NAMES = [
  "陈嘉怡","李思远","王雨萱","张浩然","刘梦琪","黄俊杰","周欣妍","吴子轩","徐若曦","孙铭泽",
  "胡静雯","朱天宇","林思彤","何俊豪","郑雅雯","罗子墨","高雨欣","梁浩宇","谢佳琪","宋明轩",
];
const COLORS = ["#22d3ee","#34d399","#a78bfa","#f472b6","#fbbf24","#60a5fa","#f87171","#4ade80"];

const PREVIEW_QS = [
  { id:"PQ1", title:"在数字绘画软件中，图层混合模式「正片叠底」的主要作用是？", options:["整体提亮画面","保留暗部、滤除亮部，用于画阴影","让颜色完全反相","锁定图层不被编辑"], answer:1, score:25 },
  { id:"PQ2", title:"RGB 色彩模式中，三种基色指的是？", options:["红黄蓝","红绿蓝","青品黄","黑白灰"], answer:1, score:25 },
  { id:"PQ3", title:"使用 Stable Diffusion 生成图像时，CFG Scale 数值越大表示？", options:["越贴近提示词、自由度越低","越随机、越脱离提示词","分辨率越高","生成速度越快"], answer:0, score:25 },
  { id:"PQ4", title:"矢量图相对于位图的最大优势是？", options:["色彩更丰富","放大不失真","文件一定更小","只支持黑白"], answer:1, score:25 },
];

const EXERCISES = [
  { id:"EX1", title:"完成一张作品后，导出用于印刷应优先选择的色彩模式是？", options:["RGB","CMYK","HSL","LAB"], answer:1 },
  { id:"EX2", title:"在 AI 绘图工作流中，ControlNet 主要用于？", options:["压缩文件体积","对生成结果施加结构与姿态控制","提高显卡温度","转换字体格式"], answer:1 },
  { id:"EX3", title:"下列哪项最能提升画面的视觉焦点？", options:["均匀铺色","明暗与虚实对比","全部使用高饱和","取消透视"], answer:1 },
];

const SESSION = "SES-07";

function seededCorrect(i, qi) {
  // 决定第 i 个学生第 qi 题是否正确，制造分布
  const table = [
    [1,1,1,1],[1,1,0,1],[1,0,1,1],[1,1,1,1],[0,1,1,1],[1,0,0,1],[1,1,1,0],
    [1,1,0,1],[0,1,1,1],[1,1,1,1],[1,0,1,0],[1,1,0,1],[1,1,1,1],[0,1,0,1],
    [1,1,1,0],[1,0,1,1],[1,1,0,1],[1,1,1,1],[0,1,1,0],[1,1,1,1],
  ];
  return (table[i] || [1,1,1,1])[qi];
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    connectTimeout: 15000,
  });

  console.log("已连接:", process.env.DB_NAME);

  const schema = readFileSync(join(__dirname, "schema.sql"), "utf8");
  await conn.query(schema);
  console.log("表结构就绪");

  // 清空
  await conn.query("SET FOREIGN_KEY_CHECKS=0");
  for (const t of ["exercise_answers","exercises","homework_submissions","homeworks","preview_answers","preview_questions","sessions","students","classes"]) {
    await conn.query(`TRUNCATE TABLE \`${t}\``);
  }
  await conn.query("SET FOREIGN_KEY_CHECKS=1");
  console.log("已清空旧数据");

  await conn.query("INSERT INTO classes (id,name) VALUES (?,?)", ["C-2401", "数字媒体 2401 班"]);
  await conn.query("INSERT INTO sessions (id,class_id,title) VALUES (?,?,?)", [SESSION, "C-2401", "第 7 讲 · AI 辅助数字插画创作"]);

  // 学生
  const studentRows = NAMES.map((name, i) => [`S${String(i+1).padStart(3,"0")}`, "C-2401", name, COLORS[i % COLORS.length]]);
  await conn.query("INSERT INTO students (id,class_id,name,avatar_color) VALUES ?", [studentRows]);

  // 预习题
  await conn.query("INSERT INTO preview_questions (id,session_id,title,options,answer,score,ord) VALUES ?",
    [PREVIEW_QS.map((q, i) => [q.id, SESSION, q.title, JSON.stringify(q.options), q.answer, q.score, i])]);

  // 习题
  await conn.query("INSERT INTO exercises (id,session_id,title,options,answer,ord) VALUES ?",
    [EXERCISES.map((e, i) => [e.id, SESSION, e.title, JSON.stringify(e.options), e.answer, i])]);

  // 作业
  await conn.query("INSERT INTO homeworks (id,session_id,title,description,deadline,dav_path) VALUES (?,?,?,?,?,?)",
    ["HW1", SESSION, "《赛博城市》主题数字插画", "运用本节课所学图层与光影知识，完成一张 1920×1080 主题插画，提交 PSD/PNG。", "今日 16:30", "/webdav/class-2401/homework/session-07"]);

  // 预习作答（前 16 人完成）
  const paRows = [];
  for (let i = 0; i < 16; i++) {
    const sid = `S${String(i+1).padStart(3,"0")}`;
    for (let qi = 0; qi < PREVIEW_QS.length; qi++) {
      const q = PREVIEW_QS[qi];
      const correct = seededCorrect(i, qi);
      const selected = correct ? q.answer : (q.answer + 1) % q.options.length;
      paRows.push([SESSION, sid, q.id, selected, correct]);
    }
  }
  await conn.query("INSERT INTO preview_answers (session_id,student_id,question_id,selected,correct) VALUES ?", [paRows]);

  // 作业提交（前 13 人）
  const hwRows = [];
  for (let i = 0; i < 13; i++) {
    const sid = `S${String(i+1).padStart(3,"0")}`;
    hwRows.push(["HW1", sid, `${NAMES[i]}_赛博城市_${String(i+1).padStart(2,"0")}.png`, Math.round((2.4 + (i % 5) * 1.3) * 1024 * 1024), `/webdav/class-2401/homework/session-07/${sid}.png`]);
  }
  await conn.query("INSERT INTO homework_submissions (homework_id,student_id,file_name,size,dav_url) VALUES ?", [hwRows]);

  // 习题作答（前 20 人）
  const eaRows = [];
  for (let i = 0; i < 20; i++) {
    const sid = `S${String(i+1).padStart(3,"0")}`;
    for (let ei = 0; ei < EXERCISES.length; ei++) {
      const e = EXERCISES[ei];
      const correct = seededCorrect(i, ei);
      const selected = correct ? e.answer : (e.answer + 1) % e.options.length;
      eaRows.push([e.id, sid, selected, correct]);
    }
  }
  await conn.query("INSERT INTO exercise_answers (exercise_id,student_id,selected,correct) VALUES ?", [eaRows]);

  const [c] = await conn.query("SELECT (SELECT COUNT(*) FROM students) s,(SELECT COUNT(*) FROM preview_answers) pa,(SELECT COUNT(*) FROM homework_submissions) hs,(SELECT COUNT(*) FROM exercise_answers) ea");
  console.log("种子数据完成:", JSON.stringify(c[0]));
  await conn.end();
}

main().catch((e) => { console.error("失败:", e.code || "", e.sqlMessage || e.message); process.exit(1); });
