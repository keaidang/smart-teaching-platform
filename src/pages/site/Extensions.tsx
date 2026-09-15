import { useState } from "react";
import { Card, SectionTitle } from "../../components/ui";
import { IconExpand, IconTrophy, IconCpu, IconShield, IconLayers } from "../../components/icons";

const BLOCKS = [
  {
    title: "赛证融通资源",
    icon: IconTrophy,
    color: "#fbbf24",
    desc: "对接职业技能等级证书与学科竞赛，以赛促学、以证验能。",
    items: ["1+X 证书标准与题库", "学科竞赛真题解析", "获奖作品案例集"],
    legal: false,
  },
  {
    title: "跨场景数据服务",
    icon: IconLayers,
    color: "#22d3ee",
    desc: "培养跨领域数据应用能力，打通多业务场景的数据链路。",
    items: ["跨行业数据案例", "场景迁移方法论", "综合实训项目"],
    legal: false,
  },
  {
    title: "AI 前沿技术工具包",
    icon: IconCpu,
    color: "#a78bfa",
    desc: "引入最新 AI 技术与实用工具，保持课程技术前沿性。",
    items: ["大模型与多模态", "AI 绘图 / 生成工具", "自动化数据处理"],
    legal: false,
  },
  {
    title: "数据服务法律法规",
    icon: IconShield,
    color: "#34d399",
    desc: "强化数据安全、隐私保护与合规意识，规范数据使用。",
    items: ["数据安全法 / 个保法", "隐私脱敏规范", "数据合规实务"],
    legal: true,
  },
];

// 数据服务合规依据 · 法规原文对照（提取自《任务工单》配套法规条文资源）
const LEGAL_QUOTES = [
  {
    color: "#4a9eff",
    text: "原则上不应存储原始个人生物识别信息（如样本、图像等）",
    note: "仅存储摘要信息；用后删除原始图像。",
    source: "GB/T 35273 §6.3 c)",
  },
  {
    color: "#34d399",
    text: "传输和存储个人敏感信息时，应采用加密等安全措施",
    note: "",
    source: "GB/T 35273 §6.3 a)",
  },
  {
    color: "#a78bfa",
    text: "应当取得个人在充分知情的前提下自愿、明确作出的单独同意",
    note: "",
    source: "《人脸识别技术应用安全管理办法》第六条",
  },
];

export default function Extensions() {
  const [legal, setLegal] = useState(false);

  // 法规条文详情页（内容提取自配套资源，样式与站内一致）
  if (legal) {
    return (
      <div className="animate-rise">
        <SectionTitle
          icon={<IconShield className="h-6 w-6" />}
          title="数据服务法律法规 · 合规依据"
          sub="人脸特征数据集采集合规要求 · 法规原文对照"
        />

        <button
          onClick={() => setLegal(false)}
          className="mb-6 rounded-lg border border-brand-400/25 px-4 py-2 text-sm text-brand-100 transition-colors hover:bg-brand-500/15"
        >
          ← 返回拓展课程资源
        </button>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {LEGAL_QUOTES.map((q) => (
            <Card key={q.source} hover className="flex flex-col p-6" >
              <div
                className="flex-grow rounded-r-xl bg-white/[0.04] px-5 py-4"
                style={{ borderLeft: `4px solid ${q.color}` }}
              >
                <p className="text-[15px] italic leading-relaxed text-brand-100/90">“{q.text}”</p>
                {q.note && <p className="mt-2 text-xs text-brand-200/50">{q.note}</p>}
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-dashed border-white/10 pt-4">
                <span className="text-sm font-bold tracking-widest text-white">出处</span>
                <span
                  className="rounded-full border px-3 py-1 font-mono text-xs"
                  style={{ borderColor: `${q.color}80`, background: `${q.color}2e`, color: q.color }}
                >
                  {q.source}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-brand-200/40">
          数智社区 · 信息采集技术综合实训 · 《人工智能数据服务》· 校企融合真实任务工单
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col animate-rise">
      <SectionTitle
        icon={<IconExpand className="h-6 w-6" />}
        title="拓展课程资源"
        sub="前沿技术 · 技能竞赛 · 跨领域融合 · 法律合规"
      />

      <div className="grid flex-1 gap-6 md:grid-cols-2">
        {BLOCKS.map((b) => {
          const inner = (
            <>
              <div className="flex items-start gap-4">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${b.color}1f`, color: b.color }}
                >
                  <b.icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold text-white">{b.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-brand-200/70">{b.desc}</p>
                </div>
              </div>
              <div className="grid content-center gap-2.5 py-4 sm:grid-cols-3">
                {b.items.map((it) => (
                  <div
                    key={it}
                    className="flex min-h-[64px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm leading-snug text-brand-100/90"
                  >
                    {it}
                  </div>
                ))}
              </div>
              {b.legal && (
                <div className="mt-3 text-right text-[13px] font-medium text-emerald-300">
                  点击查看法规原文对照 →
                </div>
              )}
            </>
          );

          return b.legal ? (
            <Card key={b.title} hover className="flex cursor-pointer flex-col p-7 ring-emerald-400/30 transition-shadow hover:ring-1" onClick={() => setLegal(true)}>
              {inner}
            </Card>
          ) : (
            <Card key={b.title} hover className="flex flex-col p-7">{inner}</Card>
          );
        })}
      </div>
    </div>
  );
}
