import { useEffect, useRef } from "react";
import { SectionTitle } from "../../components/ui";
import { IconIdea } from "../../components/icons";
import {
  nodes, edges, adjacent, MARK_COLORS, KIND_LABEL, short,
  type GNode, type GEdge,
} from "../../lib/graph";
import { canvasTheme } from "../../lib/theme";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function MindMapPage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLSelectElement>(null);
  const relRef = useRef<HTMLSelectElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const infoRef = useRef<HTMLParagraphElement>(null);
  const focusBtnRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const zoomOutRef = useRef<HTMLOutputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fsBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!, stage = stageRef.current!, ctx = canvas.getContext("2d")!;
    const tooltip = tooltipRef.current!, results = resultsRef.current!, detail = detailRef.current!;
    let w = 1, h = 1, dpr = 1, scale = 1, tx = 0, ty = 0, baseScale = 1;
    let selected: GNode | null = null, hovered: GNode | null = null, focused = false, queued = false;
    let hitRegions: [GNode, number, number, number][] = [];
    let drag: { x: number; y: number; tx: number; ty: number; n: GNode | null; moved: boolean; id: number; nx?: number; ny?: number } | null = null;
    let pinch: { x: number; y: number; d: number } | null = null;
    const activePointers = new Map<number, { x: number; y: number }>();
    const ct = canvasTheme();

    const requested = (n: GNode) => {
      const mark = markRef.current?.value || "";
      return !mark || (mark.includes("、") ? n.mark === mark : n.mark.includes(mark));
    };
    const edgeAllowed = (e: GEdge) => {
      const mode = relRef.current?.value || "";
      return !mode || (mode === "non-hierarchy" ? !e.hier : e.t === mode);
    };
    const relatives = (n: GNode) => new Set([n, ...adjacent.get(n)!.filter(edgeAllowed).map((e) => (e.a === n ? e.b : e.a))]);

    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; draw(); });
    };

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const highlight = hovered || selected;
      const near = highlight ? relatives(highlight) : null;
      const only = focused && selected ? relatives(selected) : null;
      const X = (n: GNode) => n.x * scale + tx, Y = (n: GNode) => n.y * scale + ty;
      const markOn = Boolean(markRef.current?.value);
      hitRegions = [];
      for (const e of edges) {
        if (!edgeAllowed(e) || (only && (!only.has(e.a) || !only.has(e.b) || (e.a !== selected && e.b !== selected)))) continue;
        const bright = !!(highlight && (e.a === highlight || e.b === highlight));
        const dim = markOn && !requested(e.a) && !requested(e.b);
        const ax = X(e.a), ay = Y(e.a), bx = X(e.b), by = Y(e.b);
        const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
        const endR = Math.max(3, e.b.r * scale) + 2;
        const bend = e.hier ? 0 : Math.min(26, len * 0.11);
        const ex = bx - (dx / len) * endR, ey = by - (dy / len) * endR;
        const cx = (ax + ex) / 2 - (dy / len) * bend, cy = (ay + ey) / 2 + (dx / len) * bend;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(cx, cy, ex, ey);
        ctx.strokeStyle = bright ? "#2563eb" : e.hier ? ct.edge : ct.edgeFaint;
        ctx.globalAlpha = bright ? 0.95 : dim ? 0.05 : near ? (near.has(e.a) && near.has(e.b) ? 0.5 : 0.14) : e.hier ? 0.55 : 0.4;
        ctx.lineWidth = bright ? 1.8 : 0.9;
        ctx.setLineDash(e.hier ? [] : [4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        if (e.t !== "包含" && (bright || scale / baseScale > 1.9) && !dim) {
          const angle = Math.atan2(ey - cy, ex - cx), r = bright ? 6 : 4;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - r * Math.cos(angle - 0.48), ey - r * Math.sin(angle - 0.48));
          ctx.lineTo(ex - r * Math.cos(angle + 0.48), ey - r * Math.sin(angle + 0.48));
          ctx.closePath();
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fill();
        }
      }
      const labels: { n: GNode; px: number; py: number; text: string; priority: number; alpha: number }[] = [];
      for (const n of nodes) {
        if (only && !only.has(n)) continue;
        const px = X(n), py = Y(n), r = Math.max(n.level < 4 ? 4 : 3, n.r * Math.min(scale, 1.65));
        if (px < -140 || px > w + 140 || py < -55 || py > h + 55) continue;
        const current = n === selected || n === hovered;
        const dim = !requested(n) && !current;
        ctx.globalAlpha = current ? 1 : dim ? (n.level < 4 ? 0.35 : 0.14) : near && !near.has(n) ? 0.22 : 1;
        if (current || MARK_COLORS[n.mark]) {
          ctx.beginPath();
          ctx.arc(px, py, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = current ? "#2563eb" : MARK_COLORS[n.mark]!;
          ctx.lineWidth = current ? 2 : 1;
          ctx.stroke();
        }
        ctx.fillStyle = n.color;
        ctx.beginPath();
        if (n.level < 4) {
          ctx.moveTo(px, py - r); ctx.lineTo(px + r, py); ctx.lineTo(px, py + r); ctx.lineTo(px - r, py);
          ctx.closePath();
        } else ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        hitRegions.push([n, px, py, r + 6]);
        if (current || (!dim && (n.level <= 3 || scale / baseScale > 1.25 || (near && near.has(n)) || n.mark.includes("难点")))) {
          const priority = current ? 0 : n.level + 1;
          const text = current ? n.name : short(n.name, n.level <= 2 ? 13 : scale / baseScale > 2.5 ? 17 : 11);
          labels.push({ n, px, py: py + r + 4, text, priority, alpha: ctx.globalAlpha });
        }
      }
      const occupied: [number, number, number, number][] = [];
      for (const l of labels.sort((a, b) => a.priority - b.priority)) {
        const size = l.priority === 0 ? 13 : l.n.level < 3 ? 12 : 11;
        ctx.font = (l.n.level < 3 ? "600 " : "") + size + 'px "PingFang SC","Microsoft YaHei",system-ui, sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const half = ctx.measureText(l.text).width / 2 + 3;
        const bounds: [number, number, number, number] = [l.px - half, l.py - 2, l.px + half, l.py + size + 3];
        if (l.priority > 0 && occupied.some(([a, b, c, d]) => bounds[0] < c && bounds[2] > a && bounds[1] < d && bounds[3] > b)) continue;
        occupied.push(bounds);
        ctx.globalAlpha = l.alpha;
        ctx.strokeStyle = ct.halo;
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.strokeText(l.text, l.px, l.py);
        ctx.fillStyle = ct.text;
        ctx.fillText(l.text, l.px, l.py);
      }
      ctx.globalAlpha = 1;
      if (zoomOutRef.current) zoomOutRef.current.value = Math.round((100 * scale) / baseScale) + "%";
    }

    function fit() {
      const visible = focused && selected ? [...relatives(selected)] : nodes;
      const xs = visible.map((n) => n.x), ys = visible.map((n) => n.y);
      const l = Math.min(...xs), r = Math.max(...xs), t = Math.min(...ys), b = Math.max(...ys);
      scale = Math.max(0.03, Math.min(1.6, (w - 54) / Math.max(150, r - l), (h - 100) / Math.max(150, b - t)));
      if (!focused) baseScale = scale;
      tx = w / 2 - ((l + r) * scale) / 2;
      ty = h / 2 - ((t + b) * scale) / 2;
      schedule();
    }
    function resize() {
      const oldW = w, oldH = h;
      w = stage.clientWidth; h = stage.clientHeight;
      dpr = Math.min(devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (oldW === 1 || (!selected && !drag)) fit();
      else { tx += (w - oldW) / 2; ty += (h - oldH) / 2; schedule(); }
    }
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    const zoom = (mult: number, x = w / 2, y = h / 2) => {
      const next = clamp(scale * mult, 0.03, 4.4);
      tx = x - ((x - tx) * next) / scale;
      ty = y - ((y - ty) * next) / scale;
      scale = next;
      schedule();
    };
    const center = (n: GNode) => {
      scale = Math.max(scale, Math.min(1.15, baseScale * 2.05));
      tx = w / 2 - n.x * scale;
      ty = h / 2 - n.y * scale;
      schedule();
    };
    const counts = () => {
      if (countRef.current)
        countRef.current.textContent =
          `${nodes.length} 个节点 · ${edges.filter(edgeAllowed).length} 条关系` + (markRef.current?.value ? ` · 匹配 ${nodes.filter(requested).length} 个` : "");
    };
    function renderDetails() {
      detail!.hidden = !selected;
      if (!selected) return;
      if (titleRef.current) titleRef.current.textContent = selected.name;
      if (infoRef.current)
        infoRef.current.textContent =
          [KIND_LABEL[selected.type] ?? selected.type, selected.group, selected.mark, selected.id].filter(Boolean).join(" · ");
      if (focusBtnRef.current) focusBtnRef.current.textContent = focused ? "恢复全图节点" : "聚焦直接关联";
      if (linksRef.current) {
        linksRef.current.replaceChildren();
        const rel = adjacent.get(selected)!.filter(edgeAllowed);
        for (const e of rel) {
          const other = e.a === selected ? e.b : e.a;
          const b = document.createElement("button");
          b.className = "flex w-full items-start gap-1.5 rounded-lg border border-slate-900/10 bg-surface px-2.5 py-1.5 text-left text-[13px] text-slate-700 transition-colors hover:bg-slate-50";
          const tag = document.createElement("span");
          tag.className = "shrink-0 rounded bg-slate-900/6 px-1.5 text-[11px] leading-5 text-slate-500";
          tag.textContent = (e.a === selected ? "→ " : "← ") + e.t;
          b.append(tag, document.createTextNode(other.name + (other.mark ? "（" + other.mark + "）" : "")));
          b.addEventListener("click", () => select(other, true));
          linksRef.current!.append(b);
        }
        if (!rel.length) {
          const p = document.createElement("p");
          p.className = "text-xs text-slate-400";
          p.textContent = "当前筛选下没有直接关系。";
          linksRef.current!.append(p);
        }
      }
    }
    function select(n: GNode | null, go = false) {
      selected = n;
      hovered = null;
      tooltip.hidden = true;
      if (!n) focused = false;
      renderDetails();
      if (n && go) { if (focused) fit(); else center(n); }
      schedule();
    }
    const local = (e: PointerEvent | MouseEvent | WheelEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const hit = (p: { x: number; y: number }) => {
      let min = Infinity, result: GNode | null = null;
      for (const [n, x, y, r] of hitRegions) {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d <= r && d < min) { min = d; result = n; }
      }
      return result;
    };

    const onWheel = (e: WheelEvent) => { e.preventDefault(); const p = local(e); zoom(Math.exp(-e.deltaY * 0.0013), p.x, p.y); };
    const pinchState = () => {
      const [a, b] = [...activePointers.values()];
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) };
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const p = local(e);
      activePointers.set(e.pointerId, p);
      canvas.setPointerCapture(e.pointerId);
      if (activePointers.size === 2) { pinch = pinchState(); drag = null; return; }
      if (activePointers.size !== 1) return;
      const n = hit(p);
      drag = { x: p.x, y: p.y, tx, ty, n, moved: false, id: e.pointerId };
      if (n) { drag.nx = n.x; drag.ny = n.y; }
      canvas.style.cursor = "grabbing";
      tooltip.hidden = true;
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (activePointers.has(e.pointerId)) activePointers.set(e.pointerId, p);
      if (pinch && activePointers.size >= 2) {
        const now = pinchState();
        tx += now.x - pinch.x; ty += now.y - pinch.y;
        if (pinch.d > 0) zoom(now.d / pinch.d, now.x, now.y);
        pinch = now;
        return;
      }
      if (drag && drag.id === e.pointerId) {
        const dx = p.x - drag.x, dy = p.y - drag.y;
        drag.moved ||= Math.hypot(dx, dy) > 5;
        if (!drag.moved) return;
        if (drag.n && drag.nx != null && drag.ny != null) { drag.n.x = drag.nx + dx / scale; drag.n.y = drag.ny + dy / scale; }
        else { tx = drag.tx + dx; ty = drag.ty + dy; }
        schedule();
        return;
      }
      if (activePointers.size) return;
      const n = hit(p);
      if (n !== hovered) { hovered = n; schedule(); }
      tooltip.hidden = !n;
      if (n) {
        tooltip.textContent = [n.name, n.mark].filter(Boolean).join(" · ") + `（${n.group}）`;
        tooltip.style.left = Math.max(0, Math.min(w - tooltip.offsetWidth - 5, p.x + 12)) + "px";
        tooltip.style.top = Math.max(0, Math.min(h - tooltip.offsetHeight - 5, p.y + 13)) + "px";
      }
    };
    const release = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
      if (activePointers.size < 2) pinch = null;
      if (drag?.id === e.pointerId) {
        if (e.type === "pointerup" && !drag.moved) select(drag.n);
        drag = null;
      }
      if (!activePointers.size) canvas.style.cursor = "grab";
    };
    const onLeave = () => { hovered = null; tooltip.hidden = true; schedule(); };
    const onDbl = (e: MouseEvent) => { const n = hit(local(e)); if (n) select(n, true); };
    const onKey = (e: KeyboardEvent) => {
      const shifts: Record<string, [number, number]> = { ArrowLeft: [34, 0], ArrowRight: [-34, 0], ArrowUp: [0, 34], ArrowDown: [0, -34] };
      if (shifts[e.key]) { const [dx, dy] = shifts[e.key]; tx += dx; ty += dy; schedule(); }
      else if (e.key === "+" || e.key === "=") zoom(1.25);
      else if (e.key === "-") zoom(0.8);
      else return;
      e.preventDefault();
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("dblclick", onDbl);
    canvas.addEventListener("keydown", onKey);

    // 工具条
    const onFilterChange = () => { counts(); renderDetails(); schedule(); };
    markRef.current?.addEventListener("change", onFilterChange);
    relRef.current?.addEventListener("change", onFilterChange);

    // 搜索
    let matches: GNode[] = [];
    const lookup = () => {
      const q = (searchRef.current?.value ?? "").trim().toLocaleLowerCase();
      results.replaceChildren();
      matches = q
        ? nodes
            .filter((n) => [n.name, n.id].some((s) => s.toLocaleLowerCase().includes(q)))
            .sort((a, b) => Number(b.name.toLocaleLowerCase().startsWith(q)) - Number(a.name.toLocaleLowerCase().startsWith(q)))
        : [];
      results.hidden = !q;
      for (const n of matches) {
        const b = document.createElement("button");
        b.className = "block w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] text-slate-700 transition-colors hover:bg-slate-100";
        b.textContent = `${n.name} · ${n.group}`;
        b.onclick = () => goTo(n);
        results.append(b);
      }
      if (q && !matches.length) {
        const p = document.createElement("p");
        p.className = "px-2.5 py-2 text-xs text-slate-400";
        p.textContent = "未找到匹配节点";
        results.append(p);
      }
    };
    const goTo = (n: GNode) => {
      if (searchRef.current) searchRef.current.value = n.name;
      results.hidden = true;
      select(n);
      requestAnimationFrame(() => { if (focused) fit(); else center(n); });
    };
    const onSearchInput = () => lookup();
    const onSearchFocus = () => lookup();
    const onSearchKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && matches.length) { e.preventDefault(); goTo(matches[0]); }
      if (e.key === "Escape") results.hidden = true;
    };
    searchRef.current?.addEventListener("input", onSearchInput);
    searchRef.current?.addEventListener("focus", onSearchFocus);
    searchRef.current?.addEventListener("keydown", onSearchKey);
    const onDocDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-search]")) results.hidden = true;
    };
    document.addEventListener("pointerdown", onDocDown);

    // 按钮
    const fitBtn = () => { select(null); requestAnimationFrame(fit); };
    const onFsChange = () => {
      if (fsBtnRef.current) fsBtnRef.current.textContent = document.fullscreenElement ? "退出全屏" : "全屏";
    };
    const fsToggle = async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await wrapRef.current?.requestFullscreen();
      } catch { /* ignore */ }
    };
    (wrapRef.current!).addEventListener("fullscreenchange", onFsChange);
    document.getElementById("mm-fit")?.addEventListener("click", fitBtn);
    document.getElementById("mm-fs")?.addEventListener("click", () => void fsToggle());
    document.getElementById("mm-plus")?.addEventListener("click", () => zoom(1.25));
    document.getElementById("mm-minus")?.addEventListener("click", () => zoom(0.8));
    document.getElementById("mm-close")?.addEventListener("click", () => { const was = focused; select(null); if (was) fit(); });
    document.getElementById("mm-focus")?.addEventListener("click", () => {
      if (!selected) return;
      focused = !focused;
      renderDetails();
      fit();
    });

    counts();
    resize();

    return () => {
      ro.disconnect();
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", release);
      canvas.removeEventListener("pointercancel", release);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("dblclick", onDbl);
      canvas.removeEventListener("keydown", onKey);
      markRef.current?.removeEventListener("change", onFilterChange);
      relRef.current?.removeEventListener("change", onFilterChange);
      searchRef.current?.removeEventListener("input", onSearchInput);
      searchRef.current?.removeEventListener("focus", onSearchFocus);
      searchRef.current?.removeEventListener("keydown", onSearchKey);
      document.removeEventListener("pointerdown", onDocDown);
      wrapRef.current?.removeEventListener("fullscreenchange", onFsChange);
      document.getElementById("mm-fit")?.removeEventListener("click", fitBtn);
    };
  }, []);

  const selCls =
    "rounded-lg border border-slate-900/15 bg-surface px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500/60";

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle
        icon={<IconIdea className="h-6 w-6" />}
        title="课程知识图谱"
        sub="拖动画布 · 滚轮缩放 · 单击选中 · 双击聚焦 · 节点可直接拖拽"
        tone="violet"
        right={<span ref={countRef} className="text-sm text-slate-500" />}
      />

      <div ref={wrapRef} className="flex min-h-0 flex-col rounded-2xl border border-slate-900/8 bg-surface shadow-[0_10px_34px_-16px_rgba(15,23,42,0.22)]">
        {/* 工具条 */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-900/8 px-4 py-3">
          <div data-search className="relative min-w-[240px] flex-1 max-w-md">
            <input
              ref={searchRef}
              type="search"
              placeholder="搜索知识点、教案或节点…"
              className={`${selCls} w-full`}
              autoComplete="off"
            />
            <div
              ref={resultsRef}
              hidden
              className="absolute top-full left-0 right-0 z-20 max-h-64 overflow-auto rounded-xl border border-slate-900/10 bg-surface p-1.5 shadow-xl"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            教学属性
            <select ref={markRef} className={selCls} defaultValue="">
              <option value="">全部</option>
              <option>重点</option>
              <option>难点</option>
              <option>重点、难点</option>
              <option>一般</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            关系
            <select ref={relRef} className={selCls} defaultValue="">
              <option value="">全部</option>
              <option value="non-hierarchy">知识关联</option>
            </select>
          </label>
          <button id="mm-fit" className={`${selCls} hover:bg-slate-50`}>查看全图</button>
          <button ref={fsBtnRef} id="mm-fs" className={`${selCls} hover:bg-slate-50`}>全屏</button>
        </div>

        <div className="flex min-h-0">
          {/* 画布 */}
          <div ref={stageRef} className="relative h-[calc(100vh-360px)] min-h-[520px] min-w-0 flex-1">
            <canvas ref={canvasRef} tabIndex={0} className="block h-full w-full cursor-grab touch-none outline-none" />
            <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl border border-slate-900/10 bg-surface/90 px-3 py-2 text-xs text-slate-500 shadow-sm">
              <span><b className="mr-1 font-medium text-slate-700">◆</b>课程 / 项目 / 任务 / 模块</span>
              <span><b className="mr-1 font-medium text-slate-700">●</b>知识点</span>
              <span><span className="mr-1 inline-block w-5 border-t border-slate-400 align-middle" />层级</span>
              <span><span className="mr-1 inline-block w-5 border-t border-dashed border-slate-400 align-middle" />知识关联</span>
              <span><b className="font-semibold text-amber-600">◉</b> 重点</span>
              <span><b className="font-semibold text-fuchsia-600">◉</b> 难点</span>
            </div>
            <div ref={tooltipRef} hidden className="pointer-events-none absolute z-10 max-w-[280px] rounded-lg border border-slate-900/12 bg-surface px-2.5 py-1.5 text-[13px] text-slate-800 shadow-lg" />
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
              <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-slate-900/10 bg-surface/95 p-1 shadow-lg">
                <button id="mm-minus" className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100">−</button>
                <output ref={zoomOutRef} className="min-w-12 text-center text-xs text-slate-500 tabular-nums">100%</output>
                <button id="mm-plus" className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100">＋</button>
              </div>
              <div className="rounded-lg bg-surface/90 px-2.5 py-1.5 text-xs text-slate-500 shadow-sm">拖动平移 · 滚轮缩放 · 悬停查看 · 双击聚焦</div>
            </div>
          </div>

          {/* 详情侧栏 */}
          <div ref={detailRef} hidden className="w-80 shrink-0 overflow-auto border-l border-slate-900/8 bg-slate-50/60 px-4 py-4 max-[860px]:hidden">
            <div className="flex items-start justify-between gap-2">
              <h3 ref={titleRef} className="text-[15px] leading-snug font-semibold text-slate-900" />
              <button id="mm-close" className="shrink-0 rounded-md px-2 py-0.5 text-sm text-slate-400 hover:bg-slate-200/60 hover:text-slate-700">✕</button>
            </div>
            <p ref={infoRef} className="mt-1.5 mb-3 text-xs leading-relaxed text-slate-400 break-all" />
            <button id="mm-focus" ref={focusBtnRef} className="mb-3 w-full rounded-lg border border-blue-500/30 bg-blue-500/8 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-500/15" />
            <div ref={linksRef} className="grid gap-1.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
