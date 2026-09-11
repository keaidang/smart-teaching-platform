import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { PreviewScore } from "../../lib/types";
import { IconTrophy } from "../../components/icons";
import { Avatar, Bar, Card, LiveBadge, SectionTitle } from "../../components/ui";

function medal(i: number) {
  return ["🥇", "🥈", ""][i];
}

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

  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconTrophy className="h-6 w-6" />}
        title="课前预习 · 实时分数榜"
        sub="学生作答即时判分并上传大屏"
        right={<LiveBadge />}
      />

      <div className="mb-6 grid grid-cols-3 gap-5">
        <Card className="p-5">
          <div className="text-sm text-brand-200/70">参与人数</div>
          <div className="mt-1 text-3xl font-bold text-white">
            {scores.length}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-brand-200/70">班级均分</div>
          <div className="mt-1 text-3xl font-bold text-brand-300">{avg}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-brand-200/70">满分人数</div>
          <div className="mt-1 text-3xl font-bold text-amber-300">{full}</div>
        </Card>
      </div>

      {/* 领奖台 */}
      <div className="mb-6 grid grid-cols-3 items-end gap-5">
        {[1, 0, 2].map((idx) => {
          const s = scores[idx];
          if (!s) return <div key={idx} />;
          const h = idx === 0 ? "h-40" : "h-32";
          return (
            <Card key={s.studentId} className={`flex flex-col items-center justify-end p-5 ${h}`}>
              <div className="text-3xl">{medal(idx)}</div>
              <Avatar
                name={s.name}
                color={["#fbbf24", "#cbd5e1", "#d97706"][idx]}
                size={idx === 0 ? 56 : 46}
              />
              <div className="mt-2 font-semibold text-white">{s.name}</div>
              <div className="text-2xl font-bold text-brand-300">{s.score}</div>
            </Card>
          );
        })}
      </div>

      <Card className="divide-y divide-white/5">
        {scores.map((s, i) => (
          <div key={s.studentId} className="flex items-center gap-4 p-4">
            <span
              className={`w-8 text-center text-lg font-bold ${
                i < 3 ? "text-amber-300" : "text-brand-200/50"
              }`}
            >
              {i + 1}
            </span>
            <Avatar name={s.name} color="#22d3ee" size={40} />
            <div className="w-28 truncate text-sm font-medium text-white">
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
            <span className="w-12 text-right text-xl font-bold text-brand-100">
              {s.score}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
