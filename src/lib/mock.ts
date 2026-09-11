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

const AVATAR_COLORS = [
  "#22d3ee",
  "#34d399",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
  "#60a5fa",
  "#f87171",
  "#4ade80",
];

const NAMES = [
  "陈嘉怡",
  "李思远",
  "王雨萱",
  "张浩然",
  "刘梦琪",
  "黄俊杰",
  "周欣妍",
  "吴子轩",
  "徐若曦",
  "孙铭泽",
  "胡静雯",
  "朱天宇",
  "林思彤",
  "何俊豪",
  "郑雅雯",
  "罗子墨",
  "高雨欣",
  "梁浩宇",
  "谢佳琪",
  "宋明轩",
];

export const students: Student[] = NAMES.map((name, i) => ({
  id: `S${String(i + 1).padStart(3, "0")}`,
  name,
  avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  classId: "C-2401",
}));

export const previewQuestions: PreviewQuestion[] = [
  {
    id: "PQ1",
    title: "在数字绘画软件中，图层混合模式「正片叠底」的主要作用是？",
    options: [
      "整体提亮画面",
      "保留暗部、滤除亮部，用于画阴影",
      "让颜色完全反相",
      "锁定图层不被编辑",
    ],
    answer: 1,
    score: 25,
  },
  {
    id: "PQ2",
    title: "RGB 色彩模式中，三种基色指的是？",
    options: ["红黄蓝", "红绿蓝", "青品黄", "黑白灰"],
    answer: 1,
    score: 25,
  },
  {
    id: "PQ3",
    title: "使用 Stable Diffusion 生成图像时，CFG Scale 数值越大表示？",
    options: [
      "越贴近提示词、自由度越低",
      "越随机、越脱离提示词",
      "分辨率越高",
      "生成速度越快",
    ],
    answer: 0,
    score: 25,
  },
  {
    id: "PQ4",
    title: "矢量图相对于位图的最大优势是？",
    options: ["色彩更丰富", "放大不失真", "文件一定更小", "只支持黑白"],
    answer: 1,
    score: 25,
  },
];

export const exercises: Exercise[] = [
  {
    id: "EX1",
    title: "完成一张作品后，导出用于印刷应优先选择的色彩模式是？",
    options: ["RGB", "CMYK", "HSL", "LAB"],
    answer: 1,
  },
  {
    id: "EX2",
    title: "在 AI 绘图工作流中，ControlNet 主要用于？",
    options: [
      "压缩文件体积",
      "对生成结果施加结构与姿态控制",
      "提高显卡温度",
      "转换字体格式",
    ],
    answer: 1,
  },
  {
    id: "EX3",
    title: "下列哪项最能提升画面的视觉焦点？",
    options: ["均匀铺色", "明暗与虚实对比", "全部使用高饱和", "取消透视"],
    answer: 1,
  },
];

function seededScore(i: number) {
  return [95, 88, 76, 100, 82, 70, 91, 85, 79, 97, 68, 84, 90, 73, 88, 96][
    i % 16
  ];
}

export function mockPreviewScores(): PreviewScore[] {
  return students
    .map((s, i) => ({
      studentId: s.id,
      name: s.name,
      score: seededScore(i),
      total: 100,
      answered: 4,
    }))
    .sort((a, b) => b.score - a.score);
}

export const homeworks: Homework[] = [
  {
    id: "HW1",
    title: "《赛博城市》主题数字插画",
    description:
      "运用本节课所学图层与光影知识，完成一张 1920×1080 主题插画，提交 PNG。",
    deadline: "今日 16:30",
  },
];

function fmtTime(minAgo: number) {
  const d = new Date(Date.now() - minAgo * 60000);
  return d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function mockHomeworkSubmissions(): HomeworkSubmission[] {
  const submitted = students.slice(0, 13);
  return submitted.map((s, i) => ({
    studentId: s.id,
    name: s.name,
    fileName: `${s.name}_赛博城市_${String(i + 1).padStart(2, "0")}.png`,
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
    return {
      exerciseId: ex.id,
      title: ex.title,
      correctRate,
      attempts,
      distribution,
    };
  });
}

export function mockOverview(): ClassOverview {
  const scores = mockPreviewScores();
  const avg = Math.round(
    scores.reduce((a, b) => a + b.score, 0) / scores.length
  );
  return {
    className: "数字媒体 2401 班",
    sessionTitle: "第 7 讲 · AI 辅助数字插画创作",
    studentCount: students.length,
    onlineCount: 18,
    previewDone: scores.length,
    homeworkSubmitted: mockHomeworkSubmissions().length,
    exerciseAvg: avg,
  };
}
