import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, homeworkFileUrl } from "../../lib/api";
import { useStudent } from "../../lib/auth";
import type { Homework, HomeworkSubmission } from "../../lib/types";
import { isTaskHomework } from "../../lib/course";
import { IconCheck, IconClock, IconShield, IconUpload } from "../../components/icons";
import { Bar, Card, SectionTitle, Tag, TONE_HEX } from "../../components/ui";

function fmtSize(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

// 作业上传限制：仅 PNG / JPG，且不超过 5MB（与服务端 /homework/upload-url 校验一致）
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE = 5 * 1024 * 1024;

// 提交规范清单：依据当前作业描述与工单 SQ-2026-001 验收标准整理（P1T2 质检报告 / P4T1 看板作品）
const SPEC_P1T2 = [
  { title: "质量筛选结果", desc: "截图需体现：单张质量分 ≥0.5 · 人脸框最小边 ≥80px · 距图像边缘 ≥10px" },
  { title: "可用率达标", desc: "可用率 ≥80%（工单一票否决项），截图需包含可用率统计结果" },
  { title: "合规自查项", desc: "person_id 假名化（如 P001）· 无原图残留 · 知情同意记录齐全" },
];
const SPEC_P4T1 = [
  { title: "单维度看板", desc: "任选一个社区物联感知维度：环境温湿度 / 人流变化 / 设备状态等" },
  { title: "设计并实现", desc: "ECharts 等图表工具均可，完成一个可运行的单维度数据看板" },
  { title: "截图完整", desc: "截图需完整包含看板标题、图表效果与关键数据结论" },
];
const SPEC_P4T2 = [
  { title: "大屏集成完成", desc: "基于 JimuReport 完成栅格布局，词云图 / 柱状图 / 温度预警折线图正常渲染" },
  { title: "联动与预警", desc: "数据绑定、指标卡片、告警列表按演示工单联动运行，预警线与弹窗可触发" },
  { title: "质检与汇报", desc: "附《AI缺陷清单》与整改复测结果，并说明组件复用思路与系统集成方案" },
];
// 任务级作业的通用规范（P1T1 / P2T1 / P2T2 / P3T1 / P3T2 等无专属清单时使用）
const SPEC_GENERIC = [
  { title: "对照工单要求", desc: "按本任务活页任务书的工单要求与交付成果逐项完成" },
  { title: "作品截图完整", desc: "截图清晰，包含关键成果、数据或界面效果与必要说明" },
  { title: "合规自查", desc: "遵守数据安全与隐私规范，假名化、脱敏、无敏感信息残留" },
];
const SPEC_MAP: Record<string, { title: string; desc: string }[]> = {
  P1T1: SPEC_GENERIC,
  P2T1: SPEC_GENERIC,
  P2T2: SPEC_GENERIC,
  P3T1: SPEC_GENERIC,
  P3T2: SPEC_GENERIC,
  P4T1: SPEC_P4T1,
  P4T2: SPEC_P4T2,
};
const FORMAT_RULES = ["仅支持 PNG / JPG 格式", "单张图片不超过 5MB", "截图清晰完整、关键信息可读"];

// 把文件 PUT 到预签名 URL（直传到 Blob，带进度）
function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (p: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`上传失败 ${xhr.status}`));
    xhr.onerror = () => reject(new Error("网络错误"));
    xhr.send(file);
  });
}

// 生成缩略图：长边 ≤480px 的 JPEG（白底，避免透明 PNG 转黑）；失败返回 null（提交不缩略图，读图回退原图）
async function makeThumb(file: File): Promise<Blob | null> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 480 / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob((b) => r(b), "image/jpeg", 0.7)
    );
    return blob && blob.size > 0 ? blob : null;
  } catch {
    return null;
  }
}

