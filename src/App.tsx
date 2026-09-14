import { Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "./pages/site/SiteLayout";
import SiteHome from "./pages/site/SiteHome";
import Projects from "./pages/site/Projects";
import Industry from "./pages/site/Industry";
import Extensions from "./pages/site/Extensions";
import Evaluation from "./pages/site/Evaluation";
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
import StudentAI from "./pages/student/StudentAI";
import { RequireStudent } from "./lib/auth";

export default function App() {
  return (
    <Routes>
      {/* AI 数据服务资源库（主站，师生共用） */}
      <Route path="/" element={<SiteLayout />}>
        <Route index element={<SiteHome />} />
        <Route path="projects" element={<Projects />} />
        <Route path="industry" element={<Industry />} />
        <Route path="extensions" element={<Extensions />} />
        <Route path="evaluation" element={<Evaluation />} />
      </Route>

      {/* 学生专属界面 */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentLogin />} />
        <Route
          path="preview"
          element={
            <RequireStudent>
              <StudentPreview />
            </RequireStudent>
          }
        />
        <Route
          path="homework"
          element={
            <RequireStudent>
              <StudentHomework />
            </RequireStudent>
          }
        />
        <Route
          path="exercise"
          element={
            <RequireStudent>
              <StudentExercise />
            </RequireStudent>
          }
        />
        <Route
          path="ai"
          element={
            <RequireStudent>
              <StudentAI />
            </RequireStudent>
          }
        />
      </Route>

      {/* 教师实时大屏 */}
      <Route path="/class" element={<DisplayLayout />}>
        <Route index element={<DisplayHome />} />
        <Route path="preview" element={<PreviewBoard />} />
        <Route path="homework" element={<HomeworkBoard />} />
        <Route path="exercise" element={<ExerciseBoard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
