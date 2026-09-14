import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useStudent } from "../../lib/auth";
import type { PreviewAnswer, PreviewQuestion } from "../../lib/types";
import { IconCheck, IconTrophy } from "../../components/icons";
import { Card } from "../../components/ui";

export default function StudentPreview() {
  const { student } = useStudent();
  const [qs, setQs] = useState<PreviewQuestion[]>([]);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getPreviewQuestions().then(setQs);
  }, []);

  const answered = Object.keys(picks).length;
  const allDone = qs.length > 0 && answered === qs.length;

  const submit = async () => {
    if (!student || !allDone) return;
    setSubmitting(true);
    const scoreOf = (qid: string) => qs.find((q) => q.id === qid)?.score ?? 0;
    const total = qs.reduce((a, q) => a + q.score, 0);
    let score = 0;
    const answers: PreviewAnswer[] = qs.map((q) => {
      const correct = picks[q.id] === q.answer;
      if (correct) score += scoreOf(q.id);
      return {
        studentId: student.id,
        questionId: q.id,
        selected: picks[q.id],
        correct,
      };
    });
    await api.submitPreview(answers);
    setResult({ score, total });
    setSubmitting(false);
  };

  if (result) {
    return (
      <Card className="animate-rise flex flex-col items-center p-10 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
          <IconCheck className="h-8 w-8" strokeWidth={2.5} />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-white">预习作答已提交</h2>
        <p className="mt-1 text-sm text-brand-200/70">成绩已实时同步至讲台大屏</p>
        <div className="my-6 text-6xl font-bold text-brand-300">
          {result.score}
          <span className="text-2xl text-brand-200/50">/{result.total}</span>
        </div>
        <button
          onClick={() => {
            setResult(null);
            setPicks({});
          }}
          className="rounded-xl border border-brand-400/30 px-6 py-2.5 text-sm text-brand-100 transition-colors hover:bg-brand-500/15"
        >
          查看题目回顾
        </button>
      </Card>
    );
  }

  return (
    <div className="animate-rise">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
          <IconTrophy className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-white">课前预习</h2>
          <p className="text-sm text-brand-200/60">
            共 {qs.length} 题 · 已作答 {answered}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {qs.map((q, qi) => (
          <Card key={q.id} className="p-6">
            <div className="mb-4 flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-500/20 text-sm font-bold text-brand-200">
                {qi + 1}
              </span>
              <p className="text-[15px] leading-relaxed text-white">{q.title}</p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {q.options.map((opt, oi) => {
                const active = picks[q.id] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => setPicks((p) => ({ ...p, [q.id]: oi }))}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                      active
                        ? "border-brand-400/60 bg-brand-500/15 text-white"
                        : "border-white/10 bg-white/5 text-brand-100/80 hover:border-brand-400/30"
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs ${
                        active
                          ? "border-brand-300 bg-brand-400 text-ink-900"
                          : "border-brand-200/40"
                      }`}
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
          className={`w-full rounded-xl py-4 text-center font-semibold transition-all ${
            allDone && !submitting
              ? "bg-brand-500 text-ink-900 hover:bg-brand-400"
              : "cursor-not-allowed bg-white/10 text-brand-200/40"
          }`}
        >
          {submitting
            ? "正在提交并同步大屏…"
            : allDone
            ? "提交预习答案"
            : `还有 ${qs.length - answered} 题未作答`}
        </button>
      </div>
    </div>
  );
}