export default function StudentHomework() {
  const { student } = useStudent();
  // 任务级作业：/student/homework?task=P4T1 → P4T1 作业；缺省 = P1T2 默认作业
  const [searchParams] = useSearchParams();
  const task = searchParams.get("task") || undefined;
  const [hw, setHw] = useState<Homework | null>(null);
  const [mine, setMine] = useState<HomeworkSubmission | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [imgErr, setImgErr] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [h, subs] = await Promise.all([
        api.getHomework(task),
        api.getHomeworkSubmissions(task),
      ]);
      if (!alive) return;
      setHw(h[0] ?? null);
      setMine(subs.find((s) => s.studentId === student?.id) ?? null);
    };
    load();
    return () => {
      alive = false;
    };
  }, [student?.id, task]);

  const pickFile = (f: File | null) => {
    setErr("");
    if (!f) {
      setFile(null);
      setPreview("");
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFile(null);
      setPreview("");
      setErr("仅支持 PNG / JPG 格式图片，请重新选择");
      return;
    }
    if (f.size > MAX_SIZE) {
      setFile(null);
      setPreview("");
      setErr(`图片大小不能超过 5MB（当前 ${fmtSize(f.size)}），请压缩后重新选择`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file || !student) return;
    setUploading(true);
    setProgress(0);
    setErr("");
    try {
      const contentType = file.type || "image/png";
      const { url, key } = await api.getHomeworkUploadUrl({
        studentId: student.id,
        fileName: file.name,
        contentType,
        size: file.size,
        task,
      });
      if (url) await putWithProgress(url, file, contentType, setProgress);
      else setProgress(100);
      // 缩略图（作业墙用，避免全班原图同时加载拖垮带宽）；失败不影响提交
      let thumbKey: string | undefined;
      const thumb = await makeThumb(file);
      if (thumb) {
        try {
          const thumbName = file.name.replace(/\.[^.]+$/, "") + ".thumb.jpg";
          const t = await api.getHomeworkUploadUrl({
            studentId: student.id,
            fileName: thumbName,
            contentType: "image/jpeg",
            size: thumb.size,
            task,
          });
          if (t.url) {
            const res = await fetch(t.url, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: thumb });
            if (res.ok) thumbKey = t.key;
          }
        } catch {
          /* 缩略图失败不阻塞提交 */
        }
      }
      const created = await api.submitHomeworkMeta({
        studentId: student.id,
        fileName: file.name,
        size: file.size,
        key,
        thumbKey,
        contentType,
        task,
      });
      setMine(created);
      setImgErr(false);
      pickFile(null);
    } catch (e) {
      setErr(String((e as Error).message || e));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (!hw)
    return (
      <div className="grid h-40 place-items-center text-slate-500">
        加载作业信息…
      </div>
    );

  const isTaskHw = isTaskHomework(task);
  const specItems = task ? SPEC_MAP[task] ?? SPEC_GENERIC : SPEC_P1T2;
  const hwTag = isTaskHw ? `${task} · 任务级作业` : "P1T2 · 主线作业";
  const hwTone = isTaskHw ? "rose" : "cyan";

  return (
    <div className="animate-rise space-y-6">
      <div className="hero-mesh tone-amber relative overflow-hidden rounded-2xl border border-slate-900/10 px-6 py-7">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone={hwTone}>{hwTag}</Tag>
          <Tag tone="rose">
            <IconClock className="mr-1 h-3.5 w-3.5" /> 截止 {hw.deadline}
          </Tag>
          {mine ? <Tag tone="emerald">已提交</Tag> : <Tag tone="amber">待提交</Tag>}
        </div>
        <h1 className="grad-text mt-3 text-3xl font-extrabold tracking-wide">提交作业</h1>
        <p className="mt-1.5 text-base text-slate-600">
          {hw.title} · 作品图片直传课程服务器，对照验收标准一次到位！
        </p>
      </div>

      <Card tone="amber" className="rise-1 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-900">{hw.title}</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs text-rose-600">
            <IconClock className="h-3.5 w-3.5" /> 截止 {hw.deadline}
          </span>
        </div>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          {hw.description}
        </p>
      </Card>

      <Card className="rise-2 p-6">
        <SectionTitle
          icon={<IconShield className="h-6 w-6" />}
          title="提交规范清单"
          sub="对照工单验收标准，提交前逐项自查"
          tone="amber"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {specItems.map((s, i) => (
            <div
              key={s.title}
              className="tone-amber rounded-xl border bg-slate-900/[0.03] px-5 py-4"
              style={{ borderColor: "var(--tone-line)" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="icon-chip h-8 w-8 shrink-0 rounded-lg">
                  <IconCheck className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="grad-text text-lg font-extrabold">0{i + 1}</span>
              </div>
              <div className="mt-2.5 text-base font-semibold text-slate-900">{s.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="divider-grad mt-5" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">格式要求：</span>
          {FORMAT_RULES.map((r) => (
            <Tag key={r} tone="amber">{r}</Tag>
          ))}
        </div>
      </Card>

      {mine ? (
        <Card tone="emerald" className="rise-3 flex items-center gap-4 p-6">
          {mine.contentType?.startsWith("image/") && !imgErr ? (
            <img
              src={homeworkFileUrl(mine.studentId, mine.task || task, { thumb: true, v: mine.key })}
              alt={mine.fileName}
              onError={() => setImgErr(true)}
              className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-emerald-400/30"
            />
          ) : (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-600">
              <IconCheck className="h-6 w-6" strokeWidth={2.5} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-slate-900">已提交</span>
              <Tag tone="emerald">作品已入库</Tag>
            </div>
            <div className="mt-0.5 truncate text-sm text-slate-500">
              {mine.fileName} · {fmtSize(mine.size)} · {mine.submittedAt}
            </div>
          </div>
        </Card>
      ) : (
        <Card tone="amber" className="rise-3 p-6">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-400/30 bg-amber-400/5 py-8 transition-colors hover:border-amber-400/60 hover:bg-amber-400/10"
          >
            {preview ? (
              <img
                src={preview}
                alt="预览"
                className="max-h-48 rounded-lg object-contain"
              />
            ) : (
              <span className="tone-amber icon-chip h-14 w-14 rounded-2xl">
                <IconUpload className="h-7 w-7" />
              </span>
            )}
            <span className="mt-3 text-base text-slate-700">
              {file ? file.name : "点击选择作品图片（PNG / JPG，不超过 5MB）"}
            </span>
            {file && (
              <span className="mt-1 text-xs text-slate-500">
                {fmtSize(file.size)}
              </span>
            )}
          </button>

          {uploading && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>正在上传…</span>
                <span>{progress}%</span>
              </div>
              <Bar value={progress} color={TONE_HEX.amber} />
            </div>
          )}
          {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}

          <button
            disabled={!file || uploading}
            onClick={submit}
            className={`mt-4 w-full rounded-xl py-3.5 text-base font-semibold transition-all ${
              file && !uploading
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-ink-950 shadow-lg shadow-amber-500/25 hover:brightness-110"
                : "cursor-not-allowed bg-slate-900/10 text-slate-500"
            }`}
          >
            {uploading ? "上传中…" : "提交作业"}
          </button>
        </Card>
      )}
    </div>
  );
}