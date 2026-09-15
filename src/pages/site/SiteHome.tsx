import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IconBook,
  IconCpu,
  IconFactory,
  IconExpand,
  IconGauge,
} from "../../components/icons";
import { Card } from "../../components/ui";

const MODULES = [
  { id: "mod-projects", to: "/projects", title: "项目学习资源", desc: "围绕数据生命周期构建的全流程实战项目", icon: IconBook, color: "#22d3ee" },
  { id: "mod-industry", to: "/industry", title: "产教融合资源", desc: "真实行业场景与企业级资源产学对接", icon: IconFactory, color: "#34d399" },
  { id: "mod-extensions", to: "/extensions", title: "拓展课程资源", desc: "前沿技术 · 赛证融通 · 跨领域 · 合规", icon: IconExpand, color: "#a78bfa" },
  { id: "mod-evaluation", to: "/evaluation", title: "教学评价资源", desc: "多维 · 智能 · 全过程学习质量评价", icon: IconGauge, color: "#fbbf24" },
];

const GUIDE_STEPS = [
  { step: "01", title: "课程定位", desc: "Python 数据采集全流程" },
  { step: "02", title: "四阶闭环", desc: "需求 → 采集 → 清洗融合 → 可视化" },
  { step: "03", title: "三维目标", desc: "知识 · 能力 · 素养" },
];

const TECH_TAGS = ["Python", "PySerial", "Requests", "BeautifulSoup", "Pandas", "NumPy", "Kepler.gl", "ECharts"];

export default function SiteHome() {
  const { hash } = useLocation();
  const [flash, setFlash] = useState<string | null>(null);

  // 从大屏等入口带锚点跳转进来时：滚动到对应模块并短暂高亮
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlash(id);
      setTimeout(() => setFlash(null), 2400);
    }, 350);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="flex flex-col gap-5 lg:h-full lg:min-h-0">
      {/* 顶部横幅：紧凑单行式 hero */}
      <div className="relative shrink-0 overflow-hidden rounded-2xl border border-brand-400/15 bg-gradient-to-r from-brand-500/12 via-brand-500/4 to-transparent px-7 py-5">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(500px_circle_at_15%_0%,rgba(34,211,238,0.22),transparent_70%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="bg-gradient-to-r from-white via-brand-100 to-brand-300 bg-clip-text text-2xl font-extrabold tracking-wide text-transparent lg:text-3xl">
                数智社区 · 教学资源库
              </h1>
              <span className="rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-0.5 text-[11px] font-medium tracking-widest text-brand-200">
                数据全生命周期
              </span>
            </div>
            <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-brand-200/70">
              以 Python 数据采集为核心，融合项目实战、产教资源、拓展课程与智能达成度评价，面向师生提供一体化的数据服务教学资源平台。
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-6 text-right md:flex">
            <Stat value="4" label="实战项目" />
            <Stat value="8" label="任务工单" />
            <Stat value="20+" label="技术工具" />
          </div>
        </div>
      </div>

      {/* 中部：课程导学 + 技术资源库（放大主区） */}
      <div className="grid min-h-0 flex-1 gap-5 md:grid-cols-2">
        <Card hover className="flex h-full min-h-0 flex-col p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
              <IconBook className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">课程导学</h2>
              <p className="text-sm text-brand-200/60">快速了解课程全局与学习路径</p>
            </div>
          </div>
          <div className="mt-5 grid flex-1 content-center gap-3">
            {GUIDE_STEPS.map((g) => (
              <div
                key={g.step}
                className="group flex items-center gap-4 rounded-xl border border-brand-400/10 bg-brand-500/[0.04] px-4 py-3 transition-colors hover:border-brand-400/25 hover:bg-brand-500/[0.08]"
              >
                <span className="text-glow text-lg font-extrabold tracking-wider text-brand-400/70 transition-colors group-hover:text-brand-300">
                  {g.step}
                </span>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-white">{g.title}</div>
                  <div className="truncate text-[13px] text-brand-200/65">{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card hover className="flex h-full min-h-0 flex-col p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <IconCpu className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">技术资源库</h2>
              <p className="text-sm text-brand-200/60">工具、环境与技术基础速查</p>
            </div>
          </div>
          <div className="mt-5 flex flex-1 flex-wrap content-center gap-2.5">
            {TECH_TAGS.map((t) => (
              <span
                key={t}
                className="rounded-xl border border-brand-400/20 bg-brand-500/5 px-4 py-2 text-sm font-medium text-brand-100 transition-colors hover:border-brand-400/40 hover:bg-brand-500/12"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-4 border-t border-brand-400/10 pt-3 text-xs leading-relaxed text-brand-200/50">
            覆盖串口通信 · 网络爬虫 · 数据清洗 · 可视化呈现四大技术栈，课堂实操与项目开发即查即用。
          </div>
        </Card>
      </div>

      {/* 底部：四大模块快捷导航 */}
      <div className="shrink-0">
        <h3 className="mb-3 text-xs font-medium tracking-widest text-brand-200/50">
          核心资源模块
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <div
              key={m.id}
              id={m.id}
              className={`scroll-mt-24 rounded-2xl transition-all duration-500 ${
                flash === m.id
                  ? "ring-2 ring-brand-400/80 shadow-[0_0_45px_rgba(34,211,238,0.4)]"
                  : ""
              }`}
            >
              <Link to={m.to}>
                <Card hover className="h-full p-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-xl"
                      style={{ background: `${m.color}22`, color: m.color }}
                    >
                      <m.icon className="h-5 w-5" />
                    </span>
                    <div className="text-[15px] font-semibold text-white">{m.title}</div>
                  </div>
                  <div className="mt-3 text-[13px] leading-relaxed text-brand-200/60">
                    {m.desc}
                  </div>
                  <div className="mt-3 text-sm font-medium" style={{ color: m.color }}>
                    进入 →
                  </div>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-glow text-2xl font-extrabold text-brand-300">{value}</div>
      <div className="mt-0.5 text-xs text-brand-200/50">{label}</div>
    </div>
  );
}
