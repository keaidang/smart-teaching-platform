import { useNavigate } from "react-router-dom";
import { Card, SectionTitle } from "../../components/ui";
import { IconBook } from "../../components/icons";
import { PROJECTS } from "../../lib/course";

const PCOLORS = ["#22d3ee", "#34d399", "#a78bfa", "#fbbf24"];

export default function Projects() {
  const nav = useNavigate();
  return (
    <div className="flex flex-1 flex-col animate-rise">
      <SectionTitle
        icon={<IconBook className="h-6 w-6" />}
        title="项目学习资源"
        sub="数智社区 · 数据生命周期四项目"
      />

      <div className="grid flex-1 gap-6 md:grid-cols-2">
        {PROJECTS.map((p, pi) => {
          const color = PCOLORS[pi % PCOLORS.length];
          return (
            <Card key={p.id} className="flex h-full flex-col overflow-hidden p-0">
              <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-6 py-4" style={{ background: `${color}12` }}>
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg text-sm font-bold" style={{ background: `${color}22`, color }}>
                    {pi + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{p.title}</div>
                    <div className="text-xs text-brand-200/50">{p.hours} 课时</div>
                  </div>
                </div>
              </div>

              <ul className="flex flex-1 flex-col divide-y divide-white/5">
                {p.tasks.map((t, ti) => (
                  <li key={t.id} className="flex min-h-0 flex-1">
                    <button
                      onClick={() => t.active && nav(`/projects/task/${t.id}`)}
                      className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-white/5"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/5 text-[11px] font-semibold text-brand-200/60">
                        {ti + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-sm text-brand-100">{t.title}</span>
                      <span className="shrink-0 text-xs font-medium text-brand-300">进入 →</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
