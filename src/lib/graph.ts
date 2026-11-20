// 课程知识图谱共享模型：节点/关系/径向布局（图谱页与学情分析共用）
import graphData from "./graph-data.json";

export type RawNode = [id: string, name: string, type: string, mark: string];
export type RawEdge = [a: string, rel: string, b: string];

export interface GNode {
  id: string; name: string; type: string; mark: string;
  lesson: number; project: number; group: string; level: number;
  color: string; r: number;
  x: number; y: number; ax: number; ay: number; vx: number; vy: number;
}
export interface GEdge { a: GNode; b: GNode; t: string; hier: boolean }

export const PALETTE = ["#e8a87c", "#7fb3e8", "#d9c06d", "#7ec89a", "#a48fd9", "#df8fb5", "#6cc2b8", "#d9a878"];
export const PROJECT_COLORS = ["#7fa8d9", "#85c08e", "#a48fd9", "#df9f7e"];
export const MARK_COLORS: Record<string, string> = { "重点": "#d97706", "难点": "#a21caf", "重点、难点": "#b45309" };

const rawNodes = graphData.nodes as unknown as RawNode[];
const rawEdges = graphData.edges as unknown as RawEdge[];

export const nodes: GNode[] = rawNodes.map(([id, name, type, mark]) => {
  const lesson = Number(id.match(/-L(\d+)-/)?.[1] || 0);
  const project = Number(id.match(/^AI-P(\d+)/)?.[1] || 0);
  const group = lesson ? `教案 ${lesson}` : project ? `项目 ${project}` : id === "AI-C-001" ? "课程" : "课程共用知识";
  const level = id === "AI-C-001" ? 0 : !lesson && project ? 1 : id.endsWith("-001") && lesson ? 2 : type === "模块" ? 3 : 4;
  return {
    id, name, type, mark, lesson, project, group, level,
    color: PALETTE[lesson - 1] || PROJECT_COLORS[project - 1] || "#8fb8c4",
    r: [17, 13, 12, 8, 5.3][level],
    x: 0, y: 0, ax: 0, ay: 0, vx: 0, vy: 0,
  };
});
export const nodeIndex = new Map(nodes.map((n) => [n.id, n]));
export const edges: GEdge[] = rawEdges
  .map(([a, t, b]) => {
    const na = nodeIndex.get(a), nb = nodeIndex.get(b);
    return na && nb ? { a: na, b: nb, t, hier: t === "包含" } : null;
  })
  .filter((e): e is GEdge => e !== null);
export const children = new Map<GNode, GNode[]>(nodes.map((n) => [n, []]));
export const adjacent = new Map<GNode, GEdge[]>(nodes.map((n) => [n, []]));
for (const e of edges) {
  if (e.hier) children.get(e.a)!.push(e.b);
  adjacent.get(e.a)!.push(e);
  adjacent.get(e.b)!.push(e);
}
export const root = nodeIndex.get("AI-C-001")!;
export const publicGroup = nodeIndex.get("AI-C-M01")!;

/* ===== 径向锚点布局 + 碰撞松弛 ===== */
(function layout() {
  const assign = (n: GNode, x: number, y: number) => Object.assign(n, { x, y, ax: x, ay: y, vx: 0, vy: 0 });
  assign(root, 0, 0);
  assign(publicGroup, -105, 50);
  const pubKids = children.get(publicGroup)!;
  pubKids.forEach((n, i) => {
    const a = (2 * Math.PI * i) / pubKids.length;
    assign(n, -20 + 168 * Math.cos(a), 160 * Math.sin(a));
  });
  for (let p = 1; p <= 4; p++) {
    const project = nodeIndex.get(`AI-P0${p}-001`)!;
    const phase = -Math.PI + Math.PI / 4 + (p - 1) * (Math.PI / 2);
    assign(project, 310 * Math.cos(phase), 250 * Math.sin(phase));
    children.get(project)!.forEach((lesson, j) => {
      const a = phase + (j ? 0.43 : -0.43);
      const x = 755 * Math.cos(a), y = 535 * Math.sin(a);
      assign(lesson, x, y);
      const modules = children.get(lesson)!;
      modules.forEach((module, k) => {
        const b = a + (k - (modules.length - 1) / 2) * 1.1;
        const mx = x + 105 * Math.cos(b), my = y + 105 * Math.sin(b);
        assign(module, mx, my);
        const leaves = children.get(module)!;
        leaves.forEach((n, i) => {
          const c = b + (i - (leaves.length - 1) / 2) * Math.min(0.42, 2.4 / Math.max(1, leaves.length - 1));
          const radius = 104 + (i % 2) * 40;
          assign(n, mx + radius * Math.cos(c), my + radius * Math.sin(c));
        });
      });
    });
  }
  for (let step = 0; step < 95; step++) {
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x || 0.0001, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        const spacing = a.mark || b.mark ? 75 : 68;
        if (d >= spacing) continue;
        const f = ((spacing - d) * 0.12) / d;
        a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
      }
    }
    for (const n of nodes) {
      if (n === root) continue;
      n.vx += (n.ax - n.x) * 0.032; n.vy += (n.ay - n.y) * 0.032;
      n.x += n.vx; n.y += n.vy; n.vx *= 0.43; n.vy *= 0.43;
    }
  }
})();

export const KIND_LABEL: Record<string, string> = { "课程": "课程", "项目": "项目", "教案/任务": "任务", "模块": "模块", "概念": "知识点" };
export const knowledgeNodes = nodes.filter((n) => n.level === 4);
export const short = (s: string, max: number) => (Array.from(s).length > max ? Array.from(s).slice(0, max - 1).join("") + "…" : s);