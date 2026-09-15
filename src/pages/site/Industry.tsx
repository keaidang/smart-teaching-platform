import { useState } from "react";
import { Card, SectionTitle } from "../../components/ui";
import { IconFactory } from "../../components/icons";

interface CaseDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  scene: string;
  collect: string;
  resources: { title: string; desc: string; items: string[] }[];
}

const CASES: CaseDef[] = [
  {
    id: "community",
    name: "智慧社区案例",
    icon: "🏘️",
    color: "#22d3ee",
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
    color: "#34d399",
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
    color: "#a78bfa",
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
    color: "#fbbf24",
    scene: "园区/重点部位视频安防，视频结构化与周界告警，强调隐私合规与数据脱敏。",
    collect: "视觉：结构化视频（人/车/物），周界雷达；告警事件与轨迹。",
    resources: [
      { title: "视频结构化脱敏库", desc: "人车物结构化脱敏数据，用于检索与统计。", items: ["人体属性", "车辆特征", "轨迹片段"] },
      { title: "隐私与合规规范", desc: "人脸/视频数据脱敏与合规使用规范。", items: ["脱敏标准", "最小可用", "留痕审计"] },
      { title: "安防实战案例包", desc: "从采集到预警的安防数据全链路案例。", items: ["场景数据", "告警规则", "复盘报告"] },
    ],
  },
];

export default function Industry() {
  const [active, setActive] = useState("community");
  const cur = CASES.find((c) => c.id === active)!;

  return (
    <div className="flex flex-1 flex-col animate-rise">
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
              className={`glass glass-hover rounded-2xl p-5 text-left transition-all ${on ? "" : "opacity-80"}`}
              style={on ? { boxShadow: `0 0 0 2px ${c.color}88, 0 18px 50px -12px ${c.color}55` } : undefined}
            >
              <div className="text-3xl">{c.icon}</div>
              <div className="mt-3 font-semibold text-white">{c.name}</div>
              <div className="mt-1 text-xs font-medium" style={{ color: on ? c.color : "rgba(165,243,252,0.5)" }}>
                {on ? "当前查看" : "点击查看"}
              </div>
            </button>
          );
        })}
      </div>

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cur.icon}</span>
          <h3 className="text-lg font-semibold text-white">{cur.name}</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-brand-200/80">{cur.scene}</p>
        <div className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-brand-100/80">
          <b className="text-brand-300">采集要点：</b>{cur.collect}
        </div>
      </Card>

      <div className="mt-5 grid flex-1 gap-5 md:grid-cols-3">
        {cur.resources.map((r) => (
          <Card key={r.title} hover className="flex h-full flex-col p-6">
            <h4 className="text-base font-semibold text-white">{r.title}</h4>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-200/70">{r.desc}</p>
            <ul className="mt-4 space-y-2 border-t border-white/5 pt-4">
              {r.items.map((it) => (
                <li key={it} className="flex items-center gap-2 text-sm text-brand-100/80">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: cur.color }} />
                  {it}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
