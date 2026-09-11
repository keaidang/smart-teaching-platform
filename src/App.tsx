import { Navigate, Route, Routes } from "react-router-dom";
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
import { RequireStudent } from "./lib/auth";

export default function App() {
  return (
    <Routes>
      {/* 学生端：域名根路径直接访问 */}
      <Route path="/" element={<StudentLayout />}>
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
      </Route>

      {/* 教师端 / 大屏：域名 /class */}
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
