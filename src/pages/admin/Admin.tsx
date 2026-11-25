import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, type AdminStats } from "../../lib/api";
import { Card, SectionTitle, Tag, type Tone } from "../../components/ui";
import { ThemeToggle } from "../../components/ThemeToggle";
import { IconGauge, IconTrophy, IconUpload, IconChart, IconUsers, IconLock, IconShield, IconBook } from "../../components/icons";

const KEY_LS = "stp.adminKey";

const FEATURE_CARDS: { title: string; desc: string; icon: typeof IconGauge; tone: Tone }[] = [
  { title: "课堂数据总览", desc: "实时查看名单规模、在线心跳、预习/作业/习题提交量，配合教师大屏掌握课堂节奏。", icon: IconGauge, tone: "blue" },
  { title: "作答记录重置", desc: "按教学批次清空预习、作业与习题作答记录及在线心跳，名单、题目与已传图片不受影响。", icon: IconShield, tone: "amber" },
  { title: "存储与种子维护", desc: "清理 Blob 作业图片、整体重置或按最新代码重新播种名单与题目，用于内容更新后的环境刷新。", icon: IconBook, tone: "blue" },
];

export default function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_LS) || "");
  const [input, setInput] = useState(key);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async (k: string) => {
    setErr("");
    try {
      const s = await adminApi.stats(k);
      setStats(s);
    } catch (e) {
      setErr(String((e as Error).message || e));
      setStats(null);
    }
  }, []);

  useEffect(() => {
    if (key) load(key);
  }, [key, load]);

  const login = () => {
    const k = input.trim();
    if (!k) return;
    sessionStorage.setItem(KEY_LS, k);
    setKey(k);
  };

  const run = async (fn: (k: string) => Promise<unknown>, done: string) => {
    if (!key) return;
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      await fn(key);
      setMsg(done);
      await load(key);
    } catch (e) {
      setErr(String((e as Error).message || e));
    } finally {
      setBusy(false);
    }
  };

  // 未登录：密钥输入
  if (!key) {
    return (
      <div className="relative grid min-h-screen place-items-center px-6">
        <div className="absolute right-5 top-5">
          <ThemeToggle variant="chip" />
        </div>
        <Card tone="blue" className="w-full max-w-sm p-8">
          <div className="tone-blue icon-chip mx-auto h-14 w-14 rounded-2xl">
            <IconLock className="h-7 w-7" />
          </div>
          <h1 className="tone-blue grad-text mt-4 text-center text-2xl font-extrabold tracking-widest">管理后台</h1>
          <p className="mt-2 text-center text-sm text-slate-500">请输入管理密钥</p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="管理密钥"
            className="mt-6 w-full rounded-xl border border-blue-400/25 bg-surface/85 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-blue-400/60"
          />
          {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}
          <button onClick={login} className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:brightness-110">
            进入
          </button>
          <div className="mt-5 text-center">
            <Link to="/" className="text-sm text-slate-500 transition-colors hover:text-slate-700">← 返回首页</Link>
          </div>
        </Card>
      </div>
    );
  }

  const cards: { label: string; value: string | number; icon: typeof IconUsers; tone: Tone }[] = [
    { label: "学生名单", value: stats?.studentCount ?? "-", icon: IconUsers, tone: "blue" },
    { label: "在线", value: stats?.online ?? "-", icon: IconGauge, tone: "emerald" },
    { label: "预习已交", value: stats?.previewDone ?? "-", icon: IconTrophy, tone: "violet" },
    { label: "作业已交", value: stats?.homeworkSubmitted ?? "-", icon: IconUpload, tone: "amber" },
    { label: "问答已交", value: stats?.exerciseDone ?? "-", icon: IconChart, tone: "rose" },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <div className="hero-mesh mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-900/10 px-7 py-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="hero-title text-3xl font-extrabold tracking-widest">管理后台</h1>
            <Tag tone="blue">教师专用</Tag>
          </div>
          <p className="mt-1 text-sm text-slate-500">数智社区 · 教学资源库 · 数据与存储维护</p>
        </div>
        <div className="flex gap-2">
          <ThemeToggle variant="chip" />
          <button onClick={() => load(key)} className="rounded-lg border border-blue-400/30 px-4 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-400/10">刷新</button>
          <button
            onClick={() => { sessionStorage.removeItem(KEY_LS); setKey(""); setStats(null); }}
            className="rounded-lg border border-slate-900/15 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-900/10"
          >
            退出
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {cards.map((c, i) => (
          <Card key={c.label} tone={c.tone} className={`rise-${(i % 4) + 1} p-5`}>
            <span className="icon-chip h-10 w-10 rounded-lg">
              <c.icon className="h-5 w-5" />
            </span>
            <div className="grad-text mt-3 text-3xl font-extrabold tabular-nums">{c.value}</div>
            <div className="text-xs text-slate-500">{c.label}</div>
          </Card>
        ))}
      </div>

      {/* 管理功能说明 */}
      <div className="mt-8">
        <SectionTitle
          icon={<IconShield className="h-5 w-5" />}
          title="管理功能说明"
          sub="维护操作均即时生效，执行前请确认影响范围"
          tone="blue"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURE_CARDS.map((f) => (
            <Card key={f.title} tone={f.tone} hover className="p-6">
              <span className="icon-chip h-11 w-11 rounded-xl">
                <f.icon className="h-5 w-5" />
              </span>
              <div className="mt-4 text-lg font-semibold text-slate-900">{f.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card tone="amber" className="mt-8 p-6">
        <h2 className="text-lg font-semibold text-slate-900">数据管理</h2>
        <p className="mt-1 text-sm text-slate-500">
          学生名单与题目为固定种子数据；答题/提交/在线记录可按需重置。
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="tone-amber rounded-xl border bg-slate-900/[0.03] p-5" style={{ borderColor: "var(--tone-line)" }}>
            <div className="font-semibold" style={{ color: "var(--tone)" }}>重置答题 / 提交记录（KV）</div>
            <p className="mt-1 text-sm text-slate-500">清空预习/作业/问答作答与在线心跳，<b className="text-slate-900">保留</b>名单、题目与已传图片。</p>
            <button disabled={busy} onClick={() => { if (confirm("确定重置答题/提交记录？名单与图片保留。")) run(adminApi.resetSubmissions, "已重置答题/提交记录"); }}
              className="mt-4 w-full rounded-lg bg-amber-400 py-2.5 font-semibold text-ink-900 transition-colors hover:bg-amber-300 disabled:opacity-50">重置记录</button>
          </div>
          <div className="tone-orange rounded-xl border bg-slate-900/[0.03] p-5" style={{ borderColor: "var(--tone-line)" }}>
            <div className="font-semibold" style={{ color: "var(--tone)" }}>清空作业图片（Blob）</div>
            <p className="mt-1 text-sm text-slate-500">删除 Blob 存储里所有学生上传的图片文件。</p>
            <button disabled={busy} onClick={() => { if (confirm("确定清空所有作业图片？")) run(adminApi.clearBlob, "已清空作业图片"); }}
              className="mt-4 w-full rounded-lg bg-orange-400 py-2.5 font-semibold text-ink-900 transition-colors hover:bg-orange-300 disabled:opacity-50">清空图片</button>
          </div>
          <div className="tone-rose rounded-xl border bg-slate-900/[0.03] p-5" style={{ borderColor: "var(--tone-line)" }}>
            <div className="font-semibold" style={{ color: "var(--tone)" }}>全部重置（记录 + 图片）</div>
            <p className="mt-1 text-sm text-slate-500">清空答题记录与作业图片，<b className="text-slate-900">保留</b>名单与题目。</p>
            <button disabled={busy} onClick={() => { if (confirm("确定重置全部记录与图片？名单与题目保留。")) run(adminApi.resetAll, "已全部重置"); }}
              className="mt-4 w-full rounded-lg bg-rose-400 py-2.5 font-semibold text-ink-900 transition-colors hover:bg-rose-300 disabled:opacity-50">全部重置</button>
          </div>
          <div className="tone-violet rounded-xl border bg-slate-900/[0.03] p-5" style={{ borderColor: "var(--tone-line)" }}>
            <div className="font-semibold" style={{ color: "var(--tone)" }}>重新播种（名单 + 题目）</div>
            <p className="mt-1 text-sm text-slate-500">清空全部 KV 并按最新代码重写名单与题目，用于内容更新后刷新。</p>
            <button disabled={busy} onClick={() => { if (confirm("确定整体重播种？将清空全部并写入最新名单/题目。")) run(adminApi.reseed, "已重新播种"); }}
              className="mt-4 w-full rounded-lg bg-violet-400 py-2.5 font-semibold text-ink-900 transition-colors hover:bg-violet-300 disabled:opacity-50">重新播种</button>
          </div>
          <div className="tone-blue rounded-xl border bg-slate-900/[0.03] p-5" style={{ borderColor: "var(--tone-line)" }}>
            <div className="font-semibold" style={{ color: "var(--tone)" }}>清空打分（教师评价 + 小组打分）</div>
            <p className="mt-1 text-sm text-slate-500">删除全部教师评价与小组打分（教师/企业/AI 测评三类），名单、题目与作答记录保留。</p>
            <button disabled={busy} onClick={() => { if (confirm("确定清空全部打分数据？教师评价与小组打分将不可恢复。")) run(adminApi.clearEvals, "已清空打分数据"); }}
              className="mt-4 w-full rounded-lg bg-blue-400 py-2.5 font-semibold text-ink-900 transition-colors hover:bg-blue-300 disabled:opacity-50">清空打分</button>
          </div>
        </div>
        {busy && <p className="mt-4 text-sm text-slate-500">处理中…</p>}
        {msg && <p className="mt-4 text-sm text-emerald-600">✓ {msg}</p>}
        {err && <p className="mt-4 text-sm text-rose-600">✕ {err}</p>}
      </Card>

      <div className="mt-6 flex gap-4 text-sm">
        <Link to="/" className="text-slate-500 transition-colors hover:text-slate-700">← 资源库首页</Link>
        <Link to="/class" className="text-slate-500 transition-colors hover:text-slate-700">后台大屏 →</Link>
        <Link to="/student" className="text-slate-500 transition-colors hover:text-slate-700">学生端 →</Link>
      </div>
    </div>
  );
}
