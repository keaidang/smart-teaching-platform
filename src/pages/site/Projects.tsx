import { useNavigate } from "react-router-dom";
import { Card, SectionTitle } from "../../components/ui";
import { IconBook } from "../../components/icons";
import { PROJECTS } from "../../lib/course";

const PCOLORS = ["#22d3ee", "#34d399", "#a78bfa", "#fbbf24"];

// 各任务一句话简介（展示层文案，随任务框放大同步充实）
const TASK_DESC: Record<string, string> = {
  P1T1: "问卷调查与网络文本抓取，形成社区民意语料库",
  P1T2: "K230 多姿态采集 + 特征提取加密入库（企业工单 SQ-2026-001）",
  P2T1: "去重、脱敏与分类标注，产出可用的清洗语料",
  P2T2: "时间对齐、异常处理、图像去噪与点云滤波",
  P3T1: "结构化入库与索引设计，搭建社区数据底座",
  P3T2: "多源表关联与实体对齐，形成融合宽表",
  P4T1: "单指标看板设计与图表选型实现",
  P4T2: "多维大屏整合与治理成果汇报展示",
};

export default function Projects() {
  const nav = useNavigate();
  return (
    <div className="flex flex-1 flex-col animate-rise">
      <SectionTitle
        icon={<IconBook className="h-6 w-6" />}
        title="项目学习资源"
        sub="数智社区 · 数据生命周期四项目"
      />

      <div className="grid flex-1 gap-6 md:grid-cols-2">
        {PROJECTS.map((p, pi) => {
          const color = PCOLORS[pi % PCOLORS.length];
          return (
            <Card key={p.id} className="flex h-full flex-col overflow-hidden p-0">
              <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-7 py-5" style={{ background: `${color}12` }}>
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-xl text-base font-bold" style={{ background: `${color}22`, color }}>
                    {pi + 1}
                  </span>
                  <div>
                    <div className="text-lg font-semibold text-white">{p.title}</div>
                    <div className="mt-0.5 text-xs text-brand-200/50">{p.hours} 课时 · 2 个任务</div>
                  </div>
                </div>
              </div>

              <ul className="divide-y divide-white/5">
                {p.tasks.map((t, ti) => (
                  <li key={t.id} className="flex items-stretch">
                    <button
                      onClick={() => t.active && nav(`/projects/task/${t.id}`)}
                      className="group flex w-full items-center gap-4 px-7 py-5 text-left transition-colors hover:bg-white/5"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-sm font-semibold text-brand-200/70">
                        {ti + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-[15px] font-medium text-brand-100">
                          {t.title}
                          {t.active && (
                            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                              进行中
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block truncate text-[13px] text-brand-200/60">
                          {TASK_DESC[t.id]}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-medium text-brand-300 transition-transform group-hover:translate-x-0.5">
                        进入 →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
