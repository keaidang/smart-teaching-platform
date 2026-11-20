import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useStudent } from "../../lib/auth";
import type { Exercise } from "../../lib/types";
import { IconBook, IconCheck, IconShield } from "../../components/icons";
import { Bar, Card, SectionTitle, Stat, Tag, TONE_HEX } from "../../components/ui";

// 练习说明：基于真实作答流程（答案仅存服务端、统计同步大屏、支持再答）
const PRACTICE_NOTES = [
  "全部为单选题，逐题作答，全部完成后即可提交。",
  "答案只保存在服务端，前端不显示正确答案；提交后由教师大屏公布并讲评。",
  "作答数据入库后统计正确率与选项分布，实时同步讲台大屏。",
  "支持「再答一次」，反复练习直到吃透每个知识点。",
];

// 合规要点：摘自工单 SQ-2026-001 课堂任务清单的验收红线
const COMPLIANCE_POINTS = [
  { title: "知情同意前置", desc: "采集前向被采集人说明用途，签署并保留知情同意卡（一票否决证据）。" },
  { title: "原图零残留", desc: "特征提取后立即删除原始人脸图像，并在删除日志中记录。" },
  { title: "身份假名化", desc: "person_id 使用 P001 等编号，不出现真实姓名、手机号。" },
  { title: "可用率 ≥80%", desc: "不达标须补拍补采，不得修改统计口径或放行不合格样本。" },
  { title: "规范打包交付", desc: "SQ-2026-001_第X组.zip，含特征集 / metadata.csv / datacard.md / 合规记录，不含原图。" },
];

export default function StudentExercise() {
  const { student } = useStudent();
  const [list, setList] = useState<Exercise[]>([]);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getExercises().then(setList);
  }, []);

  const answered = Object.keys(picks).length;
  const allDone = list.length > 0 && answered === list.length;

  const submit = async () => {
    if (!student || !allDone) return;
    setSubmitting(true);
    await api.submitExercise(
      list.map((e) => ({
        studentId: student.id,
        exerciseId: e.id,
        selected: picks[e.id],
      }))
    );
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <Card tone="emerald" className="animate-rise flex flex-col items-center p-10 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-600">
          <IconCheck className="h-8 w-8" strokeWidth={2.5} />
        </span>
        <h2 className="mt-5 text-2xl font-semibold text-slate-900">课后习题已提交</h2>
        <p className="mt-1 text-base text-slate-500">
          作答数据已入库，统计结果同步至讲台大屏
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Tag tone="emerald">已入库</Tag>
          <Tag tone="cyan">统计同步大屏</Tag>
        </div>
        <button
          onClick={() => {
            setDone(false);
            setPicks({});
          }}
          className="mt-6 rounded-xl border border-emerald-400/30 px-6 py-2.5 text-sm text-emerald-600 transition-colors hover:bg-emerald-500/15"
        >
          再答一次
        </button>
      </Card>
    );
  }

  return (
    <div className="animate-rise">
      <div className="hero-mesh tone-emerald relative mb-6 overflow-hidden rounded-2xl border border-slate-900/10 px-6 py-7">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="emerald">工单 SQ-2026-001</Tag>
          <Tag tone="cyan">答案仅存服务端</Tag>
          <Tag tone="violet">统计同步大屏</Tag>
        </div>
        <h1 className="grad-text mt-3 text-3xl font-extrabold tracking-wide">课后知识点问答</h1>
        <p className="mt-1.5 text-base text-slate-600">
          传感与视觉数据采集 · 检验质量阈值与合规意识，开始挑战！
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-4">
          <Stat value={list.length} label="题目总数" tone="emerald" />
          <Stat value={answered} label="已作答" tone="cyan" />
        </div>
        <div className="mt-4">
          <Bar value={answered} max={Math.max(1, list.length)} color={TONE_HEX.emerald} />
        </div>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card tone="emerald" className="rise-1 p-6">
          <SectionTitle
            icon={<IconBook className="h-6 w-6" />}
            title="练习说明"
            sub="了解作答与反馈机制"
            tone="emerald"
          />
          <ul className="space-y-3">
            {PRACTICE_NOTES.map((n, i) => (
              <li key={n} className="flex items-start gap-3">
                <span className="tone-emerald icon-chip h-7 w-7 shrink-0 rounded-lg text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-slate-600">{n}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card tone="rose" className="rise-2 p-6">
          <SectionTitle
            icon={<IconShield className="h-6 w-6" />}
            title="合规要点速记"
            sub="工单验收红线，答题前先记牢"
            tone="rose"
          />
          <ul className="space-y-3">
            {COMPLIANCE_POINTS.map((c) => (
              <li key={c.title} className="flex items-start gap-3">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" strokeWidth={2.5} />
                <span className="text-sm leading-relaxed text-slate-600">
                  <b className="font-semibold text-slate-900">{c.title}</b>
                  <span className="text-slate-500"> · {c.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-5">
        {list.map((e, ei) => (
          <Card key={e.id} className="p-6">
            <div className="mb-4 flex gap-3">
              <span className="tone-emerald icon-chip h-8 w-8 shrink-0 rounded-lg text-sm font-bold">
                {ei + 1}
              </span>
              <p className="text-base leading-relaxed text-slate-900">{e.title}</p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {e.options.map((opt, oi) => {
                const active = picks[e.id] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => setPicks((p) => ({ ...p, [e.id]: oi }))}
                    className={`tone-emerald flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-base transition-all ${
                      active
                        ? "text-slate-900"
                        : "border-slate-900/10 bg-slate-900/5 text-slate-600 hover:border-slate-900/25 hover:bg-slate-900/[0.08]"
                    }`}
                    style={active ? { borderColor: "var(--tone-line)", background: "var(--tone-soft)" } : undefined}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                        active ? "border-transparent text-ink-950" : "border-slate-500 text-slate-500"
                      }`}
                      style={active ? { background: "var(--tone)" } : undefined}
                    >
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-4 mt-6">
        <button
          disabled={!allDone || submitting}
          onClick={submit}
          className={`w-full rounded-xl py-4 text-center text-base font-semibold transition-all ${
            allDone && !submitting
              ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-ink-950 shadow-lg shadow-emerald-500/25 hover:brightness-110"
              : "cursor-not-allowed bg-slate-900/10 text-slate-500"
          }`}
        >
          {submitting
            ? "正在提交并入库…"
            : allDone
            ? "全部作答完成，提交课后习题 · 冲！"
            : `还有 ${list.length - answered} 题未作答`}
        </button>
      </div>
    </div>
  );
}