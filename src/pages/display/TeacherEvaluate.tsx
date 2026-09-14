import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import type { Student, TeacherEval } from "../../lib/types";
import { EVAL_DIMENSIONS } from "../../lib/course";
import { Card, SectionTitle } from "../../components/ui";
import { IconGauge } from "../../components/icons";

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n === value ? 0 : n)}
          className={`text-xl leading-none transition-transform hover:scale-110 ${
            n <= value ? "text-amber-300" : "text-white/20"
          }`}
          aria-label={`${n} 星`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function avgOf(e?: TeacherEval) {
  if (!e) return 0;
  const vals = EVAL_DIMENSIONS.map((d) => e.scores[d.key] || 0);
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

export default function TeacherEvaluate() {
  const [students, setStudents] = useState<Student[]>([]);
  const [evalMap, setEvalMap] = useState<Record<string, TeacherEval>>({});
  const [selId, setSelId] = useState<string>("");
  const [draft, setDraft] = useState<TeacherEval | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const [st, evs] = await Promise.all([api.listStudents(), api.getEvaluations()]);
      if (!alive) return;
      setStudents(st);
      setEvalMap(Object.fromEntries(evs.map((e) => [e.studentId, e])));
      if (st[0]) setSelId(st[0].id);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!selId) return;
    const existing = evalMap[selId];
    const s = students.find((x) => x.id === selId);
    setDraft(
      existing
        ? { ...existing }
        : { studentId: selId, name: s?.name || selId, scores: {}, comment: "", updatedAt: "" }
    );
    setMsg("");
  }, [selId, evalMap, students]);

  const evaluatedCount = useMemo(() => Object.keys(evalMap).length, [evalMap]);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setMsg("");
    try {
      const saved = await api.saveEvaluation({ studentId: draft.studentId, scores: draft.scores, comment: draft.comment });
      setEvalMap((m) => ({ ...m, [saved.studentId]: saved }));
      setMsg("已保存");
    } catch (e) {
      setMsg(`保存失败：${String((e as Error).message || e)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconGauge className="h-6 w-6" />}
        title="教师评价"
        sub={`按 4 个维度为每位学生打分并写评语 · 已评价 ${evaluatedCount}/${students.length} 人`}
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* 学生列表 */}
        <Card className="max-h-[70vh] overflow-y-auto p-2 scrollbar-thin">
          {students.map((s) => {
            const ev = evalMap[s.id];
            const on = s.id === selId;
            return (
              <button
                key={s.id}
                onClick={() => setSelId(s.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  on ? "bg-brand-500/20 text-white" : "text-brand-100/80 hover:bg-white/5"
                }`}
              >
                <span className="truncate">{s.name}</span>
                <span className={`ml-2 shrink-0 text-xs ${ev ? "text-amber-300" : "text-brand-200/30"}`}>
                  {ev ? `${avgOf(ev)}★` : "—"}
                </span>
              </button>
            );
          })}
        </Card>

        {/* 编辑区 */}
        {draft && (
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{draft.name}</h3>
                <div className="text-xs text-brand-200/50">{draft.studentId}{draft.updatedAt ? ` · 上次保存 ${draft.updatedAt}` : ""}</div>
              </div>
              <span className="rounded-full bg-brand-500/15 px-3 py-1 text-sm font-semibold text-brand-200">综合 {avgOf(draft)}★</span>
            </div>

            <div className="space-y-4">
              {EVAL_DIMENSIONS.map((d) => (
                <div key={d.key} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="min-w-0">
                    <div className="font-medium text-white">{d.label}</div>
                    <div className="text-xs text-brand-200/50">{d.desc}</div>
                  </div>
                  <Stars value={draft.scores[d.key] || 0} onChange={(v) => setDraft({ ...draft, scores: { ...draft.scores, [d.key]: v } })} />
                </div>
              ))}
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm text-brand-200/70">评语</label>
              <textarea
                value={draft.comment}
                onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
                rows={3}
                placeholder="该生本堂课的表现、亮点与建议…"
                className="w-full resize-none rounded-xl border border-brand-400/25 bg-ink-900/50 px-4 py-3 text-sm text-white outline-none focus:border-brand-400/60"
              />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-brand-500 px-6 py-2.5 font-semibold text-ink-900 transition-colors hover:bg-brand-400 disabled:opacity-50"
              >
                {saving ? "保存中…" : "保存评价"}
              </button>
              {msg && <span className={`text-sm ${msg === "已保存" ? "text-emerald-300" : "text-rose-300"}`}>{msg}</span>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
