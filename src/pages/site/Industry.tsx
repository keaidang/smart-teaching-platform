import { useState } from "react";
import { Card, SectionTitle, Stat, Tag, TONE_HEX, type Tone } from "../../components/ui";
import { IconFactory, IconUsers, IconLayers, IconSkill } from "../../components/icons";
import { PROJECTS } from "../../lib/course";

interface CaseDef {
  id: string;
  name: string;
  icon: string;
  tone: Tone;
  scene: string;
  collect: string;
  resources: { title: string; desc: string; items: string[] }[];
}

const CASES: CaseDef[] = [
  {
    id: "community",
    name: "智慧社区案例",
    icon: "🏘️",
    tone: "cyan",
    scene: "面向社区综合治理，融合民意文本、环境与设施传感、门禁/安防视觉等多源数据，支撑诉求分析、环境监管与安全预警。",
    collect: "传感：温湿度/噪声/烟感；视觉：出入口图像、周界点云；文本：居民诉求工单。",
    resources: [
      { title: "企业脱敏工单库", desc: "真实物业/社区脱敏业务工单，含诉求分类与处理记录。", items: ["报事报修工单", "设备巡检记录", "业主诉求分类"] },
      { title: "企业标准与规范库", desc: "行业与企业级数据标准、标注规范与交付质量要求。", items: ["数据字段规范", "标注质量准则", "交付验收标准"] },
      { title: "实战案例包", desc: "完整教学与练习资源：任务书、数据集、参考代码与评分表。", items: ["项目任务书", "配套数据集", "参考代码与评分"] },
    ],
  },
  {
    id: "traffic",
    name: "智慧交通案例",
    icon: "🚦",
    tone: "emerald",
    scene: "城市路口与路段交通运行监测，融合卡口过车、地磁/雷达车流与信号数据，支撑流量分析与信号配时优化。",
    collect: "传感：地磁/微波车检器；视觉：卡口过车图像；检测器事件与信控日志。",
    resources: [
      { title: "交通流量脱敏数据集", desc: "路口过车与流量时序脱敏数据，用于清洗与统计建模。", items: ["过车记录", "分车型流量", "时段特征"] },
      { title: "信号配时规范库", desc: "信控方案与数据口径标准，支撑配时评估。", items: ["配时方案模板", "指标口径", "验收规范"] },
      { title: "交通仿真案例包", desc: "从采集到可视的完整交通数据实战包。", items: ["场景描述", "仿真数据集", "分析脚本"] },
    ],
  },
  {
    id: "inspect",
    name: "智能巡检案例",
    icon: "🤖",
    tone: "violet",
    scene: "电力/管廊/园区设备智能巡检，融合无人机与机器人可见光/红外影像与点云，实现缺陷自动识别。",
    collect: "视觉：可见光/红外图像、激光点云；传感：位姿、温湿度、局放。",
    resources: [
      { title: "巡检影像脱敏样本", desc: "设备缺陷可见光/红外脱敏影像，用于标注与识别。", items: ["可见光样本", "红外测温", "缺陷类型"] },
      { title: "缺陷标注规范", desc: "巡检缺陷标注细则与质量校验标准。", items: ["标注类别", "框选规则", "质检标准"] },
      { title: "巡检实战案例包", desc: "点云+影像融合的巡检数据清洗与识别案例。", items: ["航线数据", "点云样本", "识别基线"] },
    ],
  },
  {
    id: "security",
    name: "智慧安防案例",
    icon: "🛡️",
    tone: "amber",
    scene: "园区/重点部位视频安防，视频结构化与周界告警，强调隐私合规与数据脱敏。",
    collect: "视觉：结构化视频（人/车/物），周界雷达；告警事件与轨迹。",
    resources: [
      { title: "视频结构化脱敏库", desc: "人车物结构化脱敏数据，用于检索与统计。", items: ["人体属性", "车辆特征", "轨迹片段"] },
      { title: "隐私与合规规范", desc: "人脸/视频数据脱敏与合规使用规范。", items: ["脱敏标准", "最小可用", "留痕审计"] },
      { title: "安防实战案例包", desc: "从采集到预警的安防数据全链路案例。", items: ["场景数据", "告警规则", "复盘报告"] },
    ],
  },
];

