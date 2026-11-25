import { useNavigate } from "react-router-dom";
import { Card, SectionTitle, Stat, Tag, Bar, TONE_HEX, type Tone } from "../../components/ui";
import { IconBook, IconClock, IconLayers, IconCpu, IconChart, IconSkill } from "../../components/icons";
import { PROJECTS, GROUPS } from "../../lib/course";

const PROJECT_TONES: Record<string, Tone> = { P1: "cyan", P2: "emerald", P3: "violet", P4: "rose" };
const PROJECT_ICONS: Record<string, typeof IconChart> = { P1: IconCpu, P2: IconSkill, P3: IconLayers, P4: IconChart };

const PROJECT_META: Record<string, { stage: string; goal: string; tools: string[] }> = {
  P1: {
    stage: "采集",
    goal: "能依据企业工单设计多源采集方案，完成民意文本、传感与视觉数据的合规获取。",
    tools: ["Python", "Requests", "BeautifulSoup", "PySerial", "K230 CanMV"],
  },
  P2: {
    stage: "清洗",
    goal: "能完成去重、脱敏、质量校验与多模态规整，把原始数据治理为可用数据集。",
    tools: ["Pandas", "NumPy", "OpenPyXL"],
  },
  P3: {
    stage: "融合",
    goal: "能设计结构化入库与索引，完成多源表关联与实体对齐，搭建社区数据底座。",
    tools: ["SQLite", "SQL", "Pandas"],
  },
  P4: {
    stage: "可视",
    goal: "能构建单维度看板与综合治理大屏，用图表讲清数据结论并汇报治理成果。",
    tools: ["ECharts", "Kepler.gl", "Matplotlib"],
  },
};

