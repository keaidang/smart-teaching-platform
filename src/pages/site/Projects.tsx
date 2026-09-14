import { Card, SectionTitle } from "../../components/ui";
import { IconBook } from "../../components/icons";

const PROJECTS = [
  {
    no: "01",
    title: "需求确定与方案设计",
    tag: "Requirement & Design",
    desc: "面向城市“小微区域”环境与设施，完成采集需求调研、指标确定与采集方案设计。",
    points: ["区域场景调研", "采集指标确定", "采集方案设计"],
    color: "#22d3ee",
  },
  {
    no: "02",
    title: "传感部署与采集开发",
    tag: "Sensing & Collection",
    desc: "多源传感器选型部署，Python 串口采集与网络爬虫开发，构建稳定采集链路。",
    points: ["传感器选型部署", "pyserial 采集程序", "网络爬虫与频控"],
    color: "#34d399",
  },
  {
    no: "03",
    title: "数据清洗与融合分析",
    tag: "Cleaning & Fusion",
    desc: "缺失/异常处理、格式归一，多源数据时间空间对齐与融合分析。",
    points: ["缺失值与异常处理", "多源融合对齐", "融合分析报告"],
    color: "#a78bfa",
  },
  {
    no: "04",
    title: "可视化构建与工程验收",
    tag: "Visualization & Delivery",
    desc: "图表选型与可视化应用构建，工程规范、验收复盘与拓展创新。",
    points: ["可视化应用构建", "工程规范验收", "技术向善拓展"],
    color: "#fbbf24",
  },
];

export default function Projects() {
  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconBook className="h-6 w-6" />}
        title="项目学习资源"
        sub="围绕「数据生命周期」构建的全流程实战项目"
      />

      <div className="relative space-y-6 before:absolute before:left-[27px] before:top-3 before:bottom-3 before:w-px before:bg-gradient-to-b before:from-brand-400/40 before:to-transparent">
        {PROJECTS.map((p) => (
          <div key={p.no} className="relative flex gap-5">
            <div
              className="z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold"
              style={{ background: "#0a2f3d", color: p.color, border: `2px solid ${p.color}66`, boxShadow: "0 0 0 4px #04141a" }}
            >
              {p.no}
            </div>
            <Card hover className="flex-1 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-semibold text-white">
                  项目{p.no.slice(1)}：{p.title}
                </h3>
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: `${p.color}1a`, color: p.color }}
                >
                  {p.tag}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-brand-200/70">{p.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.points.map((t) => (
                  <span key={t} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-brand-100/80">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-xs text-brand-200/40">
                配套资源（讲义 / 数据集 / 代码 / 实操任务）待上传
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
