import { Link } from "react-router-dom";
import {
  IconBook,
  IconCpu,
  IconChart,
  IconUsers,
  IconClock,
  IconLayers,
  IconBoard,
  IconGauge,
  IconCheck,
  IconUpload,
  IconSkill,
  IconIdea,
} from "../../components/icons";
import { Card, SectionTitle, Stat, Tag, type Tone } from "../../components/ui";
import { PROJECTS, ACTIVE_TASK_ID, findTask, ACTIVE_HOMEWORK } from "../../lib/course";

const GUIDE_STEPS = [
  { step: "01", title: "课程定位", desc: "Python 数据采集全流程", tone: "cyan" as Tone },
  { step: "02", title: "四阶闭环", desc: "需求 → 采集 → 清洗融合 → 可视化", tone: "blue" as Tone },
  { step: "03", title: "三维目标", desc: "知识 · 能力 · 素养", tone: "violet" as Tone },
  { step: "04", title: "学习路径", desc: "课前预习 → 课中实操 → 课后习题 → 项目交付", tone: "rose" as Tone },
];

const TECH_GROUPS: { name: string; desc: string; tone: Tone; tags: string[] }[] = [
  { name: "数据采集", desc: "网页 · 接口 · 传感多通道获取", tone: "cyan", tags: ["Python", "Requests", "BeautifulSoup", "PySerial"] },
  { name: "清洗处理", desc: "去重 · 规整 · 质量校验", tone: "emerald", tags: ["Pandas", "NumPy", "OpenPyXL"] },
  { name: "可视化呈现", desc: "图表 · 看板 · 地理空间", tone: "rose", tags: ["ECharts", "Kepler.gl", "Matplotlib"] },
];

const PROJECT_TONES: Record<string, Tone> = { P1: "cyan", P2: "emerald", P3: "violet", P4: "rose" };
const PROJECT_ICONS: Record<string, typeof IconChart> = { P1: IconCpu, P2: IconLayers, P3: IconLayers, P4: IconChart };

const PATH_STEPS = [
  { title: "课前预习", desc: "任务工单研读 + 课前检测，带着问题进课堂", icon: IconBook, tone: "cyan" as Tone },
  { title: "课中实操", desc: "小组协作完成采集、清洗与融合实操任务", icon: IconSkill, tone: "blue" as Tone },
  { title: "课后习题", desc: "在线习题即时反馈，巩固知识与合规意识", icon: IconCheck, tone: "emerald" as Tone },
  { title: "项目交付", desc: "按企业工单标准打包交付，多元评价达成度", icon: IconUpload, tone: "rose" as Tone },
];

const ENTRIES = [
  { to: "/student", title: "学生入口", desc: "预习检测 · 作业提交 · 习题练习 · AI 助学", icon: IconUsers, tone: "blue" as Tone },
  { to: "/class", title: "教师大屏", desc: "课堂实时数据 · 学情看板 · 答案公布", icon: IconBoard, tone: "violet" as Tone },
  { to: "/evaluation", title: "达成度评价", desc: "教师 · 企业 · AI 三维小组评价分析", icon: IconGauge, tone: "emerald" as Tone },
];

