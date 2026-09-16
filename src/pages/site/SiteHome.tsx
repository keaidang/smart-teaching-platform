import { IconBook, IconCpu } from "../../components/icons";
import { Card } from "../../components/ui";

const GUIDE_STEPS = [
  { step: "01", title: "课程定位", desc: "Python 数据采集全流程" },
  { step: "02", title: "四阶闭环", desc: "需求 → 采集 → 清洗融合 → 可视化" },
  { step: "03", title: "三维目标", desc: "知识 · 能力 · 素养" },
  { step: "04", title: "学习路径", desc: "课前预习 → 课中实操 → 课后习题 → 项目交付" },
];

const TECH_GROUPS = [
  { name: "数据采集", color: "#22d3ee", tags: ["Python", "Requests", "BeautifulSoup", "PySerial"] },
  { name: "清洗处理", color: "#34d399", tags: ["Pandas", "NumPy"] },
  { name: "可视化呈现", color: "#a78bfa", tags: ["ECharts", "Kepler.gl"] },
];

export default function SiteHome() {
  return (
    <div className="flex flex-col gap-6 lg:h-full lg:min-h-0">
      {/* 顶部横幅：居中式 hero */}
      <div className="relative shrink-0 overflow-hidden rounded-2xl border border-brand-400/15 bg-gradient-to-r from-brand-500/12 via-brand-500/4 to-transparent px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(500px_circle_at_15%_0%,rgba(34,211,238,0.22),transparent_70%)]" />
        <div className="relative flex flex-col items-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <h1 className="bg-gradient-to-r from-white via-brand-100 to-brand-300 bg-clip-text text-4xl font-extrabold tracking-wide text-transparent lg:text-5xl">
              数智社区 · 教学资源库
            </h1>
            <span className="rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1 text-sm font-medium tracking-widest text-brand-200">
              数据全生命周期
            </span>
          </div>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-brand-200/75">
            以 Python 数据采集为核心，融合项目实战、产教资源、拓展课程与智能达成度评价，面向师生提供一体化的数据服务教学资源平台。
          </p>
          <div className="mt-5 flex items-center justify-center gap-10">
            <Stat value="4" label="实战项目" />
            <Stat value="8" label="任务工单" />
            <Stat value="20+" label="技术工具" />
          </div>
        </div>
      </div>

      {/* 课程导学 + 技术资源库（铺满剩余空间） */}
      <div className="grid min-h-0 flex-1 gap-6 md:grid-cols-2">
        <Card hover className="flex h-full min-h-0 flex-col p-8">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
              <IconBook className="h-9 w-9" />
            </span>
            <div>
              <h2 className="text-3xl font-bold text-white">课程导学</h2>
              <p className="mt-1 text-base text-brand-200/60">快速了解课程全局与学习路径</p>
            </div>
          </div>
          <div className="mt-7 flex min-h-0 flex-1 flex-col gap-4">
            {GUIDE_STEPS.map((g) => (
              <div
                key={g.step}
                className="group flex min-h-0 flex-1 items-center gap-5 rounded-xl border border-brand-400/10 bg-brand-500/[0.04] px-6 transition-colors hover:border-brand-400/25 hover:bg-brand-500/[0.08]"
              >
                <span className="text-glow text-3xl font-extrabold tracking-wider text-brand-400/70 transition-colors group-hover:text-brand-300">
                  {g.step}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xl font-semibold text-white">{g.title}</div>
                  <div className="truncate text-base text-brand-200/65">{g.desc}</div>
                </div>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-400/40 transition-colors group-hover:bg-brand-300" />
              </div>
            ))}
          </div>
        </Card>

        <Card hover className="flex h-full min-h-0 flex-col p-8">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <IconCpu className="h-9 w-9" />
            </span>
            <div>
              <h2 className="text-3xl font-bold text-white">技术资源库</h2>
              <p className="mt-1 text-base text-brand-200/60">工具、环境与技术基础速查</p>
            </div>
          </div>
          <div className="mt-7 flex min-h-0 flex-1 flex-col gap-4">
            {TECH_GROUPS.map((g) => (
              <div
                key={g.name}
                className="flex min-h-0 flex-1 flex-col justify-center rounded-xl border border-brand-400/10 bg-brand-500/[0.04] px-6 py-4 transition-colors hover:border-brand-400/25 hover:bg-brand-500/[0.08]"
              >
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: g.color }} />
                  <span className="text-lg font-bold tracking-wide" style={{ color: g.color }}>
                    {g.name}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {g.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-brand-400/20 bg-brand-500/5 px-4 py-2 text-base font-medium text-brand-100 transition-colors hover:border-brand-400/40 hover:bg-brand-500/12"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-glow text-3xl font-extrabold text-brand-300">{value}</div>
      <div className="mt-0.5 text-sm text-brand-200/50">{label}</div>
    </div>
  );
}
