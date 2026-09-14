import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../../lib/api";
import { useStudent } from "../../lib/auth";
import { IconCpu } from "../../components/icons";
import { Card } from "../../components/ui";

interface Msg {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  streaming?: boolean;
  error?: boolean;
}

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
      content: `你好${student ? "，" + student.name : ""}！我是《信息采集技术》课程 AI 助学助手，可解答 Python 数据采集、传感器、爬虫、数据清洗融合、可视化与数据合规等问题。`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    const history: Msg[] = [...msgs, { role: "user", content: q }, { role: "assistant", content: "", reasoning: "", streaming: true }];
    setMsgs(history);

    const patch = (fn: (m: Msg) => Msg) =>
      setMsgs((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        next[next.length - 1] = fn(last);
        return next;
      });

    await api.aiChatStream(
      history.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      (e) => {
        if (e.type === "reasoning") patch((m) => ({ ...m, reasoning: (m.reasoning || "") + e.text }));
        else if (e.type === "content") patch((m) => ({ ...m, content: m.content + e.text }));
        else if (e.type === "error") patch((m) => ({ ...m, error: true, content: m.content || `（出错了：${e.text}）` }));
        else if (e.type === "done") patch((m) => ({ ...m, streaming: false }));
      }
    );
    setBusy(false);
  };

  return (
    <div className="animate-rise flex h-[calc(100vh-190px)] flex-col">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
          <IconCpu className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-white">AI 课程问答</h2>
          <p className="text-sm text-brand-200/60">流式作答 · 展示思考过程 · 阿里通义千问</p>
        </div>
      </div>

      <Card className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "user" ? (
              <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-brand-500 px-4 py-2.5 text-sm leading-relaxed text-ink-900">
                {m.content}
              </div>
            ) : (
              <div className="max-w-[88%] space-y-2">
                {m.reasoning ? (
                  <details open={m.streaming && !m.content} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <summary className="cursor-pointer select-none text-xs font-medium text-brand-200/70">
                      💭 思考过程{m.streaming && !m.content ? "（进行中…）" : ""}
                    </summary>
                    <div className="mt-2 max-h-52 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-brand-200/60 scrollbar-thin">
                      {m.reasoning}
                    </div>
                  </details>
                ) : null}

                <div
                  className={`md rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.error ? "border border-rose-400/30 bg-rose-500/10 text-rose-100" : "border border-white/10 bg-white/5 text-brand-50"
                  }`}
                >
                  {m.content ? (
                    <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                  ) : m.streaming ? (
                    <span className="inline-flex items-center gap-2 text-brand-200/60">
                      <span className="h-2 w-2 animate-ping rounded-full bg-brand-400" />
                      正在思考…
                    </span>
                  ) : null}
                  {m.streaming && m.content ? <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-brand-300 align-middle" /> : null}
                </div>
              </div>
            )}
          </div>
        ))}
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
