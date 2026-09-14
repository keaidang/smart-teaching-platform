import { Link, useParams } from "react-router-dom";
import { Card, SectionTitle } from "../../components/ui";
import { IconBook, IconCheck, IconUpload, IconBoard } from "../../components/icons";
import { findTask, ACTIVE_TASK_ID, ACTIVE_TASK_CHECKLIST } from "../../lib/course";

export default function TaskDetail() {
  const { taskId = "" } = useParams();
  const found = findTask(taskId);

  if (!found) {
    return (
      <div className="animate-rise grid h-[60vh] place-items-center text-center">
        <div>
          <div className="text-5xl">🔒</div>
          <h2 className="mt-4 text-xl font-semibold text-white">该任务尚未开放</h2>
          <Link to="/projects" className="mt-4 inline-block rounded-lg border border-brand-400/30 px-4 py-2 text-sm text-brand-100 hover:bg-brand-500/15">返回项目列表</Link>
        </div>
      </div>
    );
  }

  const { project, task } = found;
  const active = task.id === ACTIVE_TASK_ID;

  if (!active) {
    return (
      <div className="animate-rise grid h-[60vh] place-items-center text-center">
        <div>
          <div className="text-5xl">🚧</div>
          <h2 className="mt-4 text-xl font-semibold text-white">{task.title}</h2>
          <p className="mt-2 text-sm text-brand-200/60">该任务资源建设中，暂未开放进入。</p>
          <Link to="/projects" className="mt-4 inline-block rounded-lg border border-brand-400/30 px-4 py-2 text-sm text-brand-100 hover:bg-brand-500/15">返回项目列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconBook className="h-6 w-6" />}
        title={task.title}
        sub={`${project.title} · ${project.hours} 课时`}
      />

      <Card className="mb-6 p-6">
        <div className="text-sm leading-relaxed text-brand-200/80">
          <b className="text-white">任务目标：</b>面向社区治理场景，完成传感器与视觉（图像 / 点云）数据的清洗治理——时间对齐、缺失与异常处理、图像去噪、点云滤波、格式统一与归一化，产出可用于融合分析的高质量数据集。
        </div>
      </Card>

      <h3 className="mb-3 text-sm font-medium tracking-widest text-brand-200/60">课堂任务清单</h3>
      <div className="space-y-3">
        {ACTIVE_TASK_CHECKLIST.map((c) => (
          <Card key={c.step} hover className="flex items-start gap-4 p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-sm font-bold text-brand-300">
              {c.step}
            </span>
            <div>
              <div className="font-medium text-white">{c.title}</div>
              <div className="mt-0.5 text-sm text-brand-200/70">{c.desc}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/student/homework">
          <Card hover className="flex items-center gap-4 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300"><IconUpload className="h-5 w-5" /></span>
            <div>
              <div className="font-semibold text-white">提交作业</div>
              <div className="text-xs text-brand-200/60">上传清洗成果数据集与质量说明</div>
            </div>
          </Card>
        </Link>
        <Link to="/class">
          <Card hover className="flex items-center gap-4 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300"><IconBoard className="h-5 w-5" /></span>
            <div>
              <div className="font-semibold text-white">后台大屏</div>
              <div className="text-xs text-brand-200/60">查看本任务课堂实时数据</div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-emerald-300">
        <IconCheck className="h-4 w-4" /> 当前课程正在进行该任务，预习 / 作业 / 问答均已按「传感与视觉数据清洗」配置。
      </div>
    </div>
  );
}
