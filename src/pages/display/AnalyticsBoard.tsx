import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { RADAR_DIMS } from "../../lib/learning";
import type { ClassAnalytics } from "../../lib/types";
import { EChart, dark } from "../../components/EChart";
import { Avatar, Bar, Card, LiveBadge, SectionTitle, Stat, Tag } from "../../components/ui";
import { IconChart, IconIdea } from "../../components/icons";

const mean = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length));

function five(vals: number[]) {
  const s = [...vals].sort((a, b) => a - b);
  const q = (p: number) => {
    const i = (s.length - 1) * p;
    const lo = Math.floor(i), hi = Math.ceil(i);
    return s[lo] + (s[hi] - s[lo]) * (i - lo);
  };
  return [s[0], q(0.25), q(0.5), q(0.75), s[s.length - 1]].map(Math.round);
}

/* 五维能力雷达（纯 SVG，轻量，28 人同屏无压力） */
function Radar({ pre, post }: { pre: number[]; post: number[] }) {
  const C = 70, R = 44;
  const pt = (i: number, v: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [C + Math.cos(a) * R * (v / 100), C + Math.sin(a) * R * (v / 100)];
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");
  const ring = (f: number) => poly([f * 100, f * 100, f * 100, f * 100, f * 100]);
  const SHORT = ["辨识", "决策", "创新", "动手", "合作"];
  return (
    <svg viewBox="0 0 140 140" className="mx-auto w-full max-w-[190px]">
      {[0.33, 0.66, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="rgba(15,23,42,0.10)" strokeWidth="0.8" />
      ))}
      {Array.from({ length: 5 }, (_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="rgba(15,23,42,0.08)" strokeWidth="0.8" />;
      })}
      <polygon points={poly(pre)} fill="rgba(58,110,165,0.14)" stroke="#3a6ea5" strokeWidth="1.4" />
      <polygon points={poly(post)} fill="rgba(176,110,67,0.14)" stroke="#b06e43" strokeWidth="1.4" />
      {SHORT.map((s, i) => {
        const [x, y] = pt(i, 122);
        return (
          <text key={s} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fill="#64748b">
            {s}
          </text>
        );
      })}
    </svg>
  );
}

