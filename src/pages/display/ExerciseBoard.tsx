import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Exercise, ExerciseStat } from "../../lib/types";
import { IconChart } from "../../components/icons";
import { Card, LiveBadge, SectionTitle } from "../../components/ui";

const OPT_COLORS = ["#34d399", "#22d3ee", "#a78bfa", "#fbbf24"];

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

  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconChart className="h-6 w-6" />}
        title="课后习题 · 正确率统计"
        sub="作答数据实时入库并汇总"
        right={<LiveBadge />}
      />

      <Card className="mb-6 flex items-center gap-6 p-6">
        <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-brand-400/40">
          <div>
            <div className="text-3xl font-bold text-white">{avg}%</div>
            <div className="text-xs text-brand-200/60">整体正确率</div>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-brand-200/70">
            共 {stats.length} 题 · 平均作答 {stats[0]?.attempts ?? 0} 人次
          </div>
          <div className="mt-3 flex gap-3">
            {stats.map((s) => (
              <div
                key={s.exerciseId}
                className="flex-1 rounded-lg bg-white/5 p-3"
              >
                <div className="text-xs text-brand-200/60">
                  第 {s.exerciseId.replace("EX", "")} 题
                </div>
                <div
                  className="mt-1 text-xl font-bold"
                  style={{ color: OPT_COLORS[0] }}
                >
                  {s.correctRate}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {stats.map((s) => {
          const q = qMap[s.exerciseId];
          const maxV = Math.max(...s.distribution, 1);
          return (
            <Card key={s.exerciseId} className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="text-sm font-medium leading-relaxed text-white">
                  {q?.title ?? s.title}
                </h3>
                <span className="shrink-0 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  {s.correctRate}%
                </span>
              </div>
              <div className="space-y-3">
                {q?.options.map((opt, oi) => {
                  const v = s.distribution[oi] ?? 0;
                  const isAns = oi === q.answer;
                  return (
                    <div key={oi}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span
                          className={
                            isAns ? "font-semibold text-emerald-300" : "text-brand-200/70"
                          }
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                          {isAns && " ✓"}
                        </span>
                        <span className="text-brand-200/50">{v} 人</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}
