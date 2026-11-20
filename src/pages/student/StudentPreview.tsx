import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useStudent } from "../../lib/auth";
import type { PreviewAnswer, PreviewQuestion, PreviewScore } from "../../lib/types";
import { IconBook, IconCheck, IconIdea } from "../../components/icons";
import { Bar, Card, SectionTitle, Stat, Tag, TONE_HEX } from "../../components/ui";
import { ACTIVE_TASK_CHECKLIST } from "../../lib/course";

// 工单背景速览：抽取 SQ-2026-001 课堂任务清单中最关键的 4 步（研读 / 合规 / 质检 / 验收）
const BRIEF_STEPS = [0, 1, 3, 7].map((i) => ACTIVE_TASK_CHECKLIST[i]);

const TIPS = [
  "题目围绕工单验收阈值与合规底线，先看清数字与条件再选择。",
  "判分在服务端完成，答案不会下发到前端，放心独立作答。",
  "可重复作答，系统以最后一次提交为准，成绩实时同步讲台大屏。",
];

export default function StudentPreview() {
  const { student } = useStudent();
  const [qs, setQs] = useState<PreviewQuestion[]>([]);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [prev, setPrev] = useState<PreviewScore | null>(null);

  useEffect(() => {
    api.getPreviewQuestions().then(setQs);
    api
      .getPreviewScores()
      .then((rows) => setPrev(rows.find((r) => r.studentId === student?.id) ?? null))
      .catch(() => {});
  }, [student?.id]);

  const answered = Object.keys(picks).length;
  const allDone = qs.length > 0 && answered === qs.length;
  const totalScore = qs.reduce((s, q) => s + q.score, 0);

  const submit = async () => {
    if (!student || !allDone) return;
    setSubmitting(true);
    setErr("");
    // 判分在服务端完成：答案从不下发前端，这里只上传选项
    const answers: PreviewAnswer[] = qs.map((q) => ({
      studentId: student.id,
      questionId: q.id,
      selected: picks[q.id],
    }));
    try {
      const res = await api.submitPreview(answers);
      const r = res.results?.[student.id];
      setResult({
        score: r?.score ?? 0,
        total: r?.total ?? qs.reduce((s, q) => s + q.score, 0),
      });
    } catch (e) {
      setErr(`提交失败：${String((e as Error).message || e)}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <Card tone="cyan" className="animate-rise flex flex-col items-center p-10 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-600">
          <IconCheck className="h-8 w-8" strokeWidth={2.5} />
        </span>
        <h2 className="mt-5 text-2xl font-semibold text-slate-900">预习作答已提交</h2>
        <p className="mt-1 text-base text-slate-500">
          成绩已实时同步至讲台大屏 · 系统以最后一次提交为准
        </p>
        <div className="tone-cyan my-6">
          <span className="grad-text text-6xl font-extrabold tabular-nums">{result.score}</span>
          <span className="text-2xl text-slate-500">/{result.total}</span>
        </div>
        {prev && (
          <p className="-mt-3 mb-4 text-xs text-slate-500">
            上一次提交成绩：{prev.score} 分（已被本次覆盖）
          </p>
        )}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          <Tag tone="emerald">已同步大屏</Tag>
          <Tag tone="cyan">服务端判分</Tag>
        </div>
        <button
          onClick={() => {
            setResult(null);
            setPicks({});
          }}
          className="rounded-xl border border-cyan-400/30 px-6 py-2.5 text-sm text-cyan-600 transition-colors hover:bg-cyan-500/15"
        >
          重新作答
        </button>
      </Card>
    );
  }

  return (
    <div className="animate-rise">
      <div className="hero-mesh tone-cyan relative mb-6 overflow-hidden rounded-2xl border border-slate-900/10 px-6 py-7">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="cyan">工单 SQ-2026-001</Tag>
          <Tag tone="blue">服务端判分</Tag>
          <Tag tone="violet">最后一次提交为准</Tag>
        </div>
        <h1 className="grad-text mt-3 text-3xl font-extrabold tracking-wide">课前预习</h1>
        <p className="mt-1.5 text-base text-slate-600">
          传感与视觉数据采集 · 先研读工单要点，再开始挑战！
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-4">
          <Stat value={qs.length} label="题目总数" tone="cyan" />
          <Stat value={answered} label="已作答" tone="blue" />
          <Stat value={totalScore} label="满分" tone="violet" />
        </div>
        <div className="mt-4">
          <Bar value={answered} max={Math.max(1, qs.length)} color={TONE_HEX.cyan} />
        </div>
      </div>

      <Card tone="cyan" className="rise-1 mb-6 p-6">
        <SectionTitle
          icon={<IconBook className="h-6 w-6" />}
          title="工单背景速览"
          sub="SQ-2026-001 · 合规人脸特征底库建设的关键要求"
          tone="cyan"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {BRIEF_STEPS.map((s) => (
            <div
              key={s.step}
              className="tone-cyan rounded-xl border bg-slate-900/[0.03] px-5 py-4"
              style={{ borderColor: "var(--tone-line)" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="grad-text text-xl font-extrabold">{s.step}</span>
                <span className="text-base font-semibold text-slate-900">{s.title}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {prev && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-600">
          <span className="mt-0.5 shrink-0 font-bold">!</span>
          <p>
            你已提交过预习（当前成绩 <b>{prev.score}</b> 分）。可重新作答，系统以<b>最后一次提交</b>为准。
          </p>
        </div>
      )}

      <div className="space-y-5">
        {qs.map((q, qi) => (
          <Card key={q.id} className="p-6">
            <div className="mb-4 flex gap-3">
              <span className="tone-cyan icon-chip h-8 w-8 shrink-0 rounded-lg text-sm font-bold">
                {qi + 1}
              </span>
              <p className="text-base leading-relaxed text-slate-900">{q.title}</p>
              <span className="ml-auto shrink-0 text-xs text-slate-500">{q.score} 分</span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {q.options.map((opt, oi) => {
                const active = picks[q.id] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => setPicks((p) => ({ ...p, [q.id]: oi }))}
                    className={`tone-cyan flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-base transition-all ${
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

      <Card className="mt-6 p-5">
        <div className="flex items-start gap-3">
          <span className="tone-violet icon-chip h-10 w-10 shrink-0 rounded-xl">
            <IconIdea className="h-5 w-5" />
          </span>
          <div>
            <div className="text-base font-semibold text-slate-900">答题小贴士</div>
            <ul className="mt-2 space-y-1.5">
              {TIPS.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm leading-relaxed text-slate-500">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <div className="sticky bottom-4 mt-6">
        {err && (
          <p className="mb-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-center text-sm text-rose-600">
            {err}
          </p>
        )}
        <button
          disabled={!allDone || submitting}
          onClick={submit}
          className={`w-full rounded-xl py-4 text-center text-base font-semibold transition-all ${
            allDone && !submitting
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-ink-950 shadow-lg shadow-cyan-500/25 hover:brightness-110"
              : "cursor-not-allowed bg-slate-900/10 text-slate-500"
          }`}
        >
          {submitting
            ? "正在提交并同步大屏…"
            : allDone
            ? "全部作答完成，提交预习答案 · 冲！"
            : `还有 ${qs.length - answered} 题未作答`}
        </button>
      </div>
    </div>
  );
}