export default function AnalyticsBoard() {
  const [data, setData] = useState<ClassAnalytics | null>(null);
  useEffect(() => {
    api.getClassAnalytics().then(setData).catch(() => {});
  }, []);

  const barOpt = useMemo(() => data && dark({
    grid: { left: 40, right: 16, top: 36, bottom: 28 },
    xAxis: { type: "category", data: data.taskAvg.map((_, i) => `任务${i + 1}`) },
    yAxis: { type: "value", min: 50, max: 100 },
    series: [{
      type: "bar",
      data: data.taskAvg.map((t) => t.avg),
      barWidth: 26,
      itemStyle: { color: "#3a6ea5", borderRadius: [6, 6, 0, 0] },
      label: { show: true, position: "top", color: "#334155", fontWeight: 600 },
      markLine: {
        symbol: "none",
        data: [{ yAxis: 75, name: "达标线" }],
        lineStyle: { color: "#a8566e", type: "dashed" },
        label: { formatter: "达标线 75", color: "#a8566e", position: "insideEndTop" },
      },
    }],
  }), [data]);

  const boxOpt = useMemo(() => data && dark({
    grid: { left: 40, right: 16, top: 24, bottom: 64 },
    xAxis: { type: "category", data: data.skills.map((s) => s.name), axisLabel: { rotate: 32, fontSize: 10 } },
    yAxis: { type: "value", min: 50, max: 100 },
    series: [{
      type: "boxplot",
      data: data.skills.map((s) => five(s.values)),
      itemStyle: { color: "rgba(47,135,107,0.22)", borderColor: "#2f876b", borderWidth: 1.4 },
    }],
  }), [data]);

  const lineOpt = useMemo(() => data && dark({
    grid: { left: 40, right: 16, top: 36, bottom: 70 },
    legend: { data: ["课前平均", "课后平均"], top: 4 },
    xAxis: { type: "category", data: data.students.map((s) => s.name), axisLabel: { rotate: 60, fontSize: 9 } },
    yAxis: { type: "value", min: 50, max: 100 },
    series: [
      { name: "课前平均", type: "line", smooth: true, symbolSize: 4, data: data.students.map((s) => s.pre), lineStyle: { color: "#3a6ea5", width: 2 }, itemStyle: { color: "#3a6ea5" } },
      { name: "课后平均", type: "line", smooth: true, symbolSize: 4, data: data.students.map((s) => s.post), lineStyle: { color: "#a87b3a", width: 2 }, itemStyle: { color: "#a87b3a" } },
    ],
  }), [data]);

  if (!data) return <div className="grid min-h-[50vh] place-items-center text-sm text-slate-400">学情数据加载中…</div>;

  const preAvg = mean(data.students.map((s) => s.pre));
  const postAvg = mean(data.students.map((s) => s.post));
  const midAvg = mean(data.taskAvg.map((t) => t.mid));

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        icon={<IconChart className="h-6 w-6" />}
        title="学情分析"
        sub="任务达标 · 关键技能 · 个人增值 · 全过程数据"
        tone="rose"
        right={<LiveBadge label="演示数据 v1" />}
      />

      <Card className="flex flex-wrap items-center justify-around gap-4 px-6 py-5">
        <Stat value={data.students.length} label="班级人数" tone="blue" />
        <Stat value={preAvg} label="课前平均" tone="cyan" />
        <Stat value={midAvg} label="课中平均" tone="violet" />
        <Stat value={postAvg} label="课后平均" tone="emerald" />
        <Stat value={`+${postAvg - preAvg}`} label="平均增值" tone="amber" />
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-2 text-base font-semibold text-slate-800">任务知识平均达标情况</h3>
          {barOpt && <EChart option={barOpt} height={300} />}
        </Card>
        <Card className="p-5">
          <h3 className="mb-2 text-base font-semibold text-slate-800">任务关键技能掌握情况</h3>
          {boxOpt && <EChart option={boxOpt} height={300} />}
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-2 text-base font-semibold text-slate-800">个人成绩增值情况（课前 → 课后）</h3>
        {lineOpt && <EChart option={lineOpt} height={320} />}
      </Card>

      <SectionTitle
        icon={<IconIdea className="h-6 w-6" />}
        title="个人数字画像"
        sub="五维能力雷达（课前蓝 / 课后橙）· 关键知识项得分 · 头像由姓氏生成，不使用照片"
        tone="violet"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.profiles.map((p, i) => (
          <Card key={p.studentId} className={`rise-${(i % 4) + 1} p-4`}>
            <div className="mb-2 flex items-center gap-2.5">
              <Avatar name={p.name} color={["#3a6ea5", "#2f876b", "#6c5b9e", "#a87b3a", "#a8566e", "#1f7a8c", "#b06e43"][i % 7]} size={34} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">{p.name}</div>
                <div className="text-[11px] text-slate-400">{p.studentId}</div>
              </div>
              <Tag tone={p.growth >= 10 ? "emerald" : "amber"} className="!px-2 !py-0.5 text-xs">+{p.growth}</Tag>
            </div>
            <Radar pre={p.radarPre} post={p.radarPost} />
            <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full bg-[#3a6ea5]" />课前</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full bg-[#b06e43]" />课后</span>
            </div>
            <div className="mt-3 space-y-1.5">
              {p.knowledge.map((k) => (
                <div key={k.name} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 truncate text-[11px] text-slate-500" title={k.name}>{k.name}</span>
                  <div className="flex-1"><Bar value={k.score} color="#6c5b9e" height={6} /></div>
                  <span className="w-7 text-right text-[11px] font-semibold tabular-nums text-slate-700">{k.score}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-900/6 pt-2 text-[11px] text-slate-500">
              <span>课前 {p.preAvg}</span>
              <span>课后 {p.postAvg}</span>
              <span>掌握率 {p.mastery}%</span>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-center text-xs text-slate-400">雷达维度：{RADAR_DIMS.join(" · ")}</p>
    </div>
  );
}