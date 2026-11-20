import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { PreviewScore } from "../../lib/types";
import { IconTrophy } from "../../components/icons";
import { Avatar, Bar, Card, LiveBadge, SectionTitle, TONE_HEX, type Tone } from "../../components/ui";

function medal(i: number) {
  return ["🥇", "🥈", ""][i];
}

const PODIUM_TONES: Tone[] = ["amber", "blue", "orange"];

export default function PreviewBoard() {
  const [scores, setScores] = useState<PreviewScore[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const s = await api.getPreviewScores();
      if (alive) setScores(s);
    };
    load();
    const t = setInterval(load, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const avg = scores.length
    ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length)
    : 0;
  const full = scores.filter((s) => s.score === 100).length;
  const excellent = scores.filter((s) => s.score >= 90).length;
  const excellentPct = scores.length ? Math.round((excellent / scores.length) * 100) : 0;

  // 分数段分布（由实时分数榜推导）
  const bands = [
    { label: "优秀 ≥90", tone: "emerald" as Tone, count: scores.filter((s) => s.score >= 90).length },
    { label: "良好 75–89", tone: "cyan" as Tone, count: scores.filter((s) => s.score >= 75 && s.score < 90).length },
    { label: "待提升 <75", tone: "amber" as Tone, count: scores.filter((s) => s.score < 75).length },
  ];

  const statCards: { label: string; value: string | number; tone: Tone }[] = [
    { label: "参与人数", value: scores.length, tone: "cyan" },
    { label: "班级均分", value: avg, tone: "violet" },
    { label: "满分人数", value: full, tone: "amber" },
    { label: "优秀率 ≥90", value: `${excellentPct}%`, tone: "emerald" },
  ];

  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconTrophy className="h-8 w-8" />}
        title="课前预习 · 实时分数榜"
        sub="学生作答即时判分并上传大屏"
        large
        tone="cyan"
        right={<LiveBadge />}
      />

      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {statCards.map((c, i) => (
          <Card key={c.label} tone={c.tone} className={`rise-${i + 1} p-5`}>
            <div className="text-sm text-slate-500">{c.label}</div>
            <div className="grad-text mt-1 text-5xl font-extrabold tabular-nums">
              {c.value}
            </div>
          </Card>
        ))}
      </div>

      {/* 领奖台 */}
      <div className="mb-6 grid grid-cols-3 items-end gap-5">
        {[1, 0, 2].map((idx) => {
          const s = scores[idx];
          if (!s) return <div key={idx} />;
          const h = idx === 0 ? "h-44" : "h-36";
          const tone = PODIUM_TONES[idx];
          return (
            <Card key={s.studentId} tone={tone} className={`flex flex-col items-center justify-end p-5 ${h}`}>
              <div className="text-3xl">{medal(idx)}</div>
              <Avatar
                name={s.name}
                color={["#fbbf24", "#cbd5e1", "#d97706"][idx]}
                size={idx === 0 ? 56 : 46}
              />
              <div className="mt-2 font-semibold text-slate-900">{s.name}</div>
              <div className="grad-text text-3xl font-extrabold tabular-nums">{s.score}</div>
            </Card>
          );
        })}
      </div>

      {/* 分数段分布 */}
      <Card className="mb-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">分数段分布</h3>
          <span className="text-xs text-slate-500">共 {scores.length} 人参与</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {bands.map((b) => (
            <div key={b.label} className={`tone-${b.tone} rounded-xl border bg-slate-900/[0.03] p-4`} style={{ borderColor: "var(--tone-line)" }}>
              <div className="flex items-baseline justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--tone)" }} />
                  {b.label}
                </span>
                <span className="grad-text text-2xl font-extrabold tabular-nums">{b.count} 人</span>
              </div>
              <div className="mt-3">
                <Bar value={b.count} max={scores.length || 1} color={TONE_HEX[b.tone]} height={8} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card tone="cyan" className="divide-y divide-slate-900/5">
        {scores.map((s, i) => (
          <div key={s.studentId} className="flex items-center gap-4 p-4">
            <span
              className={`w-8 text-center text-lg font-bold ${
                i < 3 ? "text-amber-600" : "text-slate-500"
              }`}
            >
              {i + 1}
            </span>
            <Avatar name={s.name} color="#22d3ee" size={40} />
            <div className="w-28 truncate text-sm font-medium text-slate-900">
              {s.name}
            </div>
            <div className="flex-1">
              <Bar
                value={s.score}
                color={
                  s.score >= 90
                    ? "#34d399"
                    : s.score >= 75
                    ? "#22d3ee"
                    : "#fbbf24"
                }
              />
            </div>
            <span className="w-12 text-right text-xl font-bold tabular-nums text-cyan-600">
              {s.score}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}