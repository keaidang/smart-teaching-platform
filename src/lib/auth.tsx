import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Navigate } from "react-router-dom";
import type { Student } from "./types";

const KEY = "stp.currentStudent";

interface AuthCtx {
  student: Student | null;
  setStudent: (s: Student | null) => void;
}

const Ctx = createContext<AuthCtx>({ student: null, setStudent: () => {} });

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudentState] = useState<Student | null>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Student) : null;
    } catch {
      return null;
    }
  });

  const setStudent = (s: Student | null) => {
    setStudentState(s);
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  };

  useEffect(() => {
    const onStorage = () => {
      const raw = localStorage.getItem(KEY);
      setStudentState(raw ? (JSON.parse(raw) as Student) : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <Ctx.Provider value={{ student, setStudent }}>{children}</Ctx.Provider>;
}

export function useStudent() {
  return useContext(Ctx);
}

export function RequireStudent({ children }: { children: ReactNode }) {
  const { student } = useStudent();
  if (!student) return <Navigate to="/" replace />;
  return <>{children}</>;
}
