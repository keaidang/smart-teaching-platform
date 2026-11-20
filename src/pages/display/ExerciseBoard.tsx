import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Exercise, ExerciseStat } from "../../lib/types";
import { IconChart } from "../../components/icons";
import { Card, LiveBadge, SectionTitle, Tag } from "../../components/ui";
import { EChart, dark } from "../../components/EChart";

const OPT_COLORS = ["#34d399", "#22d3ee", "#a78bfa", "#fbbf24"];
const SERIES_PALETTE = ["#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#60a5fa"];

export default function ExerciseBoard() {
  const [stats, setStats] = useState<ExerciseStat[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [s, ex] = await Promise.all([
        api.getExerciseStats(),
        api.getExercises(),
      ]);
      if (!alive) return;
      setStats(s);
      setExercises(ex);
    };
    load();
    const t = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const qMap = Object.fromEntries(exercises.map((e) => [e.id, e]));
  const avg = stats.length
    ? Math.round(stats.reduce((a, b) => a + b.correctRate, 0) / stats.length)
    : 0;

  // 各题正确率对比图：数据直接来自服务端统计接口
  const chartOption = dark({
    grid: { left: 48, right: 20, top: 36, bottom: 32 },
    tooltip: { trigger: "axis", valueFormatter: (v: unknown) => `${v}%` },
    xAxis: {
      type: "category",
      data: stats.map((s) => `第${s.exerciseId.replace("EX", "")}题`),
    },
    yAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%" } },
    series: [
      {
        type: "bar",
        barWidth: 28,
        data: stats.map((s, i) => ({
          value: s.correctRate,
          itemStyle: {
            color: SERIES_PALETTE[i % SERIES_PALETTE.length],
            borderRadius: [6, 6, 0, 0],
          },
        })),
          label: { show: true, position: "top", color: "#334155", formatter: "{c}%" },
      },
    ],
  });

  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconChart className="h-8 w-8" />}
        title="课后习题 · 正确率统计"
        sub="作答数据实时入库并汇总 · 答案标位来自服务端统计"
        large
        tone="emerald"
        right={<LiveBadge />}
      />

      <Card tone="emerald" className="mb-6 flex flex-col gap-6 p-6 lg:flex-row lg:items-center">
        <div className="tone-emerald grid h-28 w-28 shrink-0 place-items-center rounded-full border-4" style={{ borderColor: "var(--tone-line)" }}>
          <div className="text-center">
            <div className="grad-text text-4xl font-extrabold tabular-nums">{avg}%</div>
            <div className="text-xs text-slate-500">整体正确率</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-slate-500">
            共 {stats.length} 题 · 平均作答 {stats[0]?.attempts ?? 0} 人次
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {stats.map((s, i) => (
              <div
                key={s.exerciseId}
                className="min-w-20 flex-1 rounded-lg border border-slate-900/8 bg-slate-900/[0.04] p-3"
              >
                <div className="text-xs text-slate-500">
                  第 {s.exerciseId.replace("EX", "")} 题
                </div>
                <div
                  className="mt-1 text-2xl font-extrabold tabular-nums"
                  style={{ color: SERIES_PALETTE[i % SERIES_PALETTE.length] }}
                >
                  {s.correctRate}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 各题正确率对比 + 图例说明 */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">各题正确率对比</h3>
            <span className="text-xs text-slate-500">单位：% · 实时刷新</span>
          </div>
          {stats.length > 0 && <EChart option={chartOption} height={280} />}
        </Card>
        <Card tone="violet" className="p-5">
          <h3 className="text-sm font-semibold text-slate-900">选项分布 · 图例说明</h3>
          <div className="mt-4 space-y-3">
            {["A", "B", "C", "D"].map((letter, i) => (
              <div key={letter} className="flex items-center gap-3 text-sm">
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold text-ink-950"
                  style={{ background: OPT_COLORS[i] }}
                >
                  {letter}
                </span>
                <span className="text-slate-600">选项 {letter} 的选择人数</span>
              </div>
            ))}
            <div className="divider-grad" />
            <div className="flex items-center gap-3 text-sm">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-400 text-xs font-bold text-ink-950">✓</span>
              <span className="text-slate-600">正确答案（服务端统计标位）</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              条形长度按本题各选项人数的相对比例绘制；正确选项以绿色高亮并标注 ✓，答案由服务端统计接口下发，前端不做计算。
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {stats.map((s, si) => {
          const q = qMap[s.exerciseId];
          const maxV = Math.max(...s.distribution, 1);
          return (
            <Card key={s.exerciseId} tone="emerald" className={`rise-${(si % 4) + 1} p-5`}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="text-sm font-medium leading-relaxed text-slate-900">
                  <span className="mr-2 font-bold" style={{ color: SERIES_PALETTE[si % SERIES_PALETTE.length] }}>
                    Q{s.exerciseId.replace("EX", "")}
                  </span>
                  {q?.title ?? s.title}
                </h3>
                <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  {s.correctRate}%
                </span>
              </div>
              <div className="space-y-3">
                {q?.options.map((opt, oi) => {
                  const v = s.distribution[oi] ?? 0;
                  // 答案标位来自服务端统计接口（题目列表接口不下发答案）
                  const isAns = oi === s.answer;
                  return (
                    <div key={oi}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span
                          className={
                            isAns ? "font-semibold text-emerald-600" : "text-slate-500"
                          }
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                          {isAns && " ✓"}
                        </span>
                        <span className="shrink-0 pl-2 text-slate-500">{v} 人</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900/10">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(v / maxV) * 100}%`,
                            background: isAns ? "#34d399" : OPT_COLORS[oi % 4],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-900/5 pt-3">
                <Tag tone="emerald" className="px-2 py-0.5 text-xs">作答 {s.attempts} 人次</Tag>
                <span className="text-xs text-slate-500">
                  {s.answer !== undefined ? "答案已公布" : "统计中"}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}