import { useState, type ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Card, SectionTitle, Stat, Tag, type Tone } from "../../components/ui";
import {
  IconBook, IconCheck, IconUpload, IconBoard, IconLayers, IconSkill,
} from "../../components/icons";
import { findTask, isTaskHomework, ACTIVE_TASK_ID, type TaskDef } from "../../lib/course";
import { TASK_BOOK, type Worksheet, type SideBox } from "../../lib/taskbook";

const PROJECT_TONES: Record<string, Tone> = { P1: "cyan", P2: "emerald", P3: "violet", P4: "rose" };

const STATUS_META: Record<TaskDef["status"], { label: string; cls: string; tone: Tone }> = {
  open: { label: "已开放", cls: "bg-sky-500/15 text-sky-600", tone: "blue" },
  ongoing: { label: "进行中 · 主线", cls: "bg-emerald-500/15 text-emerald-600", tone: "emerald" },
  new: { label: "新版新增", cls: "bg-rose-500/15 text-rose-600", tone: "rose" },
};

const SIDE_META: Record<SideBox["kind"], { icon: string; tone: Tone; label: string }> = {
  tip: { icon: "💡", tone: "amber", label: "知识小贴士" },
  avoid: { icon: "⚠", tone: "rose", label: "避坑指南" },
  standard: { icon: "⚖", tone: "violet", label: "标准规范与职业素养" },
};

const SEC_TONES: Tone[] = ["cyan", "blue", "violet", "emerald", "orange", "rose", "amber"];

/* 活页七段标题 */
function SheetHead({ num, title, sub, tone }: { num: string; title: string; sub?: string; tone: Tone }) {
  return (
    <div className={`tone-${tone} mb-4 mt-1 flex flex-wrap items-center gap-3`}>
      <span className="icon-chip grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base font-black">{num}</span>
      <h3 className="text-lg font-bold tracking-wide text-slate-900">{title}</h3>
      {sub && <span className="text-sm text-slate-500">{sub}</span>}
      <span className="divider-grad min-w-[24px] flex-1" />
    </div>
  );
}

/* 将「名称：正文」首段加粗，正文保留原样 */
function Term({ text, marker }: { text: string; marker?: boolean }) {
  const i = text.indexOf("：");
  if (marker) {
    return (
      <span className="leading-relaxed text-slate-600">
        {i > 0 ? (
          <>
            <b className="text-slate-900">{text.slice(0, i)}：</b>
            {text.slice(i + 1)}
          </>
        ) : text}
      </span>
    );
  }
  return <span className="leading-relaxed text-slate-600">{text}</span>;
}

