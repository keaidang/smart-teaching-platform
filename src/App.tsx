import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "./pages/site/SiteLayout";
import SiteHome from "./pages/site/SiteHome";
import Projects from "./pages/site/Projects";
import TaskDetail from "./pages/site/TaskDetail";
import Industry from "./pages/site/Industry";
import Extensions from "./pages/site/Extensions";
import DisplayLayout from "./pages/display/DisplayLayout";
import DisplayHome from "./pages/display/DisplayHome";
import PreviewBoard from "./pages/display/PreviewBoard";
import HomeworkBoard from "./pages/display/HomeworkBoard";
import ExerciseBoard from "./pages/display/ExerciseBoard";
import StudentLayout from "./pages/student/StudentLayout";
import StudentLogin from "./pages/student/StudentLogin";
import StudentPreview from "./pages/student/StudentPreview";
import StudentHomework from "./pages/student/StudentHomework";
import StudentExercise from "./pages/student/StudentExercise";
import Admin from "./pages/admin/Admin";
import { RequireStudent } from "./lib/auth";

// 重依赖页面按需加载：Evaluation 拉 echarts，StudentAI 拉 react-markdown
const Evaluation = lazy(() => import("./pages/site/Evaluation"));
const StudentAI = lazy(() => import("./pages/student/StudentAI"));

function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-brand-200/60">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400/30 border-t-brand-400" />
        <span className="text-sm">加载中…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* AI数据服务资源库（主站，师生共用） */}
        <Route path="/" element={<SiteLayout />}>
          <Route index element={<SiteHome />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/task/:taskId" element={<TaskDetail />} />
          <Route path="industry" element={<Industry />} />
          <Route path="extensions" element={<Extensions />} />
          <Route path="evaluation" element={<Evaluation />} />
        </Route>

        {/* 学生专属界面 */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentLogin />} />
          <Route path="preview" element={<RequireStudent><StudentPreview /></RequireStudent>} />
          <Route path="homework" element={<RequireStudent><StudentHomework /></RequireStudent>} />
          <Route path="exercise" element={<RequireStudent><StudentExercise /></RequireStudent>} />
          <Route path="ai" element={<RequireStudent><StudentAI /></RequireStudent>} />
        </Route>

        {/* 教师实时大屏 */}
        <Route path="/class" element={<DisplayLayout />}>
          <Route index element={<DisplayHome />} />
          <Route path="preview" element={<PreviewBoard />} />
          <Route path="homework" element={<HomeworkBoard />} />
          <Route path="exercise" element={<ExerciseBoard />} />
        </Route>

        {/* 管理后台 */}
        <Route path="/admin" element={<Admin />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
