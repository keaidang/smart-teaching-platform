import { Card, SectionTitle } from "../../components/ui";
import { IconBook } from "../../components/icons";

const PROJECTS = [
  {
    no: "01",
    title: "数据采集",
    tag: "Collection",
    desc: "面向多源异构数据的采集实战：网络抓取、传感器接入与开放数据集获取。",
    points: ["爬虫与 API 采集", "数据源调研与选型", "采集合规与频控"],
    color: "#22d3ee",
  },
  {
    no: "02",
    title: "清洗标注",
    tag: "Cleaning & Labeling",
    desc: "数据预处理与标注全流程：缺失/异常处理、格式归一与人工/半自动标注。",
    points: ["缺失值与异常检测", "LabelImg / CVAT 标注", "标注质检与一致性"],
    color: "#34d399",
  },
  {
    no: "03",
    title: "存储融合",
    tag: "Storage & Fusion",
    desc: "数据存储与多源融合：关系型/对象存储、数据仓库与跨源融合对齐。",
    points: ["MySQL / 对象存储", "数据仓库建模", "多源融合与对齐"],
    color: "#a78bfa",
  },
  {
    no: "04",
    title: "数据可视",
    tag: "Visualization",
    desc: "数据可视化与洞察呈现：图表选型、仪表盘搭建与叙事化表达。",
    points: ["可视化编码原则", "BI 仪表盘搭建", "数据叙事与呈现"],
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

      <div className="relative space-y-6 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-brand-400/40 before:to-transparent lg:before:left-[31px]">
        {PROJECTS.map((p) => (
          <div key={p.no} className="relative flex gap-5">
            <div
              className="z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold"
              style={{ background: `${p.color}1f`, color: p.color, boxShadow: `0 0 0 4px rgba(4,20,26,0.6)` }}
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
