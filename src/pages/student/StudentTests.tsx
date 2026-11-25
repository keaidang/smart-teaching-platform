import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useStudent } from "../../lib/auth";
import { PROJECTS } from "../../lib/course";
import { PHASES } from "../../lib/learning";
import type { BankQuestion, Phase, PhaseScore } from "../../lib/types";
import { Avatar, Bar, Card, SectionTitle, Tag, type Tone } from "../../components/ui";
import { IconTrophy } from "../../components/icons";

const PROJECT_TONES: Record<string, Tone> = { P1: "cyan", P2: "emerald", P3: "violet", P4: "rose" };

export default function StudentTests() {
  const { student } = useStudent();
  const [taskId, setTaskId] = useState("P1T1");
  const [phase, setPhase] = useState<Phase>("pre");
  const [bank, setBank] = useState<BankQuestion[]>([]);
  const [scores, setScores] = useState<PhaseScore[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number; answered: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let on = true;
    setLoading(true);
    setAnswers({});
    setResult(null);
    Promise.all([api.getTaskBank(taskId, phase), api.getPhaseScores(taskId, phase)])
      .then(([b, s]) => { if (on) { setBank(b); setScores(s); } })
      .catch(() => {})
      .finally(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, [taskId, phase]);

  const mine = scores.find((s) => s.studentId === student?.id);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0;
  const top = [...scores].sort((a, b) => b.score - a.score).slice(0, 5);
  const answeredCount = bank.filter((q) => answers[q.id] != null).length;
  const total = bank.reduce((a, q) => a + q.score, 0);
  const shown = result ?? (mine ? { score: mine.score, total: mine.total, answered: mine.answered } : null);

  const submit = async () => {
    if (!student || busy) return;
    setBusy(true);
    try {
      const r = await api.submitPhaseAnswers({
        studentId: student.id,
        taskId,
        phase,
        answers: Object.entries(answers).map(([questionId, selected]) => ({ questionId, selected })),
      });
      setResult(r);
      setScores(await api.getPhaseScores(taskId, phase));
    } catch {
      /* 接口异常时保持可重试 */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle
        icon={<IconTrophy className="h-6 w-6" />}
        title="任务测评"
        sub="8 个任务 × 课前 / 课中 / 课后 · 全过程分数评价"
        tone="blue"
        right={student ? <Tag tone="blue">{student.name} · {student.id}</Tag> : undefined}
      />

      {/* 任务选择：全部 8 个任务开放测评 */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PROJECTS.map((p) => (
          <Card key={p.id} tone={PROJECT_TONES[p.id]} className="p-3.5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-800">
                <span className="grad-text mr-1.5 font-extrabold">{p.id}</span>
                {p.title}
              </span>
            </div>
            <div className="space-y-1.5">
              {p.tasks.map((t, ti) => (
                <button
                  key={t.id}
                  onClick={() => setTaskId(t.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors ${
                    taskId === t.id ? "chip-tone font-semibold" : "border-slate-900/10 bg-surface text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">任务{ti + 1 + (Number(p.id.slice(1)) - 1) * 2} · {t.title}</span>
                  {t.isNew && <span className="shrink-0 rounded bg-rose-500/10 px-1.5 text-[11px] text-rose-600">新增</span>}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* 阶段切换 */}
      <div className="flex gap-2">
        {PHASES.map((p) => (
          <button
            key={p.key}
            onClick={() => setPhase(p.key)}
            className={`flex-1 rounded-xl border px-4 py-2.5 text-center transition-all ${
              phase === p.key ? "tone-blue chip-tone font-semibold" : "border-slate-900/10 bg-surface text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="block text-sm">{p.label}</span>
            <span className="block text-[11px] opacity-70">{p.desc}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* 答题区 */}
        <Card className="p-5">
          {loading ? (
            <div className="grid min-h-[300px] place-items-center text-sm text-slate-400">加载题库…</div>
          ) : (
            <div className="space-y-5">
              {bank.map((q, qi) => (
                <div key={q.id} className="rounded-xl border border-slate-900/8 bg-slate-50/50 p-4">
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <div className="text-[15px] font-medium leading-relaxed text-slate-900">
                      <span className="tone-blue grad-text mr-2 font-extrabold">{qi + 1}.</span>
                      {q.title}
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-900/6 px-2 py-0.5 text-xs text-slate-500">{q.score} 分</span>
                  </div>
                  <div className="grid gap-1.5">
                    {q.options.map((op, oi) => (
                      <button
                        key={oi}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                        className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          answers[q.id] === oi
                            ? "tone-blue border-blue-500/40 bg-blue-500/8 font-medium text-blue-700"
                            : "border-slate-900/8 bg-surface text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] ${answers[q.id] === oi ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 text-slate-400"}`}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-slate-900/8 pt-4">
                <span className="text-sm text-slate-500">
                  已答 <b className="text-slate-800">{answeredCount}</b> / {bank.length} 题 · 满分 {total}
                </span>
                <button
                  onClick={submit}
                  disabled={answeredCount < bank.length || busy}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy ? "判分中…" : "提交判分"}
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* 成绩侧栏 */}
        <div className="space-y-4">
          <Card tone="blue" className="p-5 text-center">
            <div className="text-sm text-slate-500">{result ? "本次得分" : "我的成绩"}</div>
            {shown ? (
              <>
                <div className="grad-text mt-1 text-5xl font-extrabold tabular-nums">{shown.score}</div>
                <div className="mt-1 text-xs text-slate-500">满分 {shown.total} · 已答 {shown.answered} 题</div>
                <div className="mt-3"><Bar value={shown.score} color="#3a6ea5" /></div>
              </>
            ) : (
              <div className="mt-3 text-sm text-slate-400">完成答题后生成成绩</div>
            )}
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-800">班级情况</span>
              <span className="text-slate-500">{scores.length} 人</span>
            </div>
            <div className="mb-3 flex items-end justify-between">
              <span className="text-sm text-slate-500">班级平均</span>
              <span className="grad-text tone-emerald text-2xl font-extrabold tabular-nums">{avg}</span>
            </div>
            <div className="space-y-2">
              {top.map((s, i) => (
                <div key={s.studentId} className="flex items-center gap-2.5">
                  <span className={`w-5 text-center text-xs font-bold ${i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-slate-300"}`}>{i + 1}</span>
                  <Avatar name={s.name} color={["#3a6ea5", "#2f876b", "#6c5b9e", "#a87b3a", "#a8566e"][i % 5]} size={26} />
                  <span className="flex-1 truncate text-sm text-slate-700">{s.name}</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-800">{s.score}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}