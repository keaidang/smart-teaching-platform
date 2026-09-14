// 数智社区 · 教学资源库 —— 课程结构与内容（前端 mock 与展示共用）

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

// 4 个项目 / 8 个任务；当前课程开放 项目一·任务2「人脸特征底库建设与交付」（工单 SQ-2026-001）
export const PROJECTS: ProjectDef[] = [
  {
    id: "P1", title: "数据感知方案设计与采集", hours: 8,
    tasks: [
      { id: "P1T1", title: "社区民意文本数据采集", active: false },
      { id: "P1T2", title: "人脸特征底库建设与交付", active: true },
    ],
  },
  {
    id: "P2", title: "多源数据清洗治理", hours: 8,
    tasks: [
      { id: "P2T1", title: "居民诉求文本数据清洗", active: false },
      { id: "P2T2", title: "传感与视觉数据清洗", active: false },
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

// 小组分组：26 人 = 第 1–5 组各 4 人，第 6 组 6 人（多出的 2 人并入最后一组）；评价均以小组为单位
export interface GroupDef { id: string; name: string; memberIds: string[] }
export const GROUPS: GroupDef[] = [
  { id: "G1", name: "第1组", memberIds: ROSTER.slice(0, 4).map((r) => r.id) },
  { id: "G2", name: "第2组", memberIds: ROSTER.slice(4, 8).map((r) => r.id) },
  { id: "G3", name: "第3组", memberIds: ROSTER.slice(8, 12).map((r) => r.id) },
  { id: "G4", name: "第4组", memberIds: ROSTER.slice(12, 16).map((r) => r.id) },
  { id: "G5", name: "第5组", memberIds: ROSTER.slice(16, 20).map((r) => r.id) },
  { id: "G6", name: "第6组", memberIds: ROSTER.slice(20, 26).map((r) => r.id) },
];
export function groupMemberNames(g: GroupDef) {
  return g.memberIds.map((id) => ROSTER.find((r) => r.id === id)?.name || id);
}

// 教师评价维度（4 项，1–5 星）
export const EVAL_DIMENSIONS = [
  { key: "classroom", label: "课堂表现", desc: "出勤 · 专注 · 互动 · 回答" },
  { key: "homework", label: "课后作业", desc: "完成度 · 质量 · 规范" },
  { key: "knowledge", label: "知识掌握", desc: "概念 · 原理 · 方法" },
  { key: "quality", label: "综合素养", desc: "协作 · 合规 · 创新" },
];
export function findTask(id: string) {
  for (const p of PROJECTS) for (const t of p.tasks) if (t.id === id) return { project: p, task: t };
  return null;
}
export function allTasks() {
  return PROJECTS.flatMap((p) => p.tasks.map((t) => ({ ...t, project: p })));
}

// 当前任务：项目一·任务2 人脸特征底库建设与交付 —— 课堂任务清单（依据企业任务工单 SQ-2026-001）
export const ACTIVE_TASK_CHECKLIST = [
  { step: "1", title: "研读任务工单", desc: "明确委托方需求：为试点楼栋建设合规人脸特征底库，支撑黑名单预警与独居老人未出入研判；交付的是特征数据集，不是人脸照片。" },
  { step: "2", title: "合规前置准备", desc: "采集前取得每位被采集人明确同意，签署并保留知情同意卡（照片/扫描件），作为一票否决项的证据材料。" },
  { step: "3", title: "多姿态人脸采集", desc: "使用 K230 CanMV 端侧设备采集，每人不少于 3 张不同姿态样本（正脸 + 左侧脸 + 右侧脸）。" },
  { step: "4", title: "质量筛选", desc: "单张质量分 ≥0.5，人脸框最小边 ≥80 像素，人脸框距图像边缘 ≥10 像素；不满足即视为不可用样本。" },
  { step: "5", title: "特征提取与加密存储", desc: "每张有效样本提取 128 维特征向量，按 SHA-256 哈希前 16 位命名，加密存入 features/ 目录；原始图像提取后立即删除并记录删除日志。" },
  { step: "6", title: "生成元数据索引表", desc: "生成 metadata.csv（UTF-8-sig 编码，8 字段：feature_id/file_name/person_id/consent_id/time/device_id/quality_score/face_size），person_id 必须假名化（如 P001）。" },
  { step: "7", title: "撰写数据卡", desc: "编写 datacard.md：采集设备、样本总量、平均质量分、可用率、数据构成（特征维度/加密算法/存储位置）与合规状态说明。" },
  { step: "8", title: "验收与打包交付", desc: "自查可用率 ≥80%（一票否决）、假名化合规、无原图残留（0 张）；整个交付文件夹压缩为 SQ-2026-001_第X组.zip 统一提交。" },
];

// 课前检测：图像采集基础知识（项目一·任务2，对应工单 SQ-2026-001；6 题，分值合计 100）
export interface Q { id: string; title: string; options: string[]; answer: number; score: number; lesson: string; kp: string; dim: string }
export const PREVIEW_QUESTIONS: Q[] = [
  { id: "PQ1", lesson: "L2", kp: "kp5", dim: "能力", score: 15, title: "在采集人脸图像时，工单要求图像质量分不能低于（ ），才能被视为基础合格。", options: ["0.3", "0.5", "0.8", "1.0"], answer: 1 },
  { id: "PQ2", lesson: "L2", kp: "kp5", dim: "能力", score: 15, title: "人脸区域的最小边长必须达到（ ）像素，才能满足后续底库建模的尺寸要求。", options: ["40", "60", "80", "120"], answer: 2 },
  { id: "PQ3", lesson: "L2", kp: "kp5", dim: "知识", score: 15, title: "为了避免人脸被裁切导致特征提取失败，检测框距离图像边缘的最小距离应不低于（ ）像素。", options: ["0", "5", "10", "50"], answer: 2 },
  { id: "PQ4", lesson: "L2", kp: "kp10", dim: "能力", score: 15, title: "为了让模型能适应不同角度的人脸，采集时同一人至少需要采集（ ）张不同姿态的样本。", options: ["1", "2", "3", "5"], answer: 2 },
  { id: "PQ5", lesson: "L2", kp: "kp10", dim: "知识", score: 20, title: "按照任务工单中企业交付验收标准，试点批次人脸数据的可用样本占比（可用率）不得低于（ ），否则一票否决。", options: ["50%", "70%", "80%", "95%"], answer: 2 },
  { id: "PQ6", lesson: "L2", kp: "kp12", dim: "素养", score: 20, title: "关于合规底线，采集与处理人脸数据时，以下哪种做法是正确的？（ ）", options: ["将拍摄的原始人脸照片和特征数据一起存入底库，方便比对", "原始人脸图像提取特征后必须立即删除，不得存储", "为了方便联系，直接在 CSV 表格中写入被采集人的真实姓名", "为了数据安全，将包含人脸信息的 CSV 文件通过互联网发送给甲方"], answer: 1 },
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
  id: "HW-P1T2",
  title: "人脸特征底库交付成果",
  description: "按任务工单 SQ-2026-001 提交交付成果材料：特征模板目录（features/）、元数据索引表（metadata.csv）、数据卡（datacard.md）与合规记录（知情同意卡、原始图像删除日志）的截图或成品照片。",
  deadline: "今日 16:30",
};
