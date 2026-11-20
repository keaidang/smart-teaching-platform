import { useState } from "react";
import { Card, SectionTitle, Stat, Tag, TONE_HEX, type Tone } from "../../components/ui";
import { IconExpand, IconTrophy, IconCpu, IconShield, IconLayers } from "../../components/icons";

const BLOCKS: {
  title: string;
  icon: typeof IconTrophy;
  tone: Tone;
  desc: string;
  items: { name: string; desc: string }[];
  legal: boolean;
}[] = [
  {
    title: "赛证融通资源",
    icon: IconTrophy,
    tone: "amber",
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
    tone: "cyan",
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
    tone: "violet",
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
    tone: "emerald",
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
const LEGAL_QUOTES: { tone: Tone; text: string; note: string; source: string }[] = [
  {
    tone: "blue",
    text: "原则上不应存储原始个人生物识别信息（如样本、图像等）",
    note: "仅存储摘要信息；用后删除原始图像。",
    source: "GB/T 35273 §6.3 c)",
  },
  {
    tone: "emerald",
    text: "传输和存储个人敏感信息时，应采用加密等安全措施",
    note: "",
    source: "GB/T 35273 §6.3 a)",
  },
  {
    tone: "violet",
    text: "应当取得个人在充分知情的前提下自愿、明确作出的单独同意",
    note: "",
    source: "《人脸识别技术应用安全管理办法》第六条",
  },
];

// 赛证融通进阶路径（教学说明性文案，对应上方赛证资源）
const CERT_PATH: { title: string; desc: string; tone: Tone }[] = [
  { title: "课程筑基", desc: "完成 P1–P4 四个项目实战，打牢采集、清洗、融合、可视全链路基本功", tone: "cyan" },
  { title: "证书备考", desc: "对照 1+X 大数据应用开发（中级）考核标准，用模拟题库与评分细则查漏补缺", tone: "amber" },
  { title: "竞赛实战", desc: "以「大数据应用与分析」赛项真题限时演练，训练解题思路与时间分配", tone: "orange" },
  { title: "复盘进阶", desc: "拆解获奖作品答卷，对照加分点与扣分项复盘，向拓展创新任务进阶", tone: "rose" },
];

// 前沿技术演进时间线（对应 AI 前沿技术工具包）
const TECH_TIMELINE: { title: string; desc: string; tone: Tone }[] = [
  { title: "传统采集", desc: "Requests / 爬虫 / 传感串口读取，掌握数据获取的底层原理", tone: "cyan" },
  { title: "多模态处理", desc: "图像增强、人脸检测、OCR、语音转写脚本开箱即用", tone: "blue" },
  { title: "大模型辅助", desc: "标注规则初稿、质检问答、数据卡撰写 + 人工校核", tone: "violet" },
  { title: "自动化流水线", desc: "采集入库 → 质量筛选 → 元数据生成，一键产出 datacard.md", tone: "emerald" },
];

function Timeline({ steps }: { steps: { title: string; desc: string; tone: Tone }[] }) {
  return (
    <div className="relative space-y-4 pl-6">
      <span className="absolute bottom-3 left-[9px] top-3 w-px bg-gradient-to-b from-cyan-400/50 via-violet-400/50 to-emerald-400/50" />
      {steps.map((s, i) => (
        <div key={s.title} className={`tone-${s.tone} relative rounded-xl border bg-slate-900/[0.03] px-5 py-4`} style={{ borderColor: "var(--tone-line)" }}>
          <span
            className="absolute -left-6 top-5 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-ink-950"
            style={{ background: "var(--tone)", boxShadow: "0 0 10px var(--tone-glow)" }}
          >
            {i + 1}
          </span>
          <div className="text-base font-bold" style={{ color: "var(--tone)" }}>{s.title}</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-500">{s.desc}</div>
        </div>
      ))}
    </div>
  );
}

export default function Extensions() {
  const [legal, setLegal] = useState(false);
  const totalTopics = BLOCKS.reduce((a, b) => a + b.items.length, 0);

  // 法规条文详情页（内容提取自配套资源，样式与站内一致）
  if (legal) {
    return (
      <div className="flex flex-col gap-6">
        <div className="tone-emerald tone-card glass animate-rise relative overflow-hidden rounded-2xl px-7 py-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="icon-chip h-12 w-12 rounded-xl"><IconShield className="h-6 w-6" /></span>
            <h1 className="grad-text text-3xl font-extrabold tracking-wide lg:text-4xl">数据服务法律法规 · 合规依据</h1>
          </div>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            人脸特征数据集采集合规要求 · 法规原文对照 —— 三条核心条款直接对应工单 SQ-2026-001 的采集、存储与授权环节。
          </p>
        </div>

        <button
          onClick={() => setLegal(false)}
          className="animate-rise rise-1 w-fit rounded-lg border border-emerald-400/30 px-5 py-2.5 text-lg text-emerald-600 transition-colors hover:bg-emerald-400/10"
        >
          ← 返回拓展课程资源
        </button>

        <div className="animate-rise rise-2 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {LEGAL_QUOTES.map((q) => (
            <Card key={q.source} tone={q.tone} hover className="flex flex-col p-8">
              <div
                className="flex-grow rounded-r-xl bg-slate-900/[0.04] px-6 py-6"
                style={{ borderLeft: `5px solid ${TONE_HEX[q.tone]}` }}
              >
                <p className="text-2xl font-medium italic leading-relaxed text-slate-900">“{q.text}”</p>
                {q.note && <p className="mt-3 text-lg leading-relaxed text-slate-500">{q.note}</p>}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-dashed border-slate-900/10 pt-5">
                <span className="text-lg font-bold tracking-widest text-slate-900">出处</span>
                <Tag tone={q.tone} className="rounded-full px-5 py-2 font-mono text-base">{q.source}</Tag>
              </div>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-slate-500">
          数智社区 · 信息采集技术综合实训 · 《人工智能数据服务》· 校企融合真实任务工单
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* 顶部模块色横幅 */}
      <div className="hero-mesh animate-rise relative shrink-0 overflow-hidden rounded-2xl border border-slate-900/10 px-7 py-9">
        <div className="tone-violet relative flex flex-col items-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <h1 className="grad-text text-4xl font-extrabold tracking-wide lg:text-5xl">拓展课程资源</h1>
            <span className="chip-tone tone-rose rounded-full px-4 py-1 text-sm font-medium tracking-widest">
              前沿 · 赛证 · 合规
            </span>
          </div>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-slate-600">
            在主线项目之外延伸学习边界：以赛证融通验证实战能力，以跨场景案例迁移方法论，
            以 AI 前沿工具保持技术敏锐度，以法律法规划定数据服务的合规底线。
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Stat value={BLOCKS.length} label="拓展模块" tone="violet" />
            <Stat value={totalTopics} label="专题资源" tone="cyan" />
            <Stat value={LEGAL_QUOTES.length} label="法规原文对照" tone="emerald" />
            <Stat value="1+X" label="证书对接" tone="amber" />
          </div>
        </div>
      </div>

      <div className="animate-rise rise-1 grid gap-7 md:grid-cols-2">
        {BLOCKS.map((b) => {
          const inner = (
            <>
              <div className="flex items-start gap-5">
                <span className={`tone-${b.tone} icon-chip grid h-14 w-14 shrink-0 place-items-center rounded-2xl`}>
                  <b.icon className="h-7 w-7" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-semibold text-slate-900">{b.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-slate-500">{b.desc}</p>
                </div>
              </div>
              <ul className="mt-6 divide-y divide-slate-900/5">
                {b.items.map((it, i) => (
                  <li key={it.name} className="flex gap-4 py-4 first:pt-0.5 last:pb-0.5">
                    <span className={`tone-${b.tone} chip-tone mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[13px] font-bold`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-base font-medium text-slate-900">{it.name}</div>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{it.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {b.legal && (
                <div className="mt-5 text-right text-base font-semibold text-emerald-600">
                  点击查看法规原文对照 →
                </div>
              )}
            </>
          );

          return b.legal ? (
            <Card key={b.title} tone={b.tone} hover className="flex cursor-pointer flex-col p-8" onClick={() => setLegal(true)}>
              {inner}
            </Card>
          ) : (
            <Card key={b.title} tone={b.tone} hover className="flex flex-col p-8">{inner}</Card>
          );
        })}
      </div>

      {/* 进阶路线：赛证路径 + 前沿技术时间线 */}
      <Card tone="violet" className="animate-rise rise-2 p-8">
        <SectionTitle
          icon={<IconExpand className="h-6 w-6" />}
          title="进阶路线"
          sub="左手赛证融通、右手技术演进，两条路径同步进阶"
          tone="violet"
        />
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="tone-amber icon-chip h-10 w-10 rounded-xl"><IconTrophy className="h-5 w-5" /></span>
              <span className="text-xl font-bold text-slate-900">赛证融通路径</span>
              <Tag tone="amber" className="ml-auto">以赛促学 · 以证验能</Tag>
            </div>
            <Timeline steps={CERT_PATH} />
          </div>
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="tone-violet icon-chip h-10 w-10 rounded-xl"><IconCpu className="h-5 w-5" /></span>
              <span className="text-xl font-bold text-slate-900">前沿技术演进</span>
              <Tag tone="violet" className="ml-auto">从脚本到流水线</Tag>
            </div>
            <Timeline steps={TECH_TIMELINE} />
          </div>
        </div>
      </Card>
    </div>
  );
}