export default function SiteHome() {
  const active = findTask(ACTIVE_TASK_ID);
  const totalHours = PROJECTS.reduce((a, p) => a + p.hours, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* 顶部多彩横幅 */}
      <div className="hero-mesh animate-rise relative shrink-0 overflow-hidden rounded-2xl border border-slate-900/10 px-7 py-9">
        <div className="relative flex flex-col items-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <h1 className="hero-title text-4xl font-extrabold tracking-wide lg:text-5xl">
              数智社区 · 教学资源库
            </h1>
            <span className="chip-tone tone-violet rounded-full px-4 py-1 text-sm font-medium tracking-widest">
              数据全生命周期
            </span>
          </div>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-slate-600">
            以 Python 数据采集为核心，融合项目实战、产教资源、拓展课程与智能达成度评价，面向师生提供一体化的数据服务教学资源平台。
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Stat value="4" label="实战项目" tone="cyan" />
            <Stat value="8" label="任务工单" tone="blue" />
            <Stat value={totalHours} label="课时总量" tone="violet" />
            <Stat value="28" label="在班学生" tone="rose" />
            <Stat value="7" label="学习小组" tone="emerald" />
            <Stat value="20+" label="技术工具" tone="amber" />
          </div>
        </div>
      </div>

      {/* 当前进行中任务 */}
      {active && (
        <Link to={`/projects/task/${active.task.id}`} className="animate-rise rise-1 block">
          <Card tone="cyan" hover className="flex flex-wrap items-center gap-4 px-6 py-4">
            <span className="tone-cyan chip-tone rounded-full px-3 py-1 text-xs font-semibold tracking-wider">
              进行中
            </span>
            <span className="text-lg font-semibold text-slate-900">
              {active.project.title} · {active.task.title}
            </span>
            <span className="text-sm text-slate-500">
              依据企业任务工单 SQ-2026-001 · 8 步课堂任务清单
            </span>
            <span className="ml-auto flex items-center gap-2 text-sm text-brand-600">
              <IconClock className="h-4 w-4" />
              作业截止 {ACTIVE_HOMEWORK.deadline} · 查看任务 →
            </span>
          </Card>
        </Link>
      )}

      {/* 课程导学 + 技术资源库 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card tone="cyan" hover className="animate-rise rise-1 flex flex-col p-8">
          <SectionTitle icon={<IconBook className="h-7 w-7" />} title="课程导学" sub="快速了解课程全局与学习路径" tone="cyan" />
          <div className="flex flex-1 flex-col gap-4">
            {GUIDE_STEPS.map((g) => (
              <div
                key={g.step}
                className={`tone-${g.tone} group flex flex-1 items-center gap-5 rounded-xl border border-slate-900/8 bg-slate-900/[0.03] px-6 py-3 transition-all hover:bg-slate-900/[0.06]`}
                style={{ borderColor: "var(--tone-line)" }}
              >
                <span className="grad-text text-3xl font-extrabold tracking-wider">{g.step}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xl font-semibold text-slate-900">{g.title}</div>
                  <div className="truncate text-base text-slate-500">{g.desc}</div>
                </div>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform group-hover:scale-125" style={{ background: "var(--tone)" }} />
              </div>
            ))}
          </div>
        </Card>

        <Card tone="violet" hover className="animate-rise rise-2 flex flex-col p-8">
          <SectionTitle icon={<IconCpu className="h-7 w-7" />} title="技术资源库" sub="工具、环境与技术基础速查" tone="violet" />
          <div className="flex flex-1 flex-col gap-4">
            {TECH_GROUPS.map((g) => (
              <div
                key={g.name}
                className={`tone-${g.tone} flex flex-1 flex-col justify-center rounded-xl border bg-slate-900/[0.03] px-6 py-4 transition-colors hover:bg-slate-900/[0.06]`}
                style={{ borderColor: "var(--tone-line)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: "var(--tone)", boxShadow: "0 0 10px var(--tone-glow)" }} />
                  <span className="text-lg font-bold tracking-wide" style={{ color: "var(--tone)" }}>{g.name}</span>
                  <span className="text-sm text-slate-500">{g.desc}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {g.tags.map((t) => (
                    <Tag key={t} tone={g.tone} className="px-4 py-2 text-base">{t}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 四大项目速览 */}
      <div className="animate-rise rise-2">
        <SectionTitle
          icon={<IconLayers className="h-6 w-6" />}
          title="四大实战项目"
          sub="围绕社区真实场景，走完数据全生命周期"
          tone="blue"
          right={<Link to="/projects" className="text-sm text-blue-600 transition-colors hover:text-blue-600">全部项目 →</Link>}
        />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PROJECTS.map((p, i) => {
            const tone = PROJECT_TONES[p.id];
            const PIcon = PROJECT_ICONS[p.id];
            const activeCount = p.tasks.filter((t) => t.active).length;
            return (
              <Link key={p.id} to="/projects">
                <Card tone={tone} hover className={`rise-${i + 1} flex h-full flex-col p-6`}>
                  <div className="flex items-center justify-between">
                    <span className={`tone-${tone} icon-chip h-12 w-12 rounded-xl`}>
                      <PIcon className="h-6 w-6" />
                    </span>
                    <span className={`tone-${tone} grad-text text-2xl font-extrabold`}>{p.id}</span>
                  </div>
                  <div className="mt-4 text-lg font-bold leading-snug text-slate-900">{p.title}</div>
                  <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><IconClock className="h-4 w-4" />{p.hours} 课时</span>
                    <span>{p.tasks.length} 个任务</span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {p.tasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 text-[13px] text-slate-500">
                        <span className={`h-1.5 w-1.5 rounded-full ${t.active ? "" : "opacity-30"}`} style={{ background: t.active ? "var(--tone)" : "#64748b" }} />
                        <span className={t.active ? "text-slate-700" : ""}>{t.title}</span>
                        {t.isNew && <span className="tone-rose chip-tone rounded px-1 py-px text-[10px] font-semibold">新增</span>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-4">
                    {activeCount > 0 ? (
                      <Tag tone={tone}>{activeCount} 个任务进行中</Tag>
                    ) : (
                      <Tag tone="amber" className="opacity-70">待开放</Tag>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 学习路径 */}
      <Card className="animate-rise rise-3 p-8">
        <SectionTitle icon={<IconIdea className="h-6 w-6" />} title="学习路径" sub="四阶闭环 · 从预习到交付的完整学习旅程" tone="rose" />
        <div className="grid gap-5 md:grid-cols-4">
          {PATH_STEPS.map((s, i) => (
            <div key={s.title} className={`tone-${s.tone} relative rounded-xl border bg-slate-900/[0.03] p-5`} style={{ borderColor: "var(--tone-line)" }}>
              <div className="flex items-center gap-3">
                <span className="icon-chip h-11 w-11 rounded-xl"><s.icon className="h-5 w-5" /></span>
                <span className="grad-text text-2xl font-extrabold">0{i + 1}</span>
              </div>
              <div className="mt-3 text-lg font-bold text-slate-900">{s.title}</div>
              <div className="mt-1 text-sm leading-relaxed text-slate-500">{s.desc}</div>
              {i < PATH_STEPS.length - 1 && (
                <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-slate-600 md:block">→</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 快速入口 */}
      <div className="animate-rise rise-4 grid gap-5 md:grid-cols-3">
        {ENTRIES.map((e) => (
          <Link key={e.to} to={e.to}>
            <Card tone={e.tone} hover className="flex h-full items-center gap-4 p-6">
              <span className={`tone-${e.tone} icon-chip h-14 w-14 shrink-0 rounded-xl`}>
                <e.icon className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <div className="text-xl font-bold text-slate-900">{e.title} →</div>
                <div className="mt-0.5 truncate text-sm text-slate-500">{e.desc}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}