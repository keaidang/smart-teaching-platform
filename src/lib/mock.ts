// 离线演示数据（VITE_USE_MOCK=true 时才生效；生产构建走真实 API）。
// 安全约定：本文件可以含题面，但不得含 answer —— mock 也可能被构造成异步 chunk，答案只放在云函数。
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
import {
  STUDENTS,
  ROSTER,
  ACTIVE_HOMEWORK,
  ACTIVE_TASK_ID,
  findTask,
} from "./course";

export const students: Student[] = STUDENTS;

// 课前检测题面（项目一·任务2 人脸特征底库建设与交付，工单 SQ-2026-001；6 题合计 100 分）
export const previewQuestions: PreviewQuestion[] = [
  { id: "PQ1", score: 15, title: "在采集人脸图像时，工单要求图像质量分不能低于（ ），才能被视为基础合格。", options: ["0.3", "0.5", "0.8", "1.0"] },
  { id: "PQ2", score: 15, title: "人脸区域的最小边长必须达到（ ）像素，才能满足后续底库建模的尺寸要求。", options: ["40", "60", "80", "120"] },
  { id: "PQ3", score: 15, title: "为了避免人脸被裁切导致特征提取失败，检测框距离图像边缘的最小距离应不低于（ ）像素。", options: ["0", "5", "10", "50"] },
  { id: "PQ4", score: 15, title: "为了让模型能适应不同角度的人脸，采集时同一人至少需要采集（ ）张不同姿态的样本。", options: ["1", "2", "3", "5"] },
  { id: "PQ5", score: 20, title: "按照任务工单中企业交付验收标准，试点批次人脸数据的可用样本占比（可用率）不得低于（ ），否则一票否决。", options: ["50%", "70%", "80%", "95%"] },
  { id: "PQ6", score: 20, title: "关于合规底线，采集与处理人脸数据时，以下哪种做法是正确的？（ ）", options: ["将拍摄的原始人脸照片和特征数据一起存入底库，方便比对", "原始人脸图像提取特征后必须立即删除，不得存储", "为了方便联系，直接在 CSV 表格中写入被采集人的真实姓名", "为了数据安全，将包含人脸信息的 CSV 文件通过互联网发送给甲方"] },
];

// 课后习题题面（人脸特征底库建设与交付 · 对应工单 SQ-2026-001）
export const exercises: Exercise[] = [
  { id: "EX1", title: "质量筛选时发现某张人脸样本的人脸框最小边只有 60 像素（工单要求 ≥80px），正确的处理方式是？", options: ["把图像放大 1.5 倍，让人脸框达到 80 像素后入库", "判定为不可用样本，安排补拍并重新采集", "降低筛选阈值，直接放行入库", "裁掉人脸框以外的背景，使边长相对变大"] },
  { id: "EX2", title: "特征提取完成后，设备本地还残留一批原始人脸照片，符合工单合规要求的做法是？", options: ["压缩打包留档，方便日后核查", "移动到备份目录长期保存", "加密后连同特征一起交付给委托方", "立即删除，并在删除日志中记录"] },
  { id: "EX3", title: "metadata.csv 中的 person_id 字段应如何填写？", options: ["直接填写被采集人的真实姓名，便于追溯", "填写手机号，方便联系本人", "使用假名化编号（如 P001）", "留空不填，交付时再补"] },
  { id: "EX4", title: "试点批次统计可用率为 76%，低于验收标准（≥80%，一票否决项），正确的处置是？", options: ["修改统计口径，把边缘样本计入可用", "直接交付，并向委托方说明客观原因", "删除不合格样本后按剩余数量重新计算比例", "按工单要求补拍补采，直至可用率达到 80% 以上再交付"] },
];

export const homeworks: Homework[] = [ACTIVE_HOMEWORK];

function seededScore(i: number) {
  return [95, 88, 76, 100, 82, 70, 91, 85, 79, 97, 68, 84, 90, 73, 88, 96][i % 16];
}

export function mockPreviewScores(): PreviewScore[] {
  return students
    .slice(0, 20)
    .map((s, i) => ({ studentId: s.id, name: s.name, score: seededScore(i), total: 100, answered: 6 }))
    .sort((a, b) => b.score - a.score);
}

function fmtTime(minAgo: number) {
  const d = new Date(Date.now() - minAgo * 60000);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

export function mockHomeworkSubmissions(): HomeworkSubmission[] {
  return students.slice(0, 12).map((s, i) => ({
    studentId: s.id,
    name: s.name,
    fileName: `${s.name}_数据质检报告_${String(i + 1).padStart(2, "0")}.png`,
    size: Math.round((2.4 + (i % 5) * 1.3) * 1024 * 1024),
    key: `hw/${s.id}/demo-${i + 1}.png`,
    contentType: "image/png",
    submittedAt: fmtTime(38 - i * 2),
  }));
}

export function mockExerciseStats(): ExerciseStat[] {
  // 离线演示：正确率 / 分布 / 答案标位均为演示数据（真实答案在云函数，不下发前端）
  return exercises.map((ex, i) => {
    const correctRate = [82, 68, 91, 75][i % 4];
    const attempts = 20;
    const correctCount = Math.round((correctRate / 100) * attempts);
    const wrong = attempts - correctCount;
    const fakeAns = i % ex.options.length;
    const distribution = ex.options.map((_, oi) =>
      oi === fakeAns ? correctCount : Math.round(wrong / (ex.options.length - 1))
    );
    return { exerciseId: ex.id, title: ex.title, answer: fakeAns, correctRate, attempts, distribution };
  });
}

export function mockOverview(): ClassOverview {
  const scores = mockPreviewScores();
  const avg = Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length);
  return {
    className: "2465 人工智能",
    sessionTitle: `任务：${findTask(ACTIVE_TASK_ID)?.task.title ?? ""}`,
    studentCount: students.length,
    onlineCount: Math.min(18, scores.length),
    previewDone: scores.length,
    homeworkSubmitted: mockHomeworkSubmissions().length,
    exerciseAvg: avg,
  };
}

export { ROSTER };
