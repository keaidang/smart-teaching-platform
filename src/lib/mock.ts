import type {
  ClassOverview,
  Exercise,
  ExerciseStat,
  Homework,
  HomeworkSubmission,
  PreviewQuestion,
  PreviewScore,
  Student,
} from "./types";

const AVATAR_COLORS = ["#22d3ee","#34d399","#a78bfa","#f472b6","#fbbf24","#60a5fa","#f87171","#4ade80"];

const NAMES = ["王梓涵","李宇轩","张欣怡","刘浩然","陈雨桐","杨俊杰","黄梦琪","赵子墨","周佳怡","吴天佑","徐诗琪","孙晨曦","马若曦","朱一鸣","胡嘉豪","郭雅婷","何睿哲","高可欣","林博文","郑静宜"];

export const students: Student[] = NAMES.map((name, i) => ({
  id: `S${String(i + 1).padStart(2, "0")}`,
  name,
  avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  classId: "C-2402",
}));

export const previewQuestions: PreviewQuestion[] = [
  { id: "PQ1", title: "开展城市小微区域数据采集，首先应完成的工作是？", options: ["直接编写爬虫", "确定采集需求与设计方案", "购买服务器", "绘制可视化大屏"], answer: 1, score: 25 },
  { id: "PQ2", title: "下列哪项不属于常见的环境类采集指标？", options: ["温度", "湿度", "PM2.5", "股票价格"], answer: 3, score: 25 },
  { id: "PQ3", title: "Python 中读取串口传感器数据最常用的库是？", options: ["pyserial", "requests", "flask", "numpy"], answer: 0, score: 25 },
  { id: "PQ4", title: "数据清洗中处理连续型缺失值常用方法是？", options: ["直接删除全部数据", "均值/中位数插补", "随机填充", "不做处理"], answer: 1, score: 25 },
];

export const exercises: Exercise[] = [
  { id: "EX1", title: "在公共区域采集数据时，首先应遵守的是？", options: ["采集越多越好", "合法合规与隐私保护", "只追求精度", "无需告知"], answer: 1 },
  { id: "EX2", title: "网络爬虫遵守 robots 协议与频控，主要目的是？", options: ["提高抓取速度", "尊重站点规则、降低服务器压力", "绕过反爬", "隐藏身份"], answer: 1 },
  { id: "EX3", title: "多源数据融合对齐的关键在于？", options: ["统一时间/空间与字段口径", "全部转成图片", "删除异常值", "只保留一个来源"], answer: 0 },
];

function seededScore(i: number) {
  return [95, 88, 76, 100, 82, 70, 91, 85, 79, 97, 68, 84, 90, 73, 88, 96][i % 16];
}

export function mockPreviewScores(): PreviewScore[] {
  return students
    .map((s, i) => ({ studentId: s.id, name: s.name, score: seededScore(i), total: 100, answered: 4 }))
    .sort((a, b) => b.score - a.score);
}

export const homeworks: Homework[] = [
  {
    id: "HW1",
    title: "城市小微区域环境与设施数据采集成果",
    description:
      "提交本次任务的采集数据集（CSV）与采集方案说明（PNG/文档截图），体现需求-采集-清洗-可视化流程。",
    deadline: "今日 16:30",
  },
];

function fmtTime(minAgo: number) {
  const d = new Date(Date.now() - minAgo * 60000);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

export function mockHomeworkSubmissions(): HomeworkSubmission[] {
  const submitted = students.slice(0, 13);
  return submitted.map((s, i) => ({
    studentId: s.id,
    name: s.name,
    fileName: `${s.name}_采集成果_${String(i + 1).padStart(2, "0")}.png`,
    size: Math.round((2.4 + (i % 5) * 1.3) * 1024 * 1024),
    key: `hw/${s.id}/demo-${i + 1}.png`,
    contentType: "image/png",
    submittedAt: fmtTime(38 - i * 2),
  }));
}

export function mockExerciseStats(): ExerciseStat[] {
  return exercises.map((ex, i) => {
    const correctRate = [82, 68, 91][i % 3];
    const attempts = 20;
    const correctCount = Math.round((correctRate / 100) * attempts);
    const wrong = attempts - correctCount;
    const distribution = ex.options.map((_, oi) =>
      oi === ex.answer ? correctCount : Math.round(wrong / (ex.options.length - 1))
    );
    return { exerciseId: ex.id, title: ex.title, correctRate, attempts, distribution };
  });
}

export function mockOverview(): ClassOverview {
  const scores = mockPreviewScores();
  const avg = Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length);
  return {
    className: "计算机应用技术 2024 级 2 班",
    sessionTitle: "城市“小微区域”环境与设施数据智能采集",
    studentCount: students.length,
    onlineCount: 18,
    previewDone: scores.length,
    homeworkSubmitted: mockHomeworkSubmissions().length,
    exerciseAvg: avg,
  };
}
