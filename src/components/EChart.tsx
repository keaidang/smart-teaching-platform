import { useEffect, useRef } from "react";
import echarts, { type EChartsOption } from "../lib/echarts";
import { isDark } from "../lib/theme";

export function EChart({
  option,
  height = 340,
  className = "",
}: {
  option: EChartsOption;
  height?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inst = useRef<ReturnType<typeof echarts.init> | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    inst.current = echarts.init(ref.current);
    const ro = new ResizeObserver(() => inst.current?.resize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      inst.current?.dispose();
      inst.current = null;
    };
  }, []);

  useEffect(() => {
    inst.current?.setOption(option, true);
  }, [option]);

  return <div ref={ref} className={className} style={{ width: "100%", height }} />;
}

// 图表基线：按当前昼/夜主题统一文字/坐标轴/提示框配色
export function dark(option: Record<string, unknown>): EChartsOption {
  const d = isDark();
  const axisStyle = {
    axisLine: { lineStyle: { color: d ? "rgba(180,220,235,0.30)" : "rgba(15,23,42,0.15)" } },
    axisLabel: { color: d ? "#93b1c1" : "#64748b" },
    splitLine: { lineStyle: { color: d ? "rgba(180,220,235,0.12)" : "rgba(15,23,42,0.08)" } },
  };
  return {
    textStyle: { color: d ? "#c9dbe5" : "#334155", fontFamily: "inherit" },
    tooltip: {
      backgroundColor: d ? "rgba(8,36,48,0.96)" : "rgba(255,255,255,0.98)",
      borderColor: d ? "rgba(103,232,249,0.28)" : "rgba(15,23,42,0.1)",
      textStyle: { color: d ? "#e6f6fb" : "#0f172a" },
      ...((option.tooltip as object) || {}),
    },
    legend: { textStyle: { color: d ? "#b2c6d3" : "#475569" }, ...((option.legend as object) || {}) },
    ...option,
    // 合并坐标轴深色样式
    xAxis: Array.isArray(option.xAxis)
      ? (option.xAxis as object[]).map((a) => ({ ...axisStyle, ...a }))
      : option.xAxis
      ? { ...axisStyle, ...(option.xAxis as object) }
      : undefined,
    yAxis: Array.isArray(option.yAxis)
      ? (option.yAxis as object[]).map((a) => ({ ...axisStyle, ...a }))
      : option.yAxis
      ? { ...axisStyle, ...(option.yAxis as object) }
      : undefined,
  } as EChartsOption;
}
