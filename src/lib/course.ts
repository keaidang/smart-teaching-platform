// 数智社区 · 信息采集教学平台 —— 课程结构与内容（前端 mock 与展示共用）

export interface Roster { id: string; name: string }
export interface TaskDef { id: string; title: string; active: boolean }
export interface ProjectDef { id: string; title: string; hours: number; tasks: TaskDef[] }

// 26 人班级名单（学号 1–26 连续；已剔除休学 1 人、集训 3 人）
export const ROSTER: Roster[] = [
  { id: "20241216501", name: "孙天一" }, { id: "20241216502", name: "王英杰" }, { id: "20241216503", name: "马彦如" },
  { id: "20241216504", name: "杨诗意" }, { id: "20241216505", name: "龚宸宇" }, { id: "20241216506", name: "张昊祯" },
  { id: "20241216507", name: "金亮" }, { id: "20241216508", name: "朱羿菲" }, { id: "20241216509", name: "顾严天保" },
  { id: "20241216510", name: "陈迎冉" }, { id: "20241216511", name: "顾保睿" }, { id: "20241216512", name: "公俊超" },
  { id: "20241216513", name: "姚晨俊" }, { id: "20241216514", name: "赵浩宇" }, { id: "20241216515", name: "包杨睿" },
  { id: "20241216516", name: "汤宇轩" }, { id: "20241216517", name: "龚皓林" }, { id: "20241216518", name: "裴申宇" },
  { id: "20241216519", name: "黄杨萌" }, { id: "20241216520", name: "宋子娴" }, { id: "20241216521", name: "葛子骏" },
  { id: "20241216522", name: "刘佳鑫" }, { id: "20241216523", name: "郑智童" }, { id: "20241216524", name: "张哲" },
  { id: "20241216525", name: "周国栋" }, { id: "20241216526", name: "张郁贤" },
];

const AVATAR_COLORS = ["#22d3ee", "#34d399", "#a78bfa", "#f472b6", "#fbbf24", "#60a5fa", "#f87171", "#4ade80"];
export const STUDENTS = ROSTER.map((r, i) => ({
  ...r,
  avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  classId: "C-2412",
}));

// 4 个项目 / 8 个任务；当前课程只开放 项目二·任务2「传感与视觉数据清洗」
export const PROJECTS: ProjectDef[] = [
  {
    id: "P1", title: "数据感知方案设计与采集", hours: 8,
    tasks: [
      { id: "P1T1", title: "社区民意文本数据采集", active: false },
      { id: "P1T2", title: "传感与视觉数据采集", active: false },
    ],
  },
  {
    id: "P2", title: "多源数据清洗治理", hours: 8,
    tasks: [
      { id: "P2T1", title: "居民诉求文本数据清洗", active: false },
      { id: "P2T2", title: "传感与视觉数据清洗", active: true },
    ],
  },
  {
    id: "P3", title: "多源数据融合与存储", hours: 8,
    tasks: [
      { id: "P3T1", title: "社区知识底座构建与数据入库", active: false },
      { id: "P3T2", title: "社区多源数据关联融合", active: false },
    ],
  },
  {
    id: "P4", title: "社区综合治理数据可视化", hours: 6,
    tasks: [
      { id: "P4T1", title: "社区数据单维度看板设计", active: false },
      { id: "P4T2", title: "综合治理大屏设计与汇报", active: false },
    ],
  },
];

export const ACTIVE_TASK_ID = "P2T2";
export function findTask(id: string) {
  for (const p of PROJECTS) for (const t of p.tasks) if (t.id === id) return { project: p, task: t };
  return null;
}
export function allTasks() {
  return PROJECTS.flatMap((p) => p.tasks.map((t) => ({ ...t, project: p })));
}

// 当前任务：传感与视觉数据清洗 —— 课堂任务清单
export const ACTIVE_TASK_CHECKLIST = [
  { step: "1", title: "读取原始数据", desc: "加载传感器 CSV（温湿度/PM2.5/噪声）与视觉样本（图像/点云）。" },
  { step: "2", title: "时间戳对齐", desc: "统一采样频率，按时间窗口对齐多源传感数据。" },
  { step: "3", title: "缺失与异常处理", desc: "均值/中位数插补缺失，3σ/IQR 检测并处理异常值。" },
  { step: "4", title: "图像与点云清洗", desc: "图像去噪（高斯/中值），点云离群点滤波（统计/半径滤波）。" },
  { step: "5", title: "格式统一与归一化", desc: "统一坐标系与单位，数值归一化/标准化。" },
  { step: "6", title: "输出清洗数据集", desc: "导出清洗后 CSV 与图像/点云样本，记录数据质量报告。" },
];

// 课前预习（传感与视觉数据清洗）
export interface Q { id: string; title: string; options: string[]; answer: number; score: number; lesson: string; kp: string; dim: string }
export const PREVIEW_QUESTIONS: Q[] = [
  { id: "PQ1", lesson: "L3", kp: "kp7", dim: "能力", score: 25, title: "多源传感数据融合前，首先要做的是？", options: ["直接求平均", "时间戳对齐与统一采样频率", "删除所有异常值", "转成图片"], answer: 1 },
  { id: "PQ2", lesson: "L3", kp: "kp7", dim: "能力", score: 25, title: "检测数值型异常值常用的统计方法是？", options: ["3σ / IQR 准则", "冒泡排序", "字典序", "哈希"], answer: 0 },
  { id: "PQ3", lesson: "L3", kp: "kp7", dim: "知识", score: 25, title: "图像去噪中，中值滤波特别擅长去除？", options: ["高斯噪声", "椒盐噪声", "运动模糊", "JPEG 压缩"], answer: 1 },
  { id: "PQ4", lesson: "L3", kp: "kp10", dim: "能力", score: 25, title: "点云清洗中去除离群点常用？", options: ["统计/半径滤波", "锐化", "直方图均衡", "灰度化"], answer: 0 },
];

// 课后知识点问答（传感与视觉数据清洗）
export interface EQ { id: string; title: string; options: string[]; answer: number; lesson: string; kp: string; dim: string }
export const EXERCISE_QUESTIONS: EQ[] = [
  { id: "EX1", lesson: "L3", kp: "kp7", dim: "能力", title: "连续型缺失值最稳妥的处理方式是？", options: ["一律删除整行", "按分布做均值/中位数插补", "填 0", "随机填充"], answer: 1 },
  { id: "EX2", lesson: "L3", kp: "kp8", dim: "能力", title: "点云与图像配准对齐的关键是？", options: ["统一时间/空间与内外参标定", "都转成 CSV", "提高分辨率", "增加颜色"], answer: 0 },
  { id: "EX3", lesson: "L3", kp: "kp11", dim: "素养", title: "数据清洗记录‘数据质量报告’的主要意义是？", options: ["应付检查", "可追溯、保证工程规范与质量", "拖慢进度", "没有意义"], answer: 1 },
  { id: "EX4", lesson: "L3", kp: "kp12", dim: "素养", title: "采集含人脸的视觉数据，清洗时应注意？", options: ["公开传播", "隐私脱敏与合规", "长期留存原图", "随意标注"], answer: 1 },
];

export const ACTIVE_HOMEWORK = {
  id: "HW-P2T2",
  title: "传感与视觉数据清洗成果",
  description: "提交清洗后的数据集（CSV）与数据质量说明（截图/图表），体现时间对齐、缺失/异常处理、图像去噪与点云滤波、格式归一化流程。",
  deadline: "今日 16:30",
};
