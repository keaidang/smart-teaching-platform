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

// 4 个项目 / 8 个任务；当前课程开放 项目一·任务2「传感与视觉数据采集」（企业工单 SQ-2026-001：人脸特征底库建设与交付）
export const PROJECTS: ProjectDef[] = [
  {
    id: "P1", title: "数据感知方案设计与采集", hours: 8,
    tasks: [
      { id: "P1T1", title: "社区民意文本数据采集", active: true },
      { id: "P1T2", title: "传感与视觉数据采集", active: true },
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

export const ACTIVE_TASK_ID = "P1T2";

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

// 当前任务：项目一·任务2 传感与视觉数据采集 —— 课堂任务清单（依据企业任务工单 SQ-2026-001）
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

// 课前检测 / 课后习题的题库已移至：src/lib/mock.ts（离线演示，不含答案）+ cloud-functions/api（线上，含答案）。
// 安全约定：course.ts 随主包下发，任何含答案的题库都不得放在这里。

export const ACTIVE_HOMEWORK = {
  id: "HW-P1T2",
  title: "数据质检报告",
  description: "提交数据质检报告截图：按任务工单 SQ-2026-001 验收标准，截图需包含质量筛选结果（单张质量分 ≥0.5、人脸框最小边 ≥80px、距边缘 ≥10px、可用率 ≥80%）及假名化、无原图残留等合规自查项的检查结果。",
  deadline: "今日 16:30",
};
