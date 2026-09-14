import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, type AdminStats } from "../../lib/api";
import { Card } from "../../components/ui";
import { IconGauge, IconTrophy, IconUpload, IconChart, IconUsers } from "../../components/icons";

const KEY_LS = "stp.adminKey";

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
      <div className="grid min-h-screen place-items-center px-6">
        <Card className="w-full max-w-sm p-8">
          <h1 className="text-glow text-center text-2xl font-bold tracking-widest text-brand-100">管理后台</h1>
          <p className="mt-2 text-center text-sm text-brand-200/60">请输入管理密钥</p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="管理密钥"
            className="mt-6 w-full rounded-xl border border-brand-400/25 bg-ink-900/50 px-4 py-3 text-white outline-none focus:border-brand-400/60"
          />
          {err && <p className="mt-3 text-sm text-rose-300">{err}</p>}
          <button onClick={login} className="mt-4 w-full rounded-xl bg-brand-500 py-3 font-semibold text-ink-900 hover:bg-brand-400">
            进入
          </button>
          <div className="mt-5 text-center">
            <Link to="/" className="text-sm text-brand-200/50 hover:text-brand-100">← 返回首页</Link>
          </div>
        </Card>
      </div>
    );
  }

  const cards = [
    { label: "学生名单", value: stats?.studentCount ?? "-", icon: IconUsers, color: "#22d3ee" },
    { label: "在线", value: stats?.online ?? "-", icon: IconGauge, color: "#34d399" },
    { label: "预习已交", value: stats?.previewDone ?? "-", icon: IconTrophy, color: "#a78bfa" },
    { label: "作业已交", value: stats?.homeworkSubmitted ?? "-", icon: IconUpload, color: "#fbbf24" },
    { label: "问答已交", value: stats?.exerciseDone ?? "-", icon: IconChart, color: "#f472b6" },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-glow text-2xl font-bold tracking-widest text-brand-100">管理后台</h1>
          <p className="mt-1 text-sm text-brand-200/60">数智社区 · 教学资源库</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load(key)} className="rounded-lg border border-brand-400/25 px-4 py-2 text-sm text-brand-100 hover:bg-brand-500/15">刷新</button>
          <button
            onClick={() => { sessionStorage.removeItem(KEY_LS); setKey(""); setStats(null); }}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-brand-200/70 hover:bg-white/10"
          >
            退出
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: `${c.color}1f`, color: c.color }}>
              <c.icon className="h-5 w-5" />
            </span>
            <div className="mt-3 text-2xl font-bold text-white">{c.value}</div>
            <div className="text-xs text-brand-200/60">{c.label}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold text-white">数据管理</h2>
        <p className="mt-1 text-sm text-brand-200/60">
          学生名单与题目为固定种子数据；答题/提交/在线记录可按需重置。
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-5">
            <div className="font-semibold text-amber-200">重置答题 / 提交记录（KV）</div>
            <p className="mt-1 text-sm text-brand-200/70">清空预习/作业/问答作答与在线心跳，<b className="text-white">保留</b>名单、题目与已传图片。</p>
            <button disabled={busy} onClick={() => { if (confirm("确定重置答题/提交记录？名单与图片保留。")) run(adminApi.resetSubmissions, "已重置答题/提交记录"); }}
              className="mt-4 w-full rounded-lg bg-amber-400 py-2.5 font-semibold text-ink-900 hover:bg-amber-300 disabled:opacity-50">重置记录</button>
          </div>
          <div className="rounded-xl border border-orange-400/25 bg-orange-400/5 p-5">
            <div className="font-semibold text-orange-200">清空作业图片（Blob）</div>
            <p className="mt-1 text-sm text-brand-200/70">删除 Blob 存储里所有学生上传的图片文件。</p>
            <button disabled={busy} onClick={() => { if (confirm("确定清空所有作业图片？")) run(adminApi.clearBlob, "已清空作业图片"); }}
              className="mt-4 w-full rounded-lg bg-orange-400 py-2.5 font-semibold text-ink-900 hover:bg-orange-300 disabled:opacity-50">清空图片</button>
          </div>
          <div className="rounded-xl border border-rose-400/25 bg-rose-400/5 p-5">
            <div className="font-semibold text-rose-200">全部重置（记录 + 图片）</div>
            <p className="mt-1 text-sm text-brand-200/70">清空答题记录与作业图片，<b className="text-white">保留</b>名单与题目。</p>
            <button disabled={busy} onClick={() => { if (confirm("确定重置全部记录与图片？名单与题目保留。")) run(adminApi.resetAll, "已全部重置"); }}
              className="mt-4 w-full rounded-lg bg-rose-400 py-2.5 font-semibold text-ink-900 hover:bg-rose-300 disabled:opacity-50">全部重置</button>
          </div>
          <div className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-400/5 p-5">
            <div className="font-semibold text-fuchsia-200">重新播种（名单 + 题目）</div>
            <p className="mt-1 text-sm text-brand-200/70">清空全部 KV 并按最新代码重写名单与题目，用于内容更新后刷新。</p>
            <button disabled={busy} onClick={() => { if (confirm("确定整体重播种？将清空全部并写入最新名单/题目。")) run(adminApi.reseed, "已重新播种"); }}
              className="mt-4 w-full rounded-lg bg-fuchsia-400 py-2.5 font-semibold text-ink-900 hover:bg-fuchsia-300 disabled:opacity-50">重新播种</button>
          </div>
        </div>
        {busy && <p className="mt-4 text-sm text-brand-200/60">处理中…</p>}
        {msg && <p className="mt-4 text-sm text-emerald-300">✓ {msg}</p>}
        {err && <p className="mt-4 text-sm text-rose-300">✕ {err}</p>}
      </Card>

      <div className="mt-6 flex gap-4 text-sm">
        <Link to="/" className="text-brand-200/60 hover:text-brand-100">← 资源库首页</Link>
        <Link to="/class" className="text-brand-200/60 hover:text-brand-100">后台大屏 →</Link>
        <Link to="/student" className="text-brand-200/60 hover:text-brand-100">学生端 →</Link>
      </div>
    </div>
  );
}