// 岗位能力映射：课堂项目 × 行业案例 → 数据服务岗位核心能力（教学说明性文案）
const JOB_MAP: { role: string; tone: Tone; skills: string[]; projects: string; cases: string }[] = [
  {
    role: "数据采集工程师",
    tone: "cyan",
    skills: ["多源采集方案设计", "爬虫与传感程序开发", "合规采集与授权留痕"],
    projects: "P1 数据感知方案设计与采集",
    cases: "智慧社区 · 智慧安防",
  },
  {
    role: "数据治理工程师",
    tone: "emerald",
    skills: ["去重脱敏与分类标注", "质量校验与异常处理", "多模态数据规整"],
    projects: "P2 多源数据清洗治理",
    cases: "智慧交通 · 智能巡检",
  },
  {
    role: "数据融合工程师",
    tone: "violet",
    skills: ["结构化入库与索引设计", "多源关联与实体对齐", "数据底座构建维护"],
    projects: "P3 多源数据融合与存储",
    cases: "智慧社区知识底座",
  },
  {
    role: "可视化开发工程师",
    tone: "rose",
    skills: ["单维度看板设计", "综合大屏整合", "数据结论提炼与汇报"],
    projects: "P4 社区综合治理数据可视化",
    cases: "四大场景治理大屏",
  },
];

const COOP_STEPS: { title: string; desc: string; tone: Tone }[] = [
  { title: "企业真实工单", desc: "合作科技公司下发脱敏业务工单（如 SQ-2026-001），明确交付物与验收标准", tone: "amber" },
  { title: "课堂项目实训", desc: "7 个学习小组按工单协作实操，教师全程指导采集、清洗与融合规范", tone: "orange" },
  { title: "企业标准验收", desc: "对照企业验收红线自查：可用率、假名化、无原图残留，一票否决", tone: "cyan" },
  { title: "三维评价反馈", desc: "教师 · 企业 · AI 三视角小组评价，结果回流达成度看板持续改进", tone: "emerald" },
];

