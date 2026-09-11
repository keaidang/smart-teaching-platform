import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { ClassOverview, PreviewScore } from "../../lib/types";
import {
  IconBook,
  IconChart,
  IconIdea,
  IconTrophy,
  IconUpload,
  IconUsers,
} from "../../components/icons";
import { Avatar, Bar, Card, LiveBadge, SectionTitle } from "../../components/ui";

const MODULE_CARDS = [
  {
    title: "智享观点",
    sub: "数字图书馆平台",
    icon: IconBook,
    to: "/class",
  },
  {
    title: "产教融合",
    sub: "素材资源库",
    icon: IconIdea,
    to: "/class",
  },
  {
    title: "智慧创见",
    sub: "课程资源库",
    icon: IconChart,
    to: "/class",
  },
];

export default function DisplayHome() {
  const [ov, setOv] = useState<ClassOverview | null>(null);
  const [scores, setScores] = useState<PreviewScore[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [o, s] = await Promise.all([
        api.getOverview(),
        api.getPreviewScores(),
      ]);
      if (!alive) return;
      setOv(o);
      setScores(s);
    };
    load();
    const t = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!ov)
    return (
      <div className="grid h-full place-items-center text-brand-200/60">
        正在连接课堂数据…
      </div>
    );

  const stats = [
    { label: "在线学生", value: `${ov.onlineCount}/${ov.studentCount}`, icon: IconUsers, color: "#22d3ee" },
    { label: "预习完成", value: `${ov.previewDone} 人`, icon: IconTrophy, color: "#34d399" },
    { label: "作业已交", value: `${ov.homeworkSubmitted} 份`, icon: IconUpload, color: "#a78bfa" },
    { label: "习题均分", value: `${ov.exerciseAvg}`, icon: IconChart, color: "#fbbf24" },
  ];

  const top = scores.slice(0, 6);

  return (
    <div className="animate-rise space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-brand-300/70">{ov.className}</div>
          <h1 className="text-glow mt-1 text-3xl font-bold text-white">
            {ov.sessionTitle}
          </h1>
        </div>
        <LiveBadge label="课堂直播中" />
      </div>

      {/* 顶部统计卡 */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} hover className="p-5">
            <div className="flex items-center justify-between">
              <span
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{ background: `${s.color}22`, color: s.color }}
              >
                <s.icon className="h-6 w-6" />
              </span>
              <span className="text-3xl font-bold text-white">{s.value}</span>
            </div>
            <div className="mt-4 text-sm text-brand-200/70">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 资源库模块（还原参考图） */}
        <div className="lg:col-span-2">
          <SectionTitle
            icon={<IconBook className="h-5 w-5" />}
            title="学习平台 · 数字评价"
            sub="智绘强国资源库"
          />
          <div className="grid gap-5 sm:grid-cols-3">
            {MODULE_CARDS.map((c) => (
              <Link key={c.title} to={c.to}>
                <Card hover className="h-full p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <div className="mt-5 text-lg font-semibold text-white">
                    {c.title}
                  </div>
                  <div className="mt-1 text-sm text-brand-200/70">{c.sub}</div>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="mt-5 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">数智技术资源库</h3>
              <span className="text-xs text-brand-200/60">AI 创作工具</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {["StableDiffusion", "ControlNet", "ComfyUI", "Midjourney", "即梦", "可灵"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-lg border border-brand-400/20 bg-brand-500/5 px-4 py-2 text-sm text-brand-100"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </Card>
        </div>

        {/* 预习实时榜 */}
        <div>
          <SectionTitle
            icon={<IconTrophy className="h-5 w-5" />}
            title="预习实时榜"
          />
          <Card className="divide-y divide-white/5">
            {top.map((s, i) => (
              <div key={s.studentId} className="flex items-center gap-3 p-4">
                <span
                  className={`w-6 text-center text-lg font-bold ${
                    i < 3 ? "text-amber-300" : "text-brand-200/50"
                  }`}
                >
                  {i + 1}
                </span>
                <Avatar name={s.name} color={["#22d3ee", "#34d399", "#a78bfa"][i % 3]} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">
                    {s.name}
                  </div>
                  <Bar value={s.score} height={6} />
                </div>
                <span className="text-lg font-bold text-brand-200">
                  {s.score}
                </span>
              </div>
            ))}
          </Card>
          <Link
            to="/class/preview"
            className="mt-3 block rounded-xl border border-brand-400/25 py-3 text-center text-sm text-brand-100 transition-colors hover:bg-brand-500/10"
          >
            查看完整分数榜 →
          </Link>
        </div>
      </div>
    </div>
  );
}
