import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../../lib/api";
import { useStudent } from "../../lib/auth";
import { IconCpu } from "../../components/icons";
import { Card, Tag } from "../../components/ui";

interface Msg {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  streaming?: boolean;
  error?: boolean;
}

// 推荐提问示例：点击填入输入框，可编辑后再发送（覆盖课程核心知识点与工单实操）
const SUGGESTIONS = [
  "pyserial 怎么读取传感器数据？",
  "数据清洗时缺失值怎么处理？",
  "多源数据融合对齐的关键是什么？",
  "公共区域采集要注意哪些合规问题？",
  "K230 CanMV 如何采集多姿态人脸样本？",
  "metadata.csv 的 8 个字段分别是什么？",
];

export default function StudentAI() {
  const { student } = useStudent();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content: `你好${student ? "，" + student.name : ""}！我是《人工智能数据服务》课程 AI 助学助手，可解答 Python 数据采集、传感器、爬虫、数据清洗融合、可视化与数据合规等问题。`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const fillSuggestion = (s: string) => {
    setInput(s);
    inputRef.current?.focus();
  };

  return (
    <div className="animate-rise flex h-[calc(100vh-190px)] flex-col">
      <Card tone="violet" className="mb-3 flex shrink-0 flex-wrap items-center gap-3 px-5 py-3.5">
        <span className="tone-violet icon-chip h-11 w-11 shrink-0 rounded-xl">
          <IconCpu className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h2 className="grad-text text-2xl font-extrabold tracking-wide">AI 助学问答</h2>
          <p className="text-sm text-slate-500">流式作答 · 展示思考过程 · 阿里通义千问</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Tag tone="violet">课程专属</Tag>
          <Tag tone="cyan">数据合规</Tag>
        </div>
      </Card>

      <Card className="scrollbar-thin min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "user" ? (
              <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 px-4 py-2.5 text-sm leading-relaxed text-white">
                {m.content}
              </div>
            ) : (
              <div className="max-w-[88%] space-y-2">
                {m.reasoning ? (
                  <details open={m.streaming && !m.content} className="rounded-xl border border-violet-400/20 bg-violet-400/[0.06] px-3 py-2">
                    <summary className="cursor-pointer select-none text-xs font-medium text-violet-600/80">
                      💭 思考过程{m.streaming && !m.content ? "（进行中…）" : ""}
                    </summary>
                    <div className="mt-2 max-h-52 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-500 scrollbar-thin">
                      {m.reasoning}
                    </div>
                  </details>
                ) : null}

                <div
                  className={`md rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.error ? "border border-rose-400/30 bg-rose-500/10 text-rose-600" : "border border-slate-900/10 bg-slate-900/5 text-slate-800"
                  }`}
                >
                  {m.content ? (
                    <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                  ) : m.streaming ? (
                    <span className="inline-flex items-center gap-2 text-slate-500">
                      <span className="h-2 w-2 animate-ping rounded-full bg-violet-400" />
                      正在思考…
                    </span>
                  ) : null}
                  {m.streaming && m.content ? <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-violet-300 align-middle" /> : null}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </Card>

      <div className="mt-3 shrink-0">
        <div className="mb-1.5 text-xs text-slate-500">推荐提问 · 点击填入输入框，可编辑后发送</div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => fillSuggestion(s)}
              disabled={busy}
              className="tone-violet chip-tone rounded-full px-3 py-1.5 text-xs transition-all hover:brightness-125 disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex shrink-0 gap-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="输入你的问题…"
          className="min-w-0 flex-1 rounded-xl border border-slate-900/10 bg-surface/85 px-4 py-3 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-500 focus:border-violet-400/60"
        />
        <button
          onClick={() => send(input)}
          disabled={busy || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-3 font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-slate-500"
        >
          发送
        </button>
      </div>
    </div>
  );
}
