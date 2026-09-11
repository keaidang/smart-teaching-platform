import { Card, SectionTitle } from "../../components/ui";
import { IconExpand, IconTrophy, IconCpu, IconShield, IconLayers } from "../../components/icons";

const BLOCKS = [
  {
    title: "赛证融通资源",
    icon: IconTrophy,
    color: "#fbbf24",
    desc: "对接职业技能等级证书与学科竞赛，以赛促学、以证验能。",
    items: ["1+X 证书标准与题库", "学科竞赛真题解析", "获奖作品案例集"],
  },
  {
    title: "跨场景数据服务",
    icon: IconLayers,
    color: "#22d3ee",
    desc: "培养跨领域数据应用能力，打通多业务场景的数据链路。",
    items: ["跨行业数据案例", "场景迁移方法论", "综合实训项目"],
  },
  {
    title: "AI 前沿技术工具包",
    icon: IconCpu,
    color: "#a78bfa",
    desc: "引入最新 AI 技术与实用工具，保持课程技术前沿性。",
    items: ["大模型与多模态", "AI 绘图 / 生成工具", "自动化数据处理"],
  },
  {
    title: "数据服务法律法规",
    icon: IconShield,
    color: "#34d399",
    desc: "强化数据安全、隐私保护与合规意识，规范数据使用。",
    items: ["数据安全法 / 个保法", "隐私脱敏规范", "数据合规实务"],
  },
];

export default function Extensions() {
  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconExpand className="h-6 w-6" />}
        title="拓展课程资源"
        sub="前沿技术 · 技能竞赛 · 跨领域融合 · 法律合规"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {BLOCKS.map((b) => (
          <Card key={b.title} hover className="p-6">
            <div className="flex items-start gap-4">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                style={{ background: `${b.color}1f`, color: b.color }}
              >
                <b.icon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-white">{b.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-brand-200/70">{b.desc}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {b.items.map((it) => (
                <div
                  key={it}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs text-brand-100/80"
                >
                  {it}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
