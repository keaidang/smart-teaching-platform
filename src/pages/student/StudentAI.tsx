import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import { useStudent } from "../../lib/auth";
import { IconCpu } from "../../components/icons";
import { Card } from "../../components/ui";

interface Msg { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "pyserial 怎么读取传感器数据？",
  "数据清洗时缺失值怎么处理？",
  "多源数据融合对齐的关键是什么？",
  "公共区域采集要注意哪些合规问题？",
];

export default function StudentAI() {
  const { student } = useStudent();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content: `你好${student ? "，" + student.name : ""}！我是《信息采集技术》课程 AI 助学助手，可以就 Python 数据采集、传感器、爬虫、数据清洗融合、可视化与数据合规等问题为你解答。想问点什么？`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await api.aiChat(next);
      setMsgs([...next, { role: "assistant", content: res.content }]);
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: `（出错了：${String((e as Error).message || e)}）` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-rise flex h-[calc(100vh-190px)] flex-col">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
          <IconCpu className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-white">AI 课程问答</h2>
          <p className="text-sm text-brand-200/60">基于课程介绍限定范围 · 阿里通义千问</p>
        </div>
      </div>

      <Card className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-brand-500 text-ink-900"
                  : "border border-white/10 bg-white/5 text-brand-50"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-brand-200/60">
              正在思考…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </Card>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={busy}
            className="rounded-full border border-brand-400/25 bg-brand-500/5 px-3 py-1.5 text-xs text-brand-100 transition-colors hover:bg-brand-500/15 disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="输入你的问题…"
          className="min-w-0 flex-1 rounded-xl border border-brand-400/25 bg-ink-900/50 px-4 py-3 text-white outline-none transition-colors placeholder:text-brand-200/40 focus:border-brand-400/60"
        />
        <button
          onClick={() => send(input)}
          disabled={busy || !input.trim()}
          className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-ink-900 transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-brand-200/40"
        >
          发送
        </button>
      </div>
    </div>
  );
}
