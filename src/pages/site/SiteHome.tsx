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
import homeImg1 from "../../assets/home-1.jpg";
import homeImg2 from "../../assets/home-2.jpg";

const MODULES = [
  { id: "mod-projects", to: "/projects", title: "项目学习资源", desc: "围绕数据生命周期构建的全流程实战项目", icon: IconBook, color: "#22d3ee" },
  { id: "mod-industry", to: "/industry", title: "产教融合资源", desc: "真实行业场景与企业级资源产学对接", icon: IconFactory, color: "#34d399" },
  { id: "mod-extensions", to: "/extensions", title: "拓展课程资源", desc: "前沿技术 · 赛证融通 · 跨领域 · 合规", icon: IconExpand, color: "#a78bfa" },
  { id: "mod-evaluation", to: "/evaluation", title: "教学评价资源", desc: "多维 · 智能 · 全过程学习质量评价", icon: IconGauge, color: "#fbbf24" },
];

function HomeBanner({ src, alt, position }: { src: string; alt: string; position?: string }) {
  return (
    <div className="group relative h-56 overflow-hidden rounded-2xl border border-brand-400/20 sm:h-60">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${position ?? ""}`}
      />
      {/* 上下渐变压暗，融入深色界面 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-ink-900/30" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
    </div>
  );
}

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
    <div className="animate-rise space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-brand-400/15 bg-gradient-to-b from-brand-500/10 to-transparent px-8 py-12 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(600px_circle_at_50%_-10%,rgba(34,211,238,0.25),transparent_70%)]" />
        <div className="relative">
          <span className="inline-block rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1 text-xs font-medium tracking-widest text-brand-200">
            数智社区 · 数据全生命周期
          </span>
          <h1 className="mt-5 bg-gradient-to-r from-white via-brand-100 to-brand-300 bg-clip-text text-4xl font-extrabold tracking-wide text-transparent md:text-5xl">
            数智社区 · 教学资源库
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

      {/* 图片1（智慧社区数据采集）/ 图片2（数据技术工具链） */}
      <div className="grid gap-6 md:grid-cols-2">
        <HomeBanner src={homeImg1} alt="智慧社区数据采集场景插画" position="[object-position:center_72%]" />
        <HomeBanner src={homeImg2} alt="数据技术工具链插画" />
      </div>

      {/* 四大模块快捷导航 */}
      <div>
        <h3 className="mb-4 text-sm font-medium tracking-widest text-brand-200/60">
          核心资源模块
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
