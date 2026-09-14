import type { ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Card, SectionTitle } from "../../components/ui";
import { IconBook, IconCheck, IconUpload, IconBoard } from "../../components/icons";
import { findTask, ACTIVE_TASK_ID, ACTIVE_TASK_CHECKLIST } from "../../lib/course";

/* ---------- 工单页内的小组件（统一样式） ---------- */

function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-brand-500/15 px-1.5 py-0.5 font-mono text-[0.9em] text-brand-300">
      {children}
    </code>
  );
}

function OrderSection({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-4 mt-9 flex items-center gap-3 first:mt-0">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500/25 text-sm font-black text-brand-200">
        {num}
      </span>
      <h3 className="text-lg font-bold tracking-wide text-brand-300">{title}</h3>
      <span className="h-px flex-1 bg-brand-400/20" />
    </div>
  );
}

function Spec({ children }: { children: ReactNode }) {
  return (
    <li className="relative pl-6 leading-relaxed text-brand-100/85 before:absolute before:left-0 before:font-black before:text-emerald-400 before:content-['▸']">
      {children}
    </li>
  );
}

function Deliverable({
  icon, title, desc, children,
}: { icon: string; title: string; desc: ReactNode; children: ReactNode }) {
  return (
    <Card className="border-l-4 border-l-emerald-400/70 bg-emerald-400/[0.04] p-5">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-2xl">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-base font-bold tracking-wide text-white">{title}</div>
          <p className="mt-1.5 text-sm leading-relaxed text-brand-200/80">{desc}</p>
          <ul className="mt-2.5 space-y-1.5 text-sm">{children}</ul>
        </div>
      </div>
    </Card>
  );
}

/* ---------- 企业任务工单完整内容（来源：Desktop/项目一任务2资源/任务工单 SQ-2026-001） ---------- */

