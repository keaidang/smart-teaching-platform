import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export function EChart({
  option,
  height = 340,
  className = "",
}: {
  option: echarts.EChartsOption;
  height?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inst = useRef<echarts.ECharts | null>(null);

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

// 深色主题基线：统一文字/坐标轴/提示框配色
export function dark(option: Record<string, unknown>): echarts.EChartsOption {
  const axisStyle = {
    axisLine: { lineStyle: { color: "rgba(165,243,252,0.25)" } },
    axisLabel: { color: "rgba(207,250,254,0.7)" },
    splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
  };
  return {
    textStyle: { color: "rgba(230,246,251,0.9)", fontFamily: "inherit" },
    tooltip: {
      backgroundColor: "rgba(6,32,42,0.95)",
      borderColor: "rgba(34,211,238,0.3)",
      textStyle: { color: "#e6f6fb" },
      ...((option.tooltip as object) || {}),
    },
    legend: { textStyle: { color: "rgba(207,250,254,0.8)" }, ...((option.legend as object) || {}) },
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
  } as echarts.EChartsOption;
}
