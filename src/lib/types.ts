export interface Student {
  id: string;
  name: string;
  avatarColor: string;
  classId: string;
}

export interface PreviewQuestion {
  id: string;
  title: string;
  options: string[];
  answer: number;
  score: number;
}

export interface PreviewAnswer {
  studentId: string;
  questionId: string;
  selected: number;
  correct: boolean;
}

export interface PreviewScore {
  studentId: string;
  name: string;
  score: number;
  total: number;
  answered: number;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  deadline: string;
  davPath: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  fileName: string;
  size: number;
  submittedAt: string;
  davUrl: string;
}

export interface Exercise {
  id: string;
  title: string;
  options: string[];
  answer: number;
}

export interface ExerciseStat {
  exerciseId: string;
  title: string;
  correctRate: number;
  attempts: number;
  distribution: number[];
}

export interface ClassOverview {
  className: string;
  sessionTitle: string;
  studentCount: number;
  onlineCount: number;
  previewDone: number;
  homeworkSubmitted: number;
  exerciseAvg: number;
}
