import { useEffect, useRef } from "react";
import echarts, { type EChartsOption } from "../lib/echarts";

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

// 浅色主题基线：统一文字/坐标轴/提示框配色
export function dark(option: Record<string, unknown>): EChartsOption {
  const axisStyle = {
    axisLine: { lineStyle: { color: "rgba(15,23,42,0.15)" } },
    axisLabel: { color: "#64748b" },
    splitLine: { lineStyle: { color: "rgba(15,23,42,0.08)" } },
  };
  return {
    textStyle: { color: "#334155", fontFamily: "inherit" },
    tooltip: {
      backgroundColor: "rgba(255,255,255,0.98)",
      borderColor: "rgba(15,23,42,0.1)",
      textStyle: { color: "#0f172a" },
      ...((option.tooltip as object) || {}),
    },
    legend: { textStyle: { color: "#475569" }, ...((option.legend as object) || {}) },
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
