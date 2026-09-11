import { useState } from "react";
import { Card, SectionTitle } from "../../components/ui";
import { IconFactory } from "../../components/icons";

const CASES = [
  { id: "community", name: "智慧社区案例", icon: "🏘️", color: "#22d3ee" },
  { id: "traffic", name: "智慧交通案例", icon: "🚦", color: "#34d399" },
  { id: "inspect", name: "智能巡检案例", icon: "🤖", color: "#a78bfa" },
  { id: "security", name: "智慧安防案例", icon: "🛡️", color: "#fbbf24" },
];

const COMMUNITY_RESOURCES = [
  {
    title: "企业脱敏工单库",
    desc: "真实企业脱敏后的业务工单数据，用于清洗、标注与建模实战。",
    items: ["报事报修工单", "设备巡检记录", "业主诉求分类"],
  },
  {
    title: "企业标准与规范库",
    desc: "行业与企业级数据标准、标注规范与交付质量要求。",
    items: ["数据字段规范", "标注质量准则", "交付验收标准"],
  },
  {
    title: "实战案例包",
    desc: "完整的教学与练习资源：任务书、数据集、参考代码与评分表。",
    items: ["项目任务书", "配套数据集", "参考代码与评分"],
  },
];

export default function Industry() {
  const [active, setActive] = useState("community");
  const current = CASES.find((c) => c.id === active)!;

  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconFactory className="h-6 w-6" />}
        title="产教融合资源"
        sub="真实行业应用场景与企业级资源，实现产学对接"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CASES.map((c) => {
          const on = c.id === active;
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`glass glass-hover rounded-2xl p-5 text-left transition-all ${
                on ? "ring-2" : ""
              }`}
              style={on ? { boxShadow: `0 0 0 2px ${c.color}66` } : undefined}
            >
              <div className="text-3xl">{c.icon}</div>
              <div className="mt-3 font-semibold text-white">{c.name}</div>
              <div
                className="mt-1 text-xs font-medium"
                style={{ color: on ? c.color : "rgba(165,243,252,0.5)" }}
              >
                {on ? "查看资源 →" : "点击展开"}
              </div>
            </button>
          );
        })}
      </div>

      {active === "community" ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2 text-sm text-brand-200/70">
            <span className="h-2 w-2 rounded-full" style={{ background: current.color }} />
            智慧社区案例 · 二级资源
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {COMMUNITY_RESOURCES.map((r) => (
              <Card key={r.title} hover className="flex flex-col p-6">
                <h3 className="text-lg font-semibold text-white">{r.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-200/70">
                  {r.desc}
                </p>
                <ul className="mt-4 space-y-2 border-t border-white/5 pt-4">
                  {r.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-brand-100/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                      {it}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-xs text-brand-200/40">资源待上传</div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="mt-6 grid h-48 place-items-center p-6 text-center">
          <div>
            <div className="text-4xl">{current.icon}</div>
            <div className="mt-3 text-lg font-semibold text-white">{current.name}</div>
            <div className="mt-1 text-sm text-brand-200/50">
              该案例的企业资源（脱敏数据 / 标准规范 / 实战案例包）待上传
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