function WorkOrder() {
  return (
    <Card className="p-6 sm:p-8">
      {/* 工单抬头 */}
      <div className="mb-7 border-b border-brand-400/20 pb-6 text-center">
        <div className="bg-gradient-to-r from-sky-400 via-brand-300 to-sky-300 bg-clip-text text-3xl font-black tracking-widest text-transparent">
          📋 数据服务任务工单
        </div>
        <div className="mt-2 text-sm tracking-wider text-brand-200/60">
          智慧社区试点楼栋 · 人脸特征底库建设与交付
          <span className="font-bold text-amber-400"> | 工单编号：SQ-2026-001</span>
        </div>
      </div>

      {/* 委托信息 */}
      <div className="mb-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["委托方", "学校合作科技公司"],
          ["服务对象", "某社区（试点楼栋）"],
          ["承接方", "数据服务实训小组"],
          ["采集设备", "K230 CanMV 端侧设备"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border-l-4 border-brand-400/70 bg-white/[0.04] px-4 py-3">
            <div className="text-xs tracking-widest text-brand-200/50">{k}</div>
            <div className="mt-0.5 font-bold text-white">{v}</div>
          </div>
        ))}
      </div>

      {/* 1 任务背景 */}
      <OrderSection num="1" title="任务背景" />
      <div className="space-y-3 text-justify leading-relaxed text-brand-100/85">
        <p>
          合作社区拟在试点楼栋部署<b className="text-white">人脸门禁与 AI 监控联动系统</b>，需建设居民
          <b className="text-white">人脸特征底库</b>，用于实现<b className="text-brand-300">黑名单人员预警</b>、
          <b className="text-brand-300">独居老人长时间未出入研判</b>等功能。
        </p>
        <p>
          本工单委托数据服务实训小组完成<b className="text-amber-400">试点批次人脸特征模板的采集与交付</b>。
          请注意：本任务交付的<b className="text-white">不是人脸照片</b>，而是
          <b className="text-amber-400">符合合规要求的人脸特征数据集</b>。
          <b className="text-white">采集与处理过程须严格遵守相关法规。</b>
        </p>
      </div>

      {/* 2 交付成品清单（核心） */}
      <OrderSection num="2" title="交付成品清单（核心）" />
      <div className="space-y-4">
        <Deliverable
          icon="🧠"
          title="交付物一：人脸特征模板数据集"
          desc={<>这是本次交付的<b className="text-white">核心数据资产</b>。每一张人脸图像经过特征提取后，生成一个不可逆的 128 维特征向量，以 SHA-256 哈希值命名并加密存储。</>}
        >
          <Spec>存放位置：<C>features/</C> 目录下</Spec>
          <Spec>文件格式：<C>.enc</C> 加密二进制文件（每个约 512 字节）</Spec>
          <Spec>命名规则：<C>{"{feature_id}.enc"}</C>（feature_id 为 SHA-256 前 16 位）</Spec>
          <Spec>文件数量：与采集的有效样本数一致，<b className="text-white">不得为空</b></Spec>
          <Spec>合规要求：<b className="text-white">features/ 目录内不得包含任何原始图像</b></Spec>
        </Deliverable>

        <Deliverable
          icon="📊"
          title="交付物二：元数据索引表"
          desc={<>这是整个数据集的"<b className="text-white">户籍册</b>"，用于追溯每一个特征模板的来源、质量与授权情况。由生成脚本自动写入，字段完整、不可缺失。</>}
        >
          <Spec>存放位置：交付根目录下 <C>metadata.csv</C></Spec>
          <Spec>编码格式：<C>UTF-8-sig</C>（防止 Excel 打开乱码）</Spec>
          <Spec>字段要求（8 个）：<C>feature_id</C>、<C>file_name</C>、<C>person_id</C>、<C>consent_id</C>、<C>time</C>、<C>device_id</C>、<C>quality_score</C>、<C>face_size</C></Spec>
          <Spec>person_id 必须为假名（如 P001），<b className="text-white">严禁出现真实姓名</b></Spec>
          <Spec>每条记录须对应一个 <C>.enc</C> 文件，字段不得为空</Spec>
        </Deliverable>

        <Deliverable
          icon="📝"
          title="交付物三：合规记录"
          desc={<>证明本次采集与处理过程<b className="text-white">合法合规</b>的证据材料。一旦缺失，整个数据集将<b className="text-rose-300">一票否决</b>，无法交付。</>}
        >
          <Spec>存放位置：<C>compliance/</C> 目录下</Spec>
          <Spec>内容一：每位被采集人的<b className="text-white">知情同意卡</b>（照片或扫描件）</Spec>
          <Spec>内容二：<b className="text-white">原始图像删除日志</b>（记录删除时间与数量）</Spec>
          <Spec>文件数量：至少 2 个（同意书 + 删除日志）</Spec>
        </Deliverable>

        <Deliverable
          icon="🗂"
          title="交付物四：数据卡"
          desc={<>对本次交付数据集质量的<b className="text-white">汇总说明</b>，方便甲方快速了解数据可用性。</>}
        >
          <Spec>存放位置：交付根目录下 <C>datacard.md</C></Spec>
          <Spec>必须包含：采集设备、样本总量、平均质量分、<b className="text-white">可用率</b></Spec>
          <Spec>必须包含：数据构成（特征维度、加密算法、存储位置）</Spec>
          <Spec>必须包含：合规状态说明（各项是否通过）</Spec>
        </Deliverable>
      </div>

      {/* 3 验收标准 */}
      <OrderSection num="3" title="验收标准" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["可用率（一票否决）", "≥ 80%", "可用样本数 / 采集总样本数"],
          ["单张人脸质量分", "≥ 0.5", "低于 0.5 视为不可用样本"],
          ["假名化合规", "全部通过", "person_id 不得出现真实姓名"],
          ["无原图残留", "0 张", "features/ 及根目录不得有 .jpg/.png"],
        ].map(([k, v, note]) => (
          <div key={k} className="rounded-xl border border-amber-400/30 bg-amber-400/[0.07] px-5 py-4">
            <div className="text-sm font-bold text-amber-300">{k}</div>
            <div className="mt-1 font-mono text-2xl font-extrabold text-white">{v}</div>
            <div className="mt-1 text-xs text-brand-200/50">{note}</div>
          </div>
        ))}
      </div>

      {/* 4 合规要求 */}
      <OrderSection num="4" title="合规要求（一票否决项）" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["知情同意", "采集前须取得被采集人明确同意，并保留授权记录。"],
          ["不存原图", "不得存储人脸原始图像，使用后须立即删除。"],
          ["加密存储", "特征模板须采用标准加密算法存储，禁止明文保存。"],
          ["可追溯", "每个样本须关联唯一编号、采集时间、授权记录。"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-400/[0.06] px-5 py-4 text-sm leading-relaxed text-rose-100/80">
            <span className="shrink-0 text-lg text-rose-400">⚖</span>
            <div>
              <b className="block text-rose-300">{k}</b>
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* 5 交付提交要求 */}
      <OrderSection num="5" title="交付提交要求" />
      <div className="rounded-xl border border-brand-400/30 bg-brand-500/[0.07] px-6 py-3">
        {[
          ["提交形式", <>将整个交付文件夹压缩为 <C>.zip</C> 压缩包</>],
          ["命名规范", <><C>SQ-2026-001_第X组.zip</C>（X 为小组编号）</>],
          ["提交时间", <>课堂活动结束前 5 分钟统一提交</>],
          ["提交方式", <>上传至教学平台 / 拷贝至教师指定目录</>],
        ].map(([k, v], i) => (
          <div key={k as string} className={`flex flex-wrap items-baseline gap-x-4 py-2.5 ${i < 3 ? "border-b border-dashed border-brand-400/20" : ""}`}>
            <span className="min-w-[72px] text-sm font-bold text-brand-300">{k}</span>
            <span className="text-sm text-brand-100/90">{v}</span>
          </div>
        ))}
      </div>

      {/* 工单页脚 */}
      <div className="mt-7 border-t border-brand-400/10 pt-4 text-center text-xs tracking-wider text-brand-200/40">
        数智社区 · 信息采集技术综合实训 <span className="mx-2 text-brand-400/20">|</span> 《人工智能数据服务》
        <span className="mx-2 text-brand-400/20">|</span> 校企融合真实任务工单
      </div>
    </Card>
  );
}

