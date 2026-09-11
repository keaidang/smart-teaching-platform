import { Card, SectionTitle } from "../../components/ui";
import { IconGauge, IconUsers, IconCpu, IconTrophy } from "../../components/icons";

const DIMS = [
  {
    title: "学生自主测评",
    icon: IconUsers,
    color: "#22d3ee",
    desc: "支持学生自我检测学习效果，形成个性化诊断与目标设定。",
    tags: ["知识点自测", "能力雷达图", "错题归因"],
  },
  {
    title: "AI 工具测评",
    icon: IconCpu,
    color: "#a78bfa",
    desc: "利用智能 AI 手段进行自动化评估，即时反馈、客观一致。",
    tags: ["自动判分", "语义评分", "智能反馈"],
  },
  {
    title: "双导师评价",
    icon: IconUsers,
    color: "#34d399",
    desc: "整合学校教师与企业导师的双向反馈，兼顾学业与岗位能力。",
    tags: ["校内导师", "企业导师", "双向打分"],
  },
  {
    title: "增值评价",
    icon: IconTrophy,
    color: "#fbbf24",
    desc: "关注学习过程中的能力成长与进步幅度，而非单一结果。",
    tags: ["前后测对比", "成长曲线", "过程档案"],
  },
];

export default function Evaluation() {
  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconGauge className="h-6 w-6" />}
        title="教学评价资源"
        sub="多维度 · 智能化 · 全过程的教学与学习质量评价"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {DIMS.map((d) => (
          <Card key={d.title} hover className="flex flex-col p-6">
            <div className="relative grid h-20 w-20 place-items-center">
              <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none" stroke={d.color} strokeWidth="6"
                  strokeLinecap="round" strokeDasharray="214" strokeDashoffset="70"
                />
              </svg>
              <span style={{ color: d.color }}>
                <d.icon className="h-8 w-8" />
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">{d.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-200/70">{d.desc}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {d.tags.map((t) => (
                <span key={t} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-brand-100/70">
                  {t}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <h3 className="font-semibold text-white">评价数据流转</h3>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          {["课前预习答题", "课中作业提交", "课后知识点问答", "多维评价汇总"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span className="rounded-lg border border-brand-400/25 bg-brand-500/10 px-4 py-2 text-brand-100">
                {s}
              </span>
              {i < 3 && <span className="text-brand-200/40">→</span>}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-brand-200/40">
          学生端作答实时入库（KV），教师大屏与本页评价数据自动聚合展示。
        </p>
      </Card>
    </div>
  );
}
