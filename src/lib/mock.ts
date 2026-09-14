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
  PREVIEW_QUESTIONS,
  EXERCISE_QUESTIONS,
  ACTIVE_HOMEWORK,
} from "./course";

export const students: Student[] = STUDENTS;

export const previewQuestions: PreviewQuestion[] = PREVIEW_QUESTIONS.map((q) => ({
  id: q.id,
  title: q.title,
  options: q.options,
  answer: q.answer,
  score: q.score,
}));

export const exercises: Exercise[] = EXERCISE_QUESTIONS.map((e) => ({
  id: e.id,
  title: e.title,
  options: e.options,
  answer: e.answer,
}));

export const homeworks: Homework[] = [ACTIVE_HOMEWORK];

function seededScore(i: number) {
  return [95, 88, 76, 100, 82, 70, 91, 85, 79, 97, 68, 84, 90, 73, 88, 96][i % 16];
}

export function mockPreviewScores(): PreviewScore[] {
  return students
    .slice(0, 20)
    .map((s, i) => ({ studentId: s.id, name: s.name, score: seededScore(i), total: 100, answered: 4 }))
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
    fileName: `${s.name}_传感视觉清洗_${String(i + 1).padStart(2, "0")}.png`,
    size: Math.round((2.4 + (i % 5) * 1.3) * 1024 * 1024),
    key: `hw/${s.id}/demo-${i + 1}.png`,
    contentType: "image/png",
    submittedAt: fmtTime(38 - i * 2),
  }));
}

export function mockExerciseStats(): ExerciseStat[] {
  return exercises.map((ex, i) => {
    const correctRate = [82, 68, 91, 75][i % 4];
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
    className: "2465 人工智能",
    sessionTitle: "任务：传感与视觉数据清洗",
    studentCount: students.length,
    onlineCount: Math.min(18, scores.length),
    previewDone: scores.length,
    homeworkSubmitted: mockHomeworkSubmissions().length,
    exerciseAvg: avg,
  };
}

export { ROSTER };
