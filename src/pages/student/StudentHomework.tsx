import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, homeworkFileUrl } from "../../lib/api";
import { useStudent } from "../../lib/auth";
import type { Homework, HomeworkSubmission } from "../../lib/types";
import { IconCheck, IconClock, IconUpload } from "../../components/icons";
import { Card } from "../../components/ui";

function fmtSize(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

// 作业上传限制：仅 PNG / JPG，且不超过 5MB（与服务端 /homework/upload-url 校验一致）
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE = 5 * 1024 * 1024;

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
      const created = await api.submitHomeworkMeta({
        studentId: student.id,
        fileName: file.name,
        size: file.size,
        key,
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
      <div className="grid h-40 place-items-center text-brand-200/60">
        加载作业信息…
      </div>
    );

  return (
    <div className="animate-rise space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
          <IconUpload className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-white">提交作业</h2>
          <p className="text-sm text-brand-200/60">
            作品图片直传 EdgeOne Blob 存储，元数据入 KV
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{hw.title}</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs text-rose-300">
            <IconClock className="h-3.5 w-3.5" /> 截止 {hw.deadline}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-brand-200/70">
          {hw.description}
        </p>
      </Card>

      {mine ? (
        <Card className="flex items-center gap-4 p-6">
          {mine.contentType?.startsWith("image/") && !imgErr ? (
            <img
              src={homeworkFileUrl(mine.studentId, mine.task || task)}
              alt={mine.fileName}
              onError={() => setImgErr(true)}
              className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-brand-400/30"
            />
          ) : (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
              <IconCheck className="h-6 w-6" strokeWidth={2.5} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-white">已提交</div>
            <div className="truncate text-sm text-brand-200/70">
              {mine.fileName} · {fmtSize(mine.size)} · {mine.submittedAt}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-400/30 bg-brand-500/5 py-8 transition-colors hover:border-brand-400/60 hover:bg-brand-500/10"
          >
            {preview ? (
              <img
                src={preview}
                alt="预览"
                className="max-h-48 rounded-lg object-contain"
              />
            ) : (
              <IconUpload className="h-8 w-8 text-brand-300" />
            )}
            <span className="mt-3 text-sm text-brand-100">
              {file ? file.name : "点击选择作品图片（PNG / JPG，不超过 5MB）"}
            </span>
            {file && (
              <span className="mt-1 text-xs text-brand-200/50">
                {fmtSize(file.size)}
              </span>
            )}
          </button>

          {uploading && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-brand-200/70">
                <span>正在上传…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {err && <p className="mt-3 text-sm text-rose-300">{err}</p>}

          <button
            disabled={!file || uploading}
            onClick={submit}
            className={`mt-4 w-full rounded-xl py-3.5 font-semibold transition-all ${
              file && !uploading
                ? "bg-brand-500 text-ink-900 hover:bg-brand-400"
                : "cursor-not-allowed bg-white/10 text-brand-200/40"
            }`}
          >
            {uploading ? "上传中…" : "提交作业"}
          </button>
        </Card>
      )}
    </div>
  );
}