export default function Industry() {
  const [active, setActive] = useState("community");
  const cur = CASES.find((c) => c.id === active)!;
  const totalPacks = CASES.reduce((a, c) => a + c.resources.length, 0);
  const totalItems = CASES.reduce((a, c) => a + c.resources.reduce((x, r) => x + r.items.length, 0), 0);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* 顶部模块色横幅 */}
      <div className="hero-mesh animate-rise relative shrink-0 overflow-hidden rounded-2xl border border-slate-900/10 px-7 py-9">
        <div className="tone-amber relative flex flex-col items-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <h1 className="grad-text text-4xl font-extrabold tracking-wide lg:text-5xl">产教融合资源</h1>
            <span className="chip-tone tone-orange rounded-full px-4 py-1 text-sm font-medium tracking-widest">
              校企协同 · 真实场景
            </span>
          </div>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-slate-600">
            把企业真实业务场景搬进课堂：四大行业案例配套脱敏数据集、企业标准与实战案例包，
            让学生在真实工单驱动下完成产学对接的数据服务全流程训练。
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Stat value={CASES.length} label="行业案例" tone="amber" />
            <Stat value={totalPacks} label="企业资源包" tone="orange" />
            <Stat value={totalItems} label="资源条目" tone="cyan" />
            <Stat value={PROJECTS.length} label="支撑课堂项目" tone="violet" />
          </div>
        </div>
      </div>

      {/* 行业场景选择 */}
      <div className="animate-rise rise-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CASES.map((c) => {
          const on = c.id === active;
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`tone-${c.tone} glass glass-hover rounded-2xl p-5 text-left transition-all ${on ? "tone-card" : "opacity-80"}`}
              style={on ? { boxShadow: `0 0 0 2px ${TONE_HEX[c.tone]}88, 0 18px 50px -12px ${TONE_HEX[c.tone]}55` } : undefined}
            >
              <div className="flex items-center justify-between">
                <span className="icon-chip grid h-12 w-12 place-items-center rounded-xl text-2xl">{c.icon}</span>
                {on && <Tag tone={c.tone}>当前查看</Tag>}
              </div>
              <div className="mt-3 text-lg font-semibold text-slate-900">{c.name}</div>
              <div className="mt-1 text-sm font-medium" style={{ color: on ? "var(--tone)" : "#64748b" }}>
                {on ? `${c.resources.length} 类企业资源` : "点击查看"}
              </div>
            </button>
          );
        })}
      </div>

      {/* 当前案例详情 */}
      <Card tone={cur.tone} className="animate-rise rise-2 p-7">
        <div className="flex items-center gap-3">
          <span className={`tone-${cur.tone} icon-chip grid h-12 w-12 place-items-center rounded-xl text-2xl`}>{cur.icon}</span>
          <h3 className="text-2xl font-semibold text-slate-900">{cur.name}</h3>
        </div>
        <p className="mt-3 text-base leading-relaxed text-slate-600">{cur.scene}</p>
        <div className={`tone-${cur.tone} mt-4 rounded-xl border bg-slate-900/[0.04] px-5 py-3.5 text-base text-slate-600`} style={{ borderColor: "var(--tone-line)" }}>
          <b style={{ color: "var(--tone)" }}>采集要点：</b>{cur.collect}
        </div>
      </Card>

      <div className="animate-rise rise-2 grid gap-5 md:grid-cols-3">
        {cur.resources.map((r) => (
          <Card key={r.title} tone={cur.tone} hover className="flex flex-col p-7">
            <h4 className="text-lg font-semibold text-slate-900">{r.title}</h4>
            <p className="mt-2.5 text-base leading-relaxed text-slate-500">{r.desc}</p>
            <div className="pt-4">
              <div className="mb-3 text-xs font-medium tracking-widest text-slate-500">包含资源</div>
              <ul className="space-y-3.5 border-t border-slate-900/5 pt-4">
                {r.items.map((it) => (
                  <li key={it} className="flex items-center gap-2.5 text-base text-slate-600">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: TONE_HEX[cur.tone], boxShadow: `0 0 8px ${TONE_HEX[cur.tone]}66` }} />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {/* 岗位能力映射 */}
      <Card tone="orange" className="animate-rise rise-3 p-8">
        <SectionTitle
          icon={<IconUsers className="h-6 w-6" />}
          title="岗位能力映射"
          sub="课堂项目 × 行业案例 → 数据服务岗位核心能力"
          tone="orange"
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {JOB_MAP.map((j) => (
            <div key={j.role} className={`tone-${j.tone} flex flex-col rounded-xl border bg-slate-900/[0.03] p-5 transition-colors hover:bg-slate-900/[0.06]`} style={{ borderColor: "var(--tone-line)" }}>
              <div className="flex items-center gap-3">
                <span className="icon-chip h-11 w-11 rounded-xl"><IconSkill className="h-5 w-5" /></span>
                <span className="text-lg font-bold" style={{ color: "var(--tone)" }}>{j.role}</span>
              </div>
              <ul className="mt-3 flex-1 space-y-2">
                {j.skills.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--tone)" }} />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 border-t border-slate-900/5 pt-4">
                <div className="text-xs text-slate-500">对应课堂项目</div>
                <Tag tone={j.tone} className="text-xs">{j.projects}</Tag>
                <div className="text-xs text-slate-500">衔接行业案例</div>
                <div className="text-sm text-slate-600">{j.cases}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 校企协同育人链路 */}
      <Card tone="amber" className="animate-rise rise-4 p-8">
        <SectionTitle
          icon={<IconLayers className="h-6 w-6" />}
          title="校企协同育人链路"
          sub="从企业工单到评价反馈的闭环，真实任务驱动教学"
          tone="amber"
          right={<IconFactory className="h-6 w-6 text-slate-600" />}
        />
        <div className="grid gap-5 md:grid-cols-4">
          {COOP_STEPS.map((s, i) => (
            <div key={s.title} className={`tone-${s.tone} relative rounded-xl border bg-slate-900/[0.03] p-5`} style={{ borderColor: "var(--tone-line)" }}>
              <span className="grad-text text-3xl font-extrabold">0{i + 1}</span>
              <div className="mt-2 text-lg font-bold text-slate-900">{s.title}</div>
              <div className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.desc}</div>
              {i < COOP_STEPS.length - 1 && (
                <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-slate-600 md:block">→</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}