export default function Projects() {
  const nav = useNavigate();
  const totalHours = PROJECTS.reduce((a, p) => a + p.hours, 0);
  const totalTasks = PROJECTS.reduce((a, p) => a + p.tasks.length, 0);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* 顶部模块色横幅 */}
      <div className="hero-mesh animate-rise relative shrink-0 overflow-hidden rounded-2xl border border-slate-900/10 px-7 py-9">
        <div className="tone-blue relative flex flex-col items-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <h1 className="grad-text text-4xl font-extrabold tracking-wide lg:text-5xl">项目学习资源</h1>
            <span className="chip-tone tone-cyan rounded-full px-4 py-1 text-sm font-medium tracking-widest">
              数据生命周期 · 四阶闭环
            </span>
          </div>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-slate-600">
            围绕数智社区真实场景，以「采集 → 清洗 → 融合 → 可视」四个项目走完数据全生命周期，
            每个项目配套企业任务工单与课堂任务清单，做中学、学中评。
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Stat value={PROJECTS.length} label="实战项目" tone="cyan" />
            <Stat value={totalTasks} label="任务工单" tone="blue" />
            <Stat value={totalHours} label="课时总量" tone="violet" />
            <Stat value={GROUPS.length} label="协作小组" tone="emerald" />
            <Stat value="28" label="在班学生" tone="rose" />
          </div>
        </div>
      </div>

      {/* 课时分布 · 四阶闭环 */}
      <Card tone="blue" className="animate-rise rise-1 p-8">
        <SectionTitle
          icon={<IconClock className="h-6 w-6" />}
          title="课时分布 · 四阶闭环"
          sub={`课程共 ${totalHours} 课时，四个项目依次递进、环环相扣`}
          tone="blue"
        />
        <div className="grid gap-5 md:grid-cols-4">
          {PROJECTS.map((p, i) => {
            const tone = PROJECT_TONES[p.id];
            const meta = PROJECT_META[p.id];
            return (
              <div
                key={p.id}
                className={`tone-${tone} relative rounded-xl border bg-slate-900/[0.03] p-5`}
                style={{ borderColor: "var(--tone-line)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="grad-text text-3xl font-extrabold">0{i + 1}</span>
                  <Tag tone={tone}>{meta.stage}</Tag>
                </div>
                <div className="mt-3 text-lg font-bold leading-snug text-slate-900">{p.title}</div>
                <div className="mt-3">
                  <Bar value={p.hours} max={8} color={TONE_HEX[tone]} height={8} />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-semibold" style={{ color: "var(--tone)" }}>{p.hours} 课时</span>
                  <span className="text-slate-500">占 {((p.hours / totalHours) * 100).toFixed(1)}%</span>
                </div>
                {i < PROJECTS.length - 1 && (
                  <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-slate-600 md:block">→</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 四大项目 · 任务入口 */}
      <div className="animate-rise rise-2">
        <SectionTitle
          icon={<IconBook className="h-6 w-6" />}
          title="项目任务入口"
          sub="点击已开放任务进入工单详情与课堂任务清单"
          tone="blue"
        />
        <div className="grid gap-6 md:grid-cols-2">
          {PROJECTS.map((p) => {
            const tone = PROJECT_TONES[p.id];
            const PIcon = PROJECT_ICONS[p.id];
            return (
              <Card key={p.id} tone={tone} hover className="flex h-full flex-col overflow-hidden p-0">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-900/5 px-7 py-5">
                  <div className="flex items-center gap-4">
                    <span className={`tone-${tone} icon-chip h-12 w-12 rounded-xl`}>
                      <PIcon className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{p.title}</div>
                      <div className="mt-0.5 text-sm text-slate-500">{p.hours} 课时 · {p.tasks.length} 个任务</div>
                    </div>
                  </div>
                  <span className={`tone-${tone} grad-text text-2xl font-extrabold`}>{p.id}</span>
                </div>

                <ul className="divide-y divide-slate-900/5">
                  {p.tasks.map((t, ti) => (
                    <li key={t.id} className="flex items-stretch">
                      <button
                        onClick={() => t.active && nav(`/projects/task/${t.id}`)}
                        className="group flex w-full items-center gap-4 px-7 py-5 text-left transition-colors hover:bg-slate-900/5"
                      >
                        <span className={`tone-${tone} chip-tone grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold`}>
                          {ti + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 text-base font-medium text-slate-900">
                            {t.title}
                            {t.status === "new" && (
                              <span className="rounded-md bg-rose-500/12 px-2 py-0.5 text-[11px] font-semibold text-rose-600">新增</span>
                            )}
                            {t.status === "ongoing" && (
                              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600">进行中</span>
                            )}
                            {t.status === "open" && (
                              <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-600">已开放</span>
                            )}
                          </span>
                          <span className="mt-1 block truncate text-[13px] text-slate-500">
                            {t.desc}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-medium transition-transform group-hover:translate-x-0.5" style={{ color: "var(--tone)" }}>
                          进入 →
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 项目能力目标 · 工具链 */}
      <Card tone="violet" className="animate-rise rise-3 p-8">
        <SectionTitle
          icon={<IconSkill className="h-6 w-6" />}
          title="项目能力目标 · 工具链"
          sub="每个项目要练成的核心能力与配套技术工具"
          tone="violet"
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {PROJECTS.map((p) => {
            const tone = PROJECT_TONES[p.id];
            const meta = PROJECT_META[p.id];
            const PIcon = PROJECT_ICONS[p.id];
            return (
              <div
                key={p.id}
                className={`tone-${tone} flex flex-col rounded-xl border bg-slate-900/[0.03] p-5 transition-colors hover:bg-slate-900/[0.06]`}
                style={{ borderColor: "var(--tone-line)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="icon-chip h-11 w-11 rounded-xl"><PIcon className="h-5 w-5" /></span>
                  <div>
                    <div className="text-base font-bold text-slate-900">{p.id} · {meta.stage}</div>
                    <div className="text-xs text-slate-500">{p.hours} 课时 · {p.tasks.length} 任务</div>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{meta.goal}</p>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-900/5 pt-4">
                  {meta.tools.map((t) => (
                    <Tag key={t} tone={tone} className="px-2.5 py-0.5 text-xs">{t}</Tag>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}