/* 工单要求 / 交付成果 / 质量检查 通用两列行 */
function RowTable({
  rows, headA, headB, tone, renderB,
}: {
  rows: { item: string; req?: string; content?: string }[];
  headA: string; headB: string; tone: Tone;
  renderB?: (r: { item: string; req?: string; content?: string }) => ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--tone-line, rgba(15,23,42,.10))" }}>
      <div className={`tone-${tone} grid grid-cols-[minmax(110px,180px)_1fr] border-b bg-slate-900/[0.04] px-5 py-2.5 text-sm font-bold`}>
        <span style={{ color: "var(--tone)" }}>{headA}</span>
        <span style={{ color: "var(--tone)" }}>{headB}</span>
      </div>
      <div className="divide-y divide-slate-900/5">
        {rows.map((r, i) => (
          <div key={r.item + i} className="grid grid-cols-[minmax(110px,180px)_1fr] px-5 py-3 text-sm transition-colors hover:bg-slate-900/[0.03]">
            <span className="font-semibold text-slate-900">{r.item}</span>
            <span className="text-slate-600">{renderB ? renderB(r) : (r.req || r.content)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 单份子任务活页 ---------- */

function WorksheetView({ ws, tone, base }: { ws: Worksheet; tone: Tone; base: number }) {
  return (
    <div className="flex flex-col gap-6">
      {/* 活页抬头 */}
      <div className={`tone-${tone} tone-card glass rounded-2xl border px-6 py-5`} style={{ borderColor: "var(--tone-line)" }}>
        <div className="flex items-center gap-3">
          <span className={`tone-${tone} chip-tone rounded-lg px-3 py-1 text-sm font-bold`}>{ws.subNo}</span>
          <h3 className="grad-text text-xl font-extrabold tracking-wide lg:text-2xl">{ws.subName}</h3>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>共 7 段 · {ws.orderReq.length} 项工单要求 · {ws.steps.length} 步实施 · {ws.checks.length} 项质检</span>
        </div>
      </div>

      {/* 一、任务情境 */}
      <section>
        <SheetHead num="一" title="任务情境" tone={SEC_TONES[base % SEC_TONES.length]} />
        <Card tone={SEC_TONES[base % SEC_TONES.length]} className="p-6">
          <div className="space-y-2 text-justify leading-relaxed text-slate-600">
            {ws.scenario.split("\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </Card>
      </section>

      {/* 二、工单要求 */}
      <section>
        <SheetHead num="二" title="工单要求" tone={SEC_TONES[(base + 1) % SEC_TONES.length]} />
        <div className={`tone-${SEC_TONES[(base + 1) % SEC_TONES.length]}`}>
          <RowTable rows={ws.orderReq} headA="工单项目" headB="具体要求" tone={SEC_TONES[(base + 1) % SEC_TONES.length]} />
        </div>
      </section>

      {/* 三、交付成果 */}
      <section>
        <SheetHead num="三" title="交付成果" tone={SEC_TONES[(base + 2) % SEC_TONES.length]} />
        {ws.finalDeliverable && (
          <div className={`tone-${SEC_TONES[(base + 2) % SEC_TONES.length]} mb-3 flex items-center gap-3 rounded-xl border bg-slate-900/[0.03] px-5 py-3`} style={{ borderColor: "var(--tone-line)" }}>
            <span className="text-lg">🎯</span>
            <div className="text-sm">
              <span className="text-slate-500">最终交付物：</span>
              <b className="text-slate-900">{ws.finalDeliverable}</b>
            </div>
          </div>
        )}
        <RowTable rows={ws.deliverables.map((d) => ({ item: d.item, content: d.content }))} headA="成果项目" headB="交付内容" tone={SEC_TONES[(base + 2) % SEC_TONES.length]} />
      </section>

      {/* 四、知识要点 */}
      <section>
        <SheetHead num="四" title="知识要点" tone={SEC_TONES[(base + 3) % SEC_TONES.length]} />
        <div className="grid gap-3 md:grid-cols-2">
          {ws.knowledge.map((k, i) => {
            const kt = SEC_TONES[(base + 3 + (i % 2)) % SEC_TONES.length];
            return (
              <div key={i} className={`tone-${kt} flex gap-3 rounded-xl border bg-slate-900/[0.03] p-4`} style={{ borderColor: "var(--tone-line)" }}>
                <span className={`tone-${kt} icon-chip grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-bold`}>{i + 1}</span>
                <p className="text-sm"><Term text={k} marker /></p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 五、任务实施 */}
      <section>
        <SheetHead num="五" title="任务实施" sub="课堂实操路线" tone={SEC_TONES[(base + 4) % SEC_TONES.length]} />
        <div className="space-y-3">
          {ws.steps.map((s, i) => {
            const st = SEC_TONES[(base + 4 + i) % SEC_TONES.length];
            return (
              <Card key={i} tone={st} hover className="flex items-start gap-4 p-5">
                <span className={`tone-${st} icon-chip grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold`}>{i + 1}</span>
                <div className="min-w-0"><Term text={s} marker /></div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 侧栏框：知识小贴士 / 避坑指南 / 标准规范 */}
      {ws.sideBoxes.length > 0 && (
        <section className="grid gap-4 lg:grid-cols-2">
          {ws.sideBoxes.map((b, i) => {
            const m = SIDE_META[b.kind];
            return (
              <div key={i} className={`tone-${m.tone} rounded-xl border bg-slate-900/[0.03] p-5`} style={{ borderColor: "var(--tone-line)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.icon}</span>
                  <h4 className="text-base font-bold" style={{ color: "var(--tone)" }}>{b.title || m.label}</h4>
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {b.points.map((p, j) => (
                    <li key={j} className="flex gap-2 leading-relaxed text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--tone)" }} />
                      <span><Term text={p} marker /></span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      {/* 六、工作记录 */}
      <section>
        <SheetHead num="六" title="工作记录" sub="实施环节与操作记录（课堂填写）" tone={SEC_TONES[(base + 5) % SEC_TONES.length]} />
        <div className={`tone-${SEC_TONES[(base + 5) % SEC_TONES.length]}`}>
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--tone-line)" }}>
            <div className="grid grid-cols-[minmax(140px,1fr)_1.4fr] border-b bg-slate-900/[0.04] px-5 py-2.5 text-sm font-bold">
              <span style={{ color: "var(--tone)" }}>实施环节</span>
              <span style={{ color: "var(--tone)" }}>操作记录与结果</span>
            </div>
            <div className="divide-y divide-slate-900/5">
              {ws.workRecords.map((w) => (
                <div key={w} className="grid min-h-[52px] grid-cols-[minmax(140px,1fr)_1.4fr] px-5 text-sm">
                  <span className="self-center font-medium text-slate-800">{w}</span>
                  <span className="self-center border-l border-dashed border-slate-900/10 py-3 pl-4 italic text-slate-400">（课堂填写）</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 七、成果质量检查 */}
      <section>
        <SheetHead num="七" title="成果质量检查" sub="逐项自评：合格 / 待改进" tone={SEC_TONES[(base + 6) % SEC_TONES.length]} />
        <div className={`tone-${SEC_TONES[(base + 6) % SEC_TONES.length]}`}>
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--tone-line)" }}>
            <div className="grid grid-cols-[minmax(110px,180px)_1fr_minmax(150px,auto)] border-b bg-slate-900/[0.04] px-5 py-2.5 text-sm font-bold">
              <span style={{ color: "var(--tone)" }}>检查项目</span>
              <span style={{ color: "var(--tone)" }}>合格要求</span>
              <span style={{ color: "var(--tone)" }}>检查结果</span>
            </div>
            <div className="divide-y divide-slate-900/5">
              {ws.checks.map((c) => (
                <div key={c.item} className="grid grid-cols-[minmax(110px,180px)_1fr_minmax(150px,auto)] items-center gap-x-3 px-5 py-3 text-sm">
                  <span className="font-semibold text-slate-900">{c.item}</span>
                  <span className="text-slate-600">{c.req}</span>
                  <span className="flex items-center gap-3 text-slate-500">
                    <label className="flex cursor-pointer items-center gap-1"><input type="checkbox" className="accent-emerald-600" />合格</label>
                    <label className="flex cursor-pointer items-center gap-1"><input type="checkbox" className="accent-amber-600" />待改进</label>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function TaskDetail() {
  const { taskId = "" } = useParams();
  const found = findTask(taskId);

  if (!found) return <Navigate to="/projects" replace />;
  const { project, task } = found;
  if (!task.active) return <Navigate to="/projects" replace />;

  const tone = PROJECT_TONES[project.id] ?? "cyan";
  const pages = TASK_BOOK[task.id] ?? [];
  const [tab, setTab] = useState(0);
  const sm = STATUS_META[task.status];

  return (
    <div className="flex flex-col gap-6">
      {/* 顶部任务横幅 */}
      <div className={`tone-${tone} tone-card glass animate-rise relative overflow-hidden rounded-2xl px-7 py-8`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="icon-chip h-12 w-12 rounded-xl"><IconBook className="h-6 w-6" /></span>
          <h1 className="grad-text text-3xl font-extrabold tracking-wide lg:text-4xl">{task.title}</h1>
          <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${sm.cls}`}>{sm.label}</span>
          <Tag tone={tone}>{project.id} · {project.title}</Tag>
        </div>
        <p className="mt-3 max-w-4xl text-base leading-relaxed text-slate-600">{task.desc}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-4">
          <Stat value={project.hours} label="项目课时" tone={tone} />
          <Stat value={pages.length} label="活页任务书" tone="blue" />
          <Stat value={pages.reduce((a, w) => a + w.steps.length, 0)} label="实施步骤" tone="violet" />
          <Stat value={pages.reduce((a, w) => a + w.checks.length, 0)} label="质检项" tone="emerald" />
          <Stat value={pages.reduce((a, w) => a + w.knowledge.length, 0)} label="知识要点" tone="amber" />
        </div>
      </div>

      {/* 子任务活页切换 */}
      {pages.length > 0 ? (
        <>
          <div className="animate-rise rise-1 flex flex-wrap items-center gap-3">
            <SectionTitle
              icon={<IconLayers className="h-6 w-6" />}
              title="活页任务书"
              sub="点击切换本任务下的子任务活页"
              tone={tone}
            />
          </div>
          <div className="animate-rise rise-1 flex flex-wrap gap-3">
            {pages.map((w, i) => (
              <button
                key={i}
                onClick={() => setTab(i)}
                className={`flex items-center gap-2.5 rounded-xl border px-5 py-3 text-left transition-all ${
                  tab === i ? "shadow-sm" : "opacity-80 hover:opacity-100"
                }`}
                style={{
                  borderColor: tab === i ? "var(--tone)" : "rgba(15,23,42,.10)",
                  background: tab === i ? "var(--tone-soft, rgba(15,23,42,.04))" : "transparent",
                }}
              >
                <span className={`tone-${tone} icon-chip grid h-9 w-9 place-items-center rounded-lg text-sm font-bold`}>{i + 1}</span>
                <span>
                  <span className="block text-xs text-slate-500">{w.subNo}</span>
                  <span className={`block text-sm font-semibold ${tab === i ? "text-slate-900" : "text-slate-600"}`}>{w.subName}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="animate-rise rise-2">
            <WorksheetView ws={pages[tab]} tone={tone} base={tab * 2} />
          </div>
        </>
      ) : (
        <Card tone={tone} className="p-8 text-slate-500">该任务的活页任务书整理中。</Card>
      )}

      {/* 底部行动区 */}
      <div className="animate-rise rise-4 grid gap-4 sm:grid-cols-3">
        <Link to={`/student/tests?task=${task.id}`}>
          <Card tone="blue" hover className="flex h-full items-center gap-4 p-5">
            <span className="tone-blue icon-chip grid h-11 w-11 shrink-0 place-items-center rounded-xl"><IconSkill className="h-5 w-5" /></span>
            <div className="min-w-0"><div className="font-semibold text-slate-900">任务测评</div><div className="text-xs text-slate-500">课前 · 课中 · 课后达标检测</div></div>
          </Card>
        </Link>
        {(isTaskHomework(task.id) || task.id === ACTIVE_TASK_ID) && (
          <Link to={isTaskHomework(task.id) ? `/student/homework?task=${task.id}` : "/student/homework"}>
            <Card tone="emerald" hover className="flex h-full items-center gap-4 p-5">
              <span className="tone-emerald icon-chip grid h-11 w-11 shrink-0 place-items-center rounded-xl"><IconUpload className="h-5 w-5" /></span>
              <div className="min-w-0"><div className="font-semibold text-slate-900">提交作业</div><div className="text-xs text-slate-500">上传本任务成果与记录</div></div>
            </Card>
          </Link>
        )}
        <Link to={isTaskHomework(task.id) ? `/class/homework?task=${task.id}` : task.id === ACTIVE_TASK_ID ? "/class/homework" : "/class"}>
          <Card tone="violet" hover className="flex h-full items-center gap-4 p-5">
            <span className="tone-violet icon-chip grid h-11 w-11 shrink-0 place-items-center rounded-xl"><IconBoard className="h-5 w-5" /></span>
            <div className="min-w-0"><div className="font-semibold text-slate-900">后台大屏</div><div className="text-xs text-slate-500">查看本任务提交与课堂数据</div></div>
          </Card>
        </Link>
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-600">
        <IconCheck className="h-4 w-4" /> 活页任务书依据《智慧社区 · 活页任务书》整理，含工单要求、交付成果、知识要点、任务实施、工作记录与质量检查七段，与课堂测评、作业提交通道联动。
      </div>
    </div>
  );
}
