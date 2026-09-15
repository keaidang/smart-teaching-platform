import { useState } from "react";
import { Card, SectionTitle } from "../../components/ui";
import { IconExpand, IconTrophy, IconCpu, IconShield, IconLayers } from "../../components/icons";

const BLOCKS = [
  {
    title: "赛证融通资源",
    icon: IconTrophy,
    color: "#fbbf24",
    desc: "对接职业技能等级证书与学科竞赛，以赛促学、以证验能。",
    items: [
      {
        name: "1+X 大数据应用开发证书",
        desc: "对接《大数据应用开发（Python）》职业技能等级证书（中级）考核标准，配套模拟题库与评分细则，覆盖数据采集、清洗、分析全环节。",
      },
      {
        name: "职业院校技能竞赛真题",
        desc: "整理全国职业院校技能大赛「大数据应用与分析」赛项近三年真题，含赛题背景、数据集说明、解题思路与时间分配策略。",
      },
      {
        name: "获奖作品案例复盘",
        desc: "选取往届一、二等奖作品的完整答卷，从需求分析到成果汇报逐环节拆解，标注评委关注的加分点与常见扣分项。",
      },
    ],
    legal: false,
  },
  {
    title: "跨场景数据服务",
    icon: IconLayers,
    color: "#22d3ee",
    desc: "培养跨领域数据应用能力，打通多业务场景的数据链路。",
    items: [
      {
        name: "智慧交通数据案例",
        desc: "以路口过车流量数据为对象，练习多传感器时间对齐、异常值剔除与分车型流量统计，迁移课堂上的采集与清洗规范。",
      },
      {
        name: "智能巡检数据案例",
        desc: "基于无人机巡检影像与激光点云，练习缺陷目标标注、红外测温数据关联与识别基线搭建，体验双模态数据协同。",
      },
      {
        name: "场景迁移方法论",
        desc: "把社区项目沉淀的「采集 → 清洗 → 融合 → 可视」通用链路抽象为方法论清单，指导新场景下的方案设计与工具选型。",
      },
    ],
    legal: false,
  },
  {
    title: "AI 前沿技术工具包",
    icon: IconCpu,
    color: "#a78bfa",
    desc: "引入最新 AI 技术与实用工具，保持课程技术前沿性。",
    items: [
      {
        name: "大模型辅助数据服务",
        desc: "使用大模型生成标注规则初稿、辅助数据质检问答与数据卡撰写，附提示词模板与人工校核要点。",
      },
      {
        name: "多模态处理脚本集",
        desc: "图像增强、人脸检测、OCR 识别、语音转写等开箱即用的 Python 脚本，均配运行示例与参数说明。",
      },
      {
        name: "自动化数据流水线",
        desc: "用脚本串联采集入库、质量筛选与元数据生成，一键产出 datacard.md，体验企业级数据交付流程。",
      },
    ],
    legal: false,
  },
  {
    title: "数据服务法律法规",
    icon: IconShield,
    color: "#34d399",
    desc: "强化数据安全、隐私保护与合规意识，规范数据使用。",
    items: [
      {
        name: "《数据安全法》《个人信息保护法》要点",
        desc: "梳理个人信息处理的合法性基础、敏感个人信息定义与违规罚则，配套 10 道情景判断题。",
      },
      {
        name: "人脸识别专项规范",
        desc: "GB/T 35273 与《人脸识别技术应用安全管理办法》核心条款对照，逐条对应到本任务的采集环节。",
      },
      {
        name: "合规实务模板",
        desc: "知情同意卡、原始图像删除日志、脱敏自查表等 4 套可直接套用的模板文件，交付前逐项打勾。",
      },
    ],
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

      <div className="grid gap-7 md:grid-cols-2">
        {BLOCKS.map((b) => {
          const inner = (
            <>
              <div className="flex items-start gap-5">
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
                  style={{ background: `${b.color}1f`, color: b.color }}
                >
                  <b.icon className="h-7 w-7" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-semibold text-white">{b.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-brand-200/70">{b.desc}</p>
                </div>
              </div>
              <ul className="mt-6 divide-y divide-white/5">
                {b.items.map((it, i) => (
                  <li key={it.name} className="flex gap-4 py-4 first:pt-0.5 last:pb-0.5">
                    <span
                      className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[13px] font-bold"
                      style={{ background: `${b.color}1f`, color: b.color }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-base font-medium text-white">{it.name}</div>
                      <p className="mt-1.5 text-sm leading-relaxed text-brand-200/65">{it.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {b.legal && (
                <div className="mt-5 text-right text-sm font-medium text-emerald-300">
                  点击查看法规原文对照 →
                </div>
              )}
            </>
          );

          return b.legal ? (
            <Card key={b.title} hover className="flex cursor-pointer flex-col p-8 ring-emerald-400/30 transition-shadow hover:ring-1" onClick={() => setLegal(true)}>
              {inner}
            </Card>
          ) : (
            <Card key={b.title} hover className="flex flex-col p-8">{inner}</Card>
          );
        })}
      </div>
    </div>
  );
}
