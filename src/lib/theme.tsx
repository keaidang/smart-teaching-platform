import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark";

const LS_KEY = "stp.theme";

// 默认暗色主题；用户在 UI 上切换后写入 localStorage，后续优先跟随用户选择
function initialMode(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(LS_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

const Ctx = createContext<{ mode: ThemeMode; toggle: () => void; set: (m: ThemeMode) => void }>({
  mode: "light",
  toggle: () => {},
  set: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.style.colorScheme = mode;
    window.localStorage.setItem(LS_KEY, mode);
  }, [mode]);

  const toggle = useCallback(() => setMode((m) => (m === "dark" ? "light" : "dark")), []);
  const set = useCallback((m: ThemeMode) => setMode(m), []);

  return <Ctx.Provider value={{ mode, toggle, set }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}

// 供命令式绘制（canvas / ECharts option）读取当前是否为暗色
export function isDark(): boolean {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

// 命令式 canvas 绘制的主题取色（页面随主题 remount，挂载时读一次即可）
export function canvasTheme() {
  return isDark()
    ? {
        text: "#e6f6fb",
        halo: "#04141a",
        edge: "rgba(103,232,249,0.55)",
        edgeFaint: "rgba(148,210,230,0.42)",
        edgeSoft: "rgba(103,232,249,0.30)",
        edgeSoftFaint: "rgba(148,210,230,0.22)",
        nodeLine: "rgba(255,255,255,0.22)",
      }
    : {
        text: "#0f172a",
        halo: "#ffffff",
        edge: "rgba(58,110,165,0.55)",
        edgeFaint: "rgba(100,116,139,0.55)",
        edgeSoft: "rgba(58,110,165,0.30)",
        edgeSoftFaint: "rgba(100,116,139,0.22)",
        nodeLine: "rgba(15,23,42,0.22)",
      };
}
