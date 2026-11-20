import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../lib/api";
import { nodes, edges, short, KIND_LABEL, type GNode } from "../../lib/graph";
import type { GraphStats as GraphStatsData } from "../../lib/types";
import { EChart, dark } from "../../components/EChart";
import { Bar, Card, Tag } from "../../components/ui";

const CLOUD_COLORS = ["#1f7a8c", "#3a6ea5", "#6c5b9e", "#2f876b", "#a87b3a", "#a8566e", "#b06e43"];
const masteryColor = (m: number) => (m >= 80 ? "#2f876b" : m >= 60 ? "#a87b3a" : "#a8566e");

function Ring({ value, color = "#2f876b", size = 92 }: { value: number; color?: string; size?: number }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 84 84">
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth="8" />
      <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`} transform="rotate(-90 42 42)" />
      <text x="42" y="46" textAnchor="middle" fontSize="17" fontWeight="700" fill="#0f172a">{value}%</text>
    </svg>
  );
}

export default function GraphStats() {
  const [data, setData] = useState<GraphStatsData | null>(null);
  const [tab, setTab] = useState<"students" | "knowledge">("students");
  const [sel, setSel] = useState<GNode | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLOutputElement>(null);

  useEffect(() => { api.getGraphStats().then(setData).catch(() => {}); }, []);

  /* ===== 掌握度着色图谱画布 ===== */
  useEffect(() => {
    if (!data) return;
    const canvas = canvasRef.current!, stage = stageRef.current!, ctx = canvas.getContext("2d")!;
    const tip = tipRef.current!;
    const mastery = new Map(data.knowledge.map((k) => [k.id, k]));
    let w = 1, h = 1, dpr = 1, scale = 1, tx = 0, ty = 0, base = 1, queued = false;
    let hovered: GNode | null = null, selected: GNode | null = null;
    let drag: { x: number; y: number; tx: number; ty: number; moved: boolean; id: number } | null = null;
    let hits: [GNode, number, number, number][] = [];

    const colorOf = (n: GNode) => {
      if (n.level < 4) return n.level === 0 ? "#3a6ea5" : n.color;
      return masteryColor(mastery.get(n.id)?.mastery ?? 65);
    };
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; draw(); }); } };

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const X = (n: GNode) => n.x * scale + tx, Y = (n: GNode) => n.y * scale + ty;
      hits = [];
      for (const e of edges) {
        const ax = X(e.a), ay = Y(e.a), bx = X(e.b), by = Y(e.b);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.strokeStyle = e.hier ? "rgba(58,110,165,0.30)" : "rgba(100,116,139,0.22)";
        ctx.lineWidth = 0.8;
        ctx.setLineDash(e.hier ? [] : [3, 3]);
        ctx.stroke(); ctx.setLineDash([]);
      }
      const labels: { n: GNode; px: number; py: number; text: string; pr: number }[] = [];
      for (const n of nodes) {
        const px = X(n), py = Y(n);
        if (px < -120 || px > w + 120 || py < -50 || py > h + 50) continue;
        const r = Math.max(n.level < 4 ? 4 : 3, n.r * Math.min(scale, 1.65));
        const current = n === selected || n === hovered;
        if (current) {
          ctx.beginPath(); ctx.arc(px, py, r + 3.5, 0, Math.PI * 2);
          ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2; ctx.stroke();
        }
        ctx.fillStyle = colorOf(n);
        ctx.beginPath();
        if (n.level < 4) { ctx.moveTo(px, py - r); ctx.lineTo(px + r, py); ctx.lineTo(px, py + r); ctx.lineTo(px - r, py); ctx.closePath(); }
        else ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        hits.push([n, px, py, r + 6]);
        if (current || n.level <= 3 || scale / base > 1.25) {
          labels.push({ n, px, py: py + r + 4, text: current ? n.name : short(n.name, n.level <= 2 ? 12 : 10), pr: current ? 0 : n.level + 1 });
        }
      }
      const occ: [number, number, number, number][] = [];
      for (const l of labels.sort((a, b) => a.pr - b.pr)) {
        const size = l.pr === 0 ? 12 : l.n.level < 3 ? 11 : 10;
        ctx.font = (l.n.level < 3 ? "600 " : "") + size + 'px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        const half = ctx.measureText(l.text).width / 2 + 3;
        const b: [number, number, number, number] = [l.px - half, l.py - 2, l.px + half, l.py + size + 3];
        if (l.pr > 0 && occ.some(([a, bb, c, d]) => b[0] < c && b[2] > a && b[1] < d && b[3] > bb)) continue;
        occ.push(b);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.lineJoin = "round";
        ctx.strokeText(l.text, l.px, l.py);
        ctx.fillStyle = "#0f172a"; ctx.fillText(l.text, l.px, l.py);
      }
      if (zoomRef.current) zoomRef.current.value = Math.round((100 * scale) / base) + "%";
    }

    function fit() {
      const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y);
      const l = Math.min(...xs), r = Math.max(...xs), t = Math.min(...ys), b = Math.max(...ys);
      scale = Math.max(0.03, Math.min(1.6, (w - 50) / Math.max(150, r - l), (h - 90) / Math.max(150, b - t)));
      base = scale;
      tx = w / 2 - ((l + r) * scale) / 2; ty = h / 2 - ((t + b) * scale) / 2;
      schedule();
    }
    function resize() {
      const ow = w, oh = h;
      w = stage.clientWidth; h = stage.clientHeight;
      dpr = Math.min(devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      if (ow === 1) fit(); else { tx += (w - ow) / 2; ty += (h - oh) / 2; schedule(); }
    }
    const ro = new ResizeObserver(resize); ro.observe(stage);
    const zoom = (m: number, x = w / 2, y = h / 2) => {
      const next = Math.min(4.4, Math.max(0.03, scale * m));
      tx = x - ((x - tx) * next) / scale; ty = y - ((y - ty) * next) / scale; scale = next;
      schedule();
    };
    const local = (e: { clientX: number; clientY: number }) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const hit = (p: { x: number; y: number }) => {
      let min = Infinity, res: GNode | null = null;
      for (const [n, x, y, r] of hits) { const d = Math.hypot(p.x - x, p.y - y); if (d <= r && d < min) { min = d; res = n; } }
      return res;
    };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); const p = local(e); zoom(Math.exp(-e.deltaY * 0.0013), p.x, p.y); };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const p = local(e);
      canvas.setPointerCapture(e.pointerId);
      drag = { x: p.x, y: p.y, tx, ty, moved: false, id: e.pointerId };
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (drag && drag.id === e.pointerId) {
        const dx = p.x - drag.x, dy = p.y - drag.y;
        drag.moved ||= Math.hypot(dx, dy) > 5;
        if (drag.moved) { tx = drag.tx + dx; ty = drag.ty + dy; schedule(); }
        return;
      }
      const n = hit(p);
      if (n !== hovered) { hovered = n; schedule(); }
      tip.hidden = !n;
      if (n) {
        const k = mastery.get(n.id);
        tip.textContent = n.name + (k ? ` · 掌握率 ${k.mastery}% · 完成率 ${k.completion}%` : ` · ${KIND_LABEL[n.type] ?? n.type}`);
        tip.style.left = Math.max(0, Math.min(w - tip.offsetWidth - 5, p.x + 12)) + "px";
        tip.style.top = Math.max(0, Math.min(h - tip.offsetHeight - 5, p.y + 13)) + "px";
      }
    };
    const onUp = (e: PointerEvent) => {
      if (drag?.id === e.pointerId) {
        if (!drag.moved) { selected = hit(local(e)); setSel(selected); schedule(); }
        drag = null;
      }
      canvas.style.cursor = "grab";
    };
    const onLeave = () => { hovered = null; tip.hidden = true; schedule(); };
    const onDbl = (e: MouseEvent) => {
      const n = hit(local(e));
      if (n) { scale = Math.max(scale, Math.min(1.15, base * 2.05)); tx = w / 2 - n.x * scale; ty = h / 2 - n.y * scale; selected = n; setSel(n); schedule(); }
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("dblclick", onDbl);
    const plus = () => zoom(1.25), minus = () => zoom(0.8);
    document.getElementById("gs-plus")?.addEventListener("click", plus);
    document.getElementById("gs-minus")?.addEventListener("click", minus);
    document.getElementById("gs-fit")?.addEventListener("click", fit);
    resize();
    return () => {
      ro.disconnect();
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("dblclick", onDbl);
      document.getElementById("gs-plus")?.removeEventListener("click", plus);
      document.getElementById("gs-minus")?.removeEventListener("click", minus);
      document.getElementById("gs-fit")?.removeEventListener("click", fit);
    };
  }, [data]);

  const donutOpt = useMemo(() => data && dark({
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: "pie",
      radius: ["52%", "74%"],
      center: ["50%", "44%"],
      label: { show: false },
      data: data.bands.map((b, i) => ({ name: b.label, value: b.value, itemStyle: { color: ["#a8566e", "#a87b3a", "#2f876b"][i] } })),
    }],
  }), [data]);

  if (!data) return <div className="grid min-h-[50vh] place-items-center text-sm text-slate-400">图谱统计加载中…</div>;

  const selK = sel ? data.knowledge.find((k) => k.id === sel.id) : undefined;

  return (
    <div className="flex flex-col gap-5">
      {/* 横幅 */}
      <div className="hero-mesh rounded-2xl border border-slate-900/8 px-7 py-6">
        <h1 className="hero-title text-3xl font-extrabold tracking-wide">知识图谱统计分析</h1>
        <p className="mt-1.5 text-sm text-slate-500">知识点掌握 · 学习行为 · 任务关联 · 全班 28 人全过程数据</p>
      </div>

      {/* 统计卡 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card tone="cyan" className="p-5">
          <div className="text-sm text-slate-500">图谱知识点总数</div>
          <div className="grad-text mt-1 text-4xl font-extrabold tabular-nums">{data.totalKnowledge}<span className="ml-1 text-base font-medium text-slate-500">个</span></div>
          <div className="mt-2 text-xs text-slate-400">课程 · 4 项目 · 8 任务 · 20 模块</div>
        </Card>
        <Card tone="blue" className="p-5">
          <div className="text-sm text-slate-500">关联资源测试知识点</div>
          <div className="grad-text mt-1 text-4xl font-extrabold tabular-nums">{data.linkedKnowledge}<span className="ml-1 text-base font-medium text-slate-500">个</span></div>
          <div className="mt-2 text-xs text-slate-400">覆盖 8 任务 × 课前/课中/课后题库</div>
        </Card>
        <Card tone="emerald" className="flex items-center gap-4 p-5">
          <Ring value={data.masteryAvg} />
          <div>
            <div className="text-sm text-slate-500">已掌握知识点比例</div>
            <div className="mt-1 text-xs leading-relaxed text-slate-400">按全班平均掌握率统计<br />≥80% 视为熟练掌握</div>
          </div>
        </Card>
        <Card tone="violet" className="p-5">
          <div className="mb-2 text-sm text-slate-500">课程知识关联教学任务统计</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: data.taskLink.classroom, l: "课堂教学", t: "cyan" },
              { v: data.taskLink.ideology, l: "课程思政", t: "rose" },
              { v: data.taskLink.training, l: "作业/实验训练", t: "amber" },
              { v: data.taskLink.exam, l: "考试", t: "blue" },
            ].map((x) => (
              <div key={x.l} className={`tone-${x.t} chip-tone rounded-lg px-2.5 py-1.5 text-center`}>
                <span className="block text-lg font-extrabold tabular-nums">{x.v}</span>
                <span className="block text-[11px] opacity-80">{x.l}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 词云 */}
      <Card className="p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-800">大家都在学</h3>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-2 py-3">
          {data.cloud.map((c, i) => (
            <span key={c.name} title={`学习热度 ${c.heat}`}
              className="cursor-default transition-transform hover:scale-110"
              style={{ fontSize: 12 + (c.heat / 100) * 15, color: CLOUD_COLORS[i % CLOUD_COLORS.length], fontWeight: c.heat > 75 ? 700 : 500 }}>
              {c.name}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        {/* 学习情况分析 */}
        <Card className="p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-800">知识点学习情况分析</h3>
          <div className="mb-2 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-slate-900/[0.03] px-3 py-3">
              <div className="grad-text tone-cyan text-3xl font-extrabold tabular-nums">{data.completionAvg}%</div>
              <div className="mt-1 text-xs text-slate-500">知识点平均完成率</div>
            </div>
            <div className="rounded-xl bg-slate-900/[0.03] px-3 py-3">
              <div className="grad-text tone-emerald text-3xl font-extrabold tabular-nums">{data.masteryAvg}%</div>
              <div className="mt-1 text-xs text-slate-500">知识点平均掌握率</div>
            </div>
          </div>
          <div className="mb-1 text-sm text-slate-500">班级学生掌握率分布</div>
          {donutOpt && <EChart option={donutOpt} height={240} />}
        </Card>

        {/* TOPS 表 */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {([["students", "学生掌握率分析"], ["knowledge", "知识点掌握率分析"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${tab === k ? "tone-blue chip-tone" : "text-slate-500 hover:bg-slate-900/5"}`}>
                  {l}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400">{tab === "students" ? `${data.students.length} 名学生` : `${data.knowledge.length} 个知识点 · 薄弱优先`}</span>
          </div>
          <div className="scrollbar-thin max-h-[420px] overflow-auto">
            {tab === "students" ? (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white text-left text-xs text-slate-400">
                  <tr><th className="py-2 pr-2">排名</th><th className="py-2 pr-2">姓名</th><th className="py-2 pr-2">学号</th><th className="py-2 pr-2">完成率</th><th className="py-2">掌握率</th></tr>
                </thead>
                <tbody>
                  {data.students.map((s, i) => (
                    <tr key={s.id} className="border-t border-slate-900/5">
                      <td className="py-2 pr-2">
                        <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${i === 0 ? "bg-amber-400/20 text-amber-600" : i === 1 ? "bg-slate-400/20 text-slate-500" : i === 2 ? "bg-amber-700/15 text-amber-700" : "text-slate-400"}`}>{i + 1}</span>
                      </td>
                      <td className="py-2 pr-2 font-medium text-slate-800">{s.name}</td>
                      <td className="py-2 pr-2 text-xs text-slate-400">{s.id}</td>
                      <td className="py-2 pr-2"><div className="flex items-center gap-2"><div className="w-16"><Bar value={s.completion} color="#3a6ea5" height={5} /></div><span className="text-xs tabular-nums text-slate-600">{s.completion}%</span></div></td>
                      <td className="py-2"><div className="flex items-center gap-2"><div className="w-16"><Bar value={s.mastery} color={masteryColor(s.mastery)} height={5} /></div><span className="text-xs font-semibold tabular-nums text-slate-700">{s.mastery}%</span></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white text-left text-xs text-slate-400">
                  <tr><th className="py-2 pr-2">知识点</th><th className="py-2 pr-2">类型</th><th className="py-2 pr-2">关联任务</th><th className="py-2 pr-2">掌握率</th><th className="py-2">完成率</th></tr>
                </thead>
                <tbody>
                  {data.knowledge.map((k) => (
                    <tr key={k.id} className="border-t border-slate-900/5">
                      <td className="max-w-[220px] truncate py-2 pr-2 font-medium text-slate-800" title={k.name}>{k.name}</td>
                      <td className="py-2 pr-2 text-xs text-slate-500">{k.type}</td>
                      <td className="py-2 pr-2 text-xs text-slate-500">{k.task}</td>
                      <td className="py-2 pr-2"><span className="font-semibold tabular-nums" style={{ color: masteryColor(k.mastery) }}>{k.mastery}%</span></td>
                      <td className="py-2 text-xs tabular-nums text-slate-600">{k.completion}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* 掌握度着色图谱 */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 px-5 py-3">
          <h3 className="text-base font-semibold text-slate-800">图谱掌握总览</h3>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2f876b]" />熟练掌握 ≥80</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#a87b3a]" />基本掌握 60–79</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#a8566e]" />待达标 &lt;60</span>
            <span className="flex items-center gap-1.5"><span className="text-slate-400">◆</span>结构节点</span>
          </div>
        </div>
        <div ref={stageRef} className="relative h-[560px] min-w-0">
          <canvas ref={canvasRef} className="block h-full w-full cursor-grab touch-none outline-none" />
          <div ref={tipRef} hidden className="pointer-events-none absolute z-10 max-w-[300px] rounded-lg border border-slate-900/12 bg-white px-2.5 py-1.5 text-[13px] text-slate-800 shadow-lg" />
          {sel && (
            <div className="absolute top-3 right-3 w-72 rounded-xl border border-slate-900/10 bg-white/95 p-4 shadow-xl backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-semibold leading-snug text-slate-900">{sel.name}</div>
                <button onClick={() => setSel(null)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>
              <div className="mt-1 text-xs text-slate-400">{KIND_LABEL[sel.type] ?? sel.type} · {sel.group}{sel.mark ? ` · ${sel.mark}` : ""}</div>
              {selK ? (
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500"><span>关联任务</span><Tag tone="blue" className="!px-2 !py-0.5 text-xs">{selK.task}</Tag></div>
                  <div><div className="mb-1 flex justify-between text-xs text-slate-500"><span>掌握率</span><b style={{ color: masteryColor(selK.mastery) }}>{selK.mastery}%</b></div><Bar value={selK.mastery} color={masteryColor(selK.mastery)} height={6} /></div>
                  <div><div className="mb-1 flex justify-between text-xs text-slate-500"><span>完成率</span><b className="text-slate-700">{selK.completion}%</b></div><Bar value={selK.completion} color="#3a6ea5" height={6} /></div>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-400">结构节点 · 点击知识点查看掌握数据</div>
              )}
            </div>
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-xl border border-slate-900/10 bg-white/95 p-1 shadow-lg">
            <button id="gs-minus" className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100">−</button>
            <output ref={zoomRef} className="min-w-12 text-center text-xs text-slate-500 tabular-nums">100%</output>
            <button id="gs-plus" className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100">＋</button>
            <button id="gs-fit" className="ml-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100">查看全图</button>
          </div>
          <div className="pointer-events-none absolute right-3 bottom-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs text-slate-500 shadow-sm">拖动平移 · 滚轮缩放 · 单击查看掌握度 · 双击聚焦</div>
        </div>
      </Card>
    </div>
  );
}