/* ---------- 页面 ---------- */

export default function TaskDetail() {
  const { taskId = "" } = useParams();
  const found = findTask(taskId);

  if (!found) return <Navigate to="/projects" replace />;

  const { project, task } = found;
  const active = task.id === ACTIVE_TASK_ID;
  // 挂有正式学习资源（任务工单）的任务，未激活也可查看详情
  const hasResource = task.id === "P1T2";

  if (!active && !hasResource) return <Navigate to="/projects" replace />;

  return (
    <div className="animate-rise">
      <SectionTitle
        icon={<IconBook className="h-6 w-6" />}
        title={task.title}
        sub={`${project.title} · ${project.hours} 课时`}
      />

      {active ? (
        <>
          <Card className="mb-6 p-6">
            <div className="text-sm leading-relaxed text-brand-200/80">
              <b className="text-white">任务目标（工单编号 SQ-2026-001）：</b>为社区试点楼栋人脸门禁与 AI 监控联动系统建设居民<b className="text-white">人脸特征底库</b>，支撑黑名单人员预警、独居老人长时间未出入研判。使用 K230 CanMV 端侧设备采集多姿态人脸样本，完成质量筛选、特征提取与加密存储、元数据索引、数据卡与合规记录整理，最终打包交付<b className="text-white">合规的人脸特征数据集</b>（不是人脸照片）。验收硬指标：质量分 ≥0.5、人脸框最小边 ≥80px、距边缘 ≥10px、可用率 ≥80%（一票否决）、假名化合规、无原图残留。
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
                  <div className="text-xs text-brand-200/60">上传交付成果：索引表 / 数据卡 / 合规记录等材料</div>
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
        </>
      ) : (
        <>
          <WorkOrder />

          <h3 className="mb-3 mt-8 text-sm font-medium tracking-widest text-brand-200/60">课堂任务清单（依据本工单）</h3>
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

          <div className="mt-6 flex items-center gap-2 text-xs text-brand-200/50">
            <IconBook className="h-4 w-4" /> 本页为项目学习资源（任务工单 SQ-2026-001 完整内容），供课前研读参考；当前课程开放任务为「传感与视觉数据清洗」。
          </div>
        </>
      )}
    </div>
  );
}
