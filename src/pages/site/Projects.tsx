import { Link } from "react-router-dom";
import { Card, SectionTitle } from "../../components/ui";
import { IconBook, IconCheck } from "../../components/icons";
import { PROJECTS } from "../../lib/course";

const PCOLORS = ["#22d3ee", "#34d399", "#a78bfa", "#fbbf24"];

export default function Projects() {
  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconBook className="h-6 w-6" />}
        title="项目学习资源"
        sub="数智社区 · 数据生命周期四项目 · 当前开放：传感与视觉数据清洗"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {PROJECTS.map((p, pi) => {
          const color = PCOLORS[pi % PCOLORS.length];
          return (
            <Card key={p.id} className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-4" style={{ background: `${color}12` }}>
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

              <ul className="divide-y divide-white/5">
                {p.tasks.map((t) => {
                  const to = `/projects/task/${t.id}`;
                  const inner = (
                    <>
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-semibold ${t.active ? "text-ink-900" : "bg-white/5 text-brand-200/40"}`} style={t.active ? { background: color } : undefined}>
                        {t.active ? <IconCheck className="h-4 w-4" strokeWidth={3} /> : t.id.slice(-2)}
                      </span>
                      <span className={`min-w-0 flex-1 text-sm ${t.active ? "text-white" : "text-brand-200/50"}`}>
                        {t.title}
                      </span>
                      <span className={`shrink-0 text-xs font-medium ${t.active ? "" : "text-brand-200/30"}`} style={t.active ? { color } : undefined}>
                        {t.active ? "进入 →" : "未开放"}
                      </span>
                    </>
                  );
                  return (
                    <li key={t.id}>
                      {t.active ? (
                        <Link to={to} className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-white/5">
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex cursor-not-allowed items-center gap-3 px-6 py-4 opacity-70">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
