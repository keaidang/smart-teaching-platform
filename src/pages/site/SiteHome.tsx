import { Link } from "react-router-dom";
import {
  IconBook,
  IconCpu,
  IconFactory,
  IconExpand,
  IconGauge,
} from "../../components/icons";
import { Card } from "../../components/ui";

const MODULES = [
  { to: "/projects", title: "项目学习资源", desc: "围绕数据生命周期构建的全流程实战项目", icon: IconBook, color: "#22d3ee" },
  { to: "/industry", title: "产教融合资源", desc: "真实行业场景与企业级资源产学对接", icon: IconFactory, color: "#34d399" },
  { to: "/extensions", title: "拓展课程资源", desc: "前沿技术 · 赛证融通 · 跨领域 · 合规", icon: IconExpand, color: "#a78bfa" },
  { to: "/evaluation", title: "教学评价资源", desc: "多维 · 智能 · 全过程学习质量评价", icon: IconGauge, color: "#fbbf24" },
];

function Placeholder({ label }: { label: string }) {
  return (
    <div className="relative grid h-52 place-items-center overflow-hidden rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-800/40 via-ink-700/40 to-ink-900/60">
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.35),transparent_60%)]" />
      <div className="relative text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
          <IconCpu className="h-6 w-6" />
        </div>
        <div className="text-sm font-medium text-brand-100/80">{label}</div>
        <div className="mt-1 text-xs text-brand-200/40">资源待上传 · 占位展示</div>
      </div>
    </div>
  );
}

export default function SiteHome() {
  return (
    <div className="animate-rise space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-brand-400/15 bg-gradient-to-b from-brand-500/10 to-transparent px-8 py-12 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(600px_circle_at_50%_-10%,rgba(34,211,238,0.25),transparent_70%)]" />
        <div className="relative">
          <span className="inline-block rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1 text-xs font-medium tracking-widest text-brand-200">
            数智社区 · 数据全生命周期
          </span>
          <h1 className="mt-5 bg-gradient-to-r from-white via-brand-100 to-brand-300 bg-clip-text text-4xl font-extrabold tracking-wide text-transparent md:text-5xl">
            数智社区 · 信息采集教学平台
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-brand-200/75">
            以 Python 数据采集为核心，融合项目实战、产教资源、拓展课程与智能达成度评价，
            面向师生提供一体化的数据服务教学资源平台。
          </p>
        </div>
      </div>

      {/* 课程导学 + 技术资源库 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card hover className="p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
              <IconBook className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">课程导学</h2>
              <p className="text-sm text-brand-200/60">快速了解课程全局与学习路径</p>
            </div>
          </div>
          <ul className="mt-5 space-y-2.5 text-sm text-brand-100/80">
            {["课程定位：Python 数据采集全流程", "四阶闭环：需求→采集→清洗融合→可视化", "三维目标：知识 · 能力 · 素养"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                {t}
              </li>
            ))}
          </ul>
        </Card>

        <Card hover className="p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <IconCpu className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">技术资源库</h2>
              <p className="text-sm text-brand-200/60">工具、环境与技术基础速查</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Python", "PySerial", "Requests", "BeautifulSoup", "Pandas", "NumPy", "Kepler.gl", "ECharts"].map((t) => (
              <span key={t} className="rounded-lg border border-brand-400/20 bg-brand-500/5 px-3 py-1.5 text-xs text-brand-100">
                {t}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* 图片1 / 图片2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Placeholder label="图片 1" />
        <Placeholder label="图片 2" />
      </div>

      {/* 四大模块快捷导航 */}
      <div>
        <h3 className="mb-4 text-sm font-medium tracking-widest text-brand-200/60">
          核心资源模块
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <Link key={m.to} to={m.to}>
              <Card hover className="h-full p-6">
                <span
                  className="grid h-12 w-12 place-items-center rounded-xl"
                  style={{ background: `${m.color}22`, color: m.color }}
                >
                  <m.icon className="h-6 w-6" />
                </span>
                <div className="mt-4 text-lg font-semibold text-white">{m.title}</div>
                <div className="mt-1.5 text-sm leading-relaxed text-brand-200/60">
                  {m.desc}
                </div>
                <div className="mt-4 text-sm font-medium" style={{ color: m.color }}>
                  进入 →
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
