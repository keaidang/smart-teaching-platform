import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStudent } from "../../lib/auth";
import { api } from "../../lib/api";
import type { Student } from "../../lib/types";
import { Avatar, Card, SectionTitle, Stat, Tag, type Tone } from "../../components/ui";
import {
  IconBook,
  IconChart,
  IconCpu,
  IconLock,
  IconUpload,
} from "../../components/icons";
import { PROJECTS, STUDENTS, GROUPS } from "../../lib/course";

const JOURNEY: { step: string; title: string; desc: string; tone: Tone; icon: typeof IconBook }[] = [
  { step: "01", title: "课前预习", desc: "研读任务工单 + 预习检测，带着问题进课堂", tone: "cyan", icon: IconBook },
  { step: "02", title: "提交作业", desc: "对照验收标准截图上传，作品直达课程服务器", tone: "amber", icon: IconUpload },
  { step: "03", title: "课后习题", desc: "知识点在线问答，巩固质量阈值与合规意识", tone: "emerald", icon: IconChart },
  { step: "04", title: "AI 助学", desc: "课程 AI 助手流式答疑，随时突破学习难点", tone: "violet", icon: IconCpu },
];

export default function StudentLogin() {
  const { setStudent } = useStudent();
  const nav = useNavigate();
  const [sid, setSid] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState<Student[]>([]);

  useEffect(() => {
    api.listStudents().then(setList).catch(() => setList([]));
  }, []);

  // 登录走服务端：校验名单并签发会话令牌（写接口均需携带）
  const doLogin = async (id: string, nm: string) => {
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      const s = await api.studentLogin(id.trim().toUpperCase(), nm.trim());
      setStudent(s);
      nav("/student/preview");
    } catch (e) {
      setErr(String((e as Error).message || e) || "登录失败，请重试");
    } finally {
      setBusy(false);
    }
  };

  const taskCount = PROJECTS.reduce((a, p) => a + p.tasks.length, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="hero-mesh tone-blue animate-rise relative mb-6 overflow-hidden rounded-2xl border border-slate-900/10 px-7 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <h1 className="grad-text text-3xl font-extrabold tracking-wide">学生登录</h1>
            <Tag tone="violet">2465 人工智能</Tag>
          </div>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
            数智社区 · 《人工智能数据服务》学习平台 —— 登录后选择课堂任务，开启你的数据之旅。
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Stat value={PROJECTS.length} label="实战项目" tone="cyan" />
            <Stat value={taskCount} label="任务工单" tone="blue" />
            <Stat value={STUDENTS.length} label="在班学生" tone="rose" />
            <Stat value={GROUPS.length} label="学习小组" tone="emerald" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card tone="blue" className="animate-rise rise-1 p-7">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-slate-600">学号</label>
              <input
                value={sid}
                onChange={(e) => {
                  setSid(e.target.value);
                  setErr("");
                }}
                placeholder="例如 20241216501"
                className="w-full rounded-xl border border-slate-900/10 bg-surface/85 px-4 py-3 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-400/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-600">姓名</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErr("");
                }}
                onKeyDown={(e) => e.key === "Enter" && doLogin(sid, name)}
                placeholder="例如 孙天一"
                className="w-full rounded-xl border border-slate-900/10 bg-surface/85 px-4 py-3 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-400/60"
              />
            </div>
          </div>
          {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}

          <button
            onClick={() => doLogin(sid, name)}
            disabled={busy}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "登录中…" : "登录系统，出发！"}
          </button>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <IconLock className="h-3.5 w-3.5" />
            学号与姓名需与班级名单一致，登录由服务端校验并签发会话令牌
          </p>

          <div className="mt-6 border-t border-slate-900/5 pt-5">
            <div className="mb-3 text-xs text-slate-500">
              演示：点击任一同学快速登录
            </div>
            <div className="grid max-h-52 grid-cols-3 gap-2 overflow-y-auto scrollbar-thin pr-1">
              {list.map((s) => (
                <button
                  key={s.id}
                  onClick={() => doLogin(s.id, s.name)}
                  className="flex items-center gap-2 rounded-lg border border-slate-900/5 bg-slate-900/5 px-2 py-2 text-left transition-colors hover:border-blue-400/40 hover:bg-blue-500/10"
                >
                  <Avatar name={s.name} color={s.avatarColor} size={28} />
                  <div className="min-w-0">
                    <div className="truncate text-xs text-slate-900">{s.name}</div>
                    <div className="text-[10px] text-slate-500">{s.id}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="animate-rise rise-2 flex flex-col p-7">
          <SectionTitle
            icon={<IconBook className="h-6 w-6" />}
            title="学习旅程四步"
            sub="登录后按这条路径完成今天的课堂任务"
            tone="blue"
          />
          <div className="flex flex-1 flex-col gap-4">
            {JOURNEY.map((j) => (
              <div
                key={j.step}
                className={`tone-${j.tone} flex flex-1 items-center gap-4 rounded-xl border bg-slate-900/[0.03] px-5 py-3 transition-colors hover:bg-slate-900/[0.06]`}
                style={{ borderColor: "var(--tone-line)" }}
              >
                <span className="icon-chip h-11 w-11 shrink-0 rounded-xl">
                  <j.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="grad-text text-lg font-extrabold">{j.step}</span>
                    <span className="text-base font-semibold text-slate-900">{j.title}</span>
                  </div>
                  <div className="mt-0.5 text-sm leading-relaxed text-slate-500">{j.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="divider-grad mt-5" />
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            课堂以小组为单位协作（{GROUPS.length} 组 × 4 人），预习、作业与习题数据实时同步讲台大屏，AI 助手全程陪你答疑。
          </p>
        </Card>
      </div>

      <div className="mt-6 text-center">
        <Link to="/" className="text-sm text-slate-500 transition-colors hover:text-slate-600">
          ← 返回资源库首页
        </Link>
      </div>
    </div>
  );
}
