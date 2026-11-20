import type { ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Card, SectionTitle, Stat, Tag, type Tone } from "../../components/ui";
import { IconBook, IconCheck, IconUpload, IconBoard, IconShield, IconClock } from "../../components/icons";
import { findTask, ACTIVE_TASK_CHECKLIST } from "../../lib/course";

const PROJECT_TONES: Record<string, Tone> = { P1: "cyan", P2: "emerald", P3: "violet", P4: "rose" };

/* ---------- 工单页内的小组件（统一样式） ---------- */

function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-cyan-400/10 px-1.5 py-0.5 font-mono text-[0.9em] text-cyan-600">
      {children}
    </code>
  );
}

function OrderSection({ num, title, tone = "cyan" }: { num: string; title: string; tone?: Tone }) {
  return (
    <div className={`tone-${tone} mb-4 mt-9 flex items-center gap-3 first:mt-0`}>
      <span className="icon-chip grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-black">
        {num}
      </span>
      <h3 className="text-lg font-bold tracking-wide text-slate-900">{title}</h3>
      <span className="divider-grad flex-1" />
    </div>
  );
}

function Spec({ children }: { children: ReactNode }) {
  return (
    <li className="relative pl-6 leading-relaxed text-slate-600 before:absolute before:left-0 before:font-black before:text-emerald-600 before:content-['▸']">
      {children}
    </li>
  );
}

function Deliverable({
  icon, title, desc, children,
}: { icon: string; title: string; desc: ReactNode; children: ReactNode }) {
  return (
    <Card tone="emerald" className="p-5">
      <div className="flex items-start gap-4">
        <span className="tone-emerald icon-chip grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-base font-bold tracking-wide text-slate-900">{title}</div>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{desc}</p>
          <ul className="mt-2.5 space-y-1.5 text-sm">{children}</ul>
        </div>
      </div>
    </Card>
  );
}

/* ---------- 企业任务工单完整内容（来源：Desktop/项目一任务2资源/任务工单 SQ-2026-001） ---------- */

function WorkOrder() {
  return (
    <Card tone="cyan" className="p-6 sm:p-8">
      {/* 工单抬头 */}
      <div className="tone-cyan mb-7 border-b border-slate-900/10 pb-6 text-center">
        <div className="grad-text text-3xl font-black tracking-widest">
          📋 数据服务任务工单
        </div>
        <div className="mt-2 text-sm tracking-wider text-slate-500">
          智慧社区试点楼栋 · 人脸特征底库建设与交付
          <span className="font-bold text-amber-600"> | 工单编号：SQ-2026-001</span>
        </div>
      </div>

      {/* 委托信息 */}
      <div className="mb-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["委托方", "学校合作科技公司", "cyan"],
          ["服务对象", "某社区（试点楼栋）", "blue"],
          ["承接方", "数据服务实训小组", "violet"],
          ["采集设备", "K230 CanMV 端侧设备", "emerald"],
        ].map(([k, v, t]) => (
          <div key={k} className={`tone-${t} rounded-lg border bg-slate-900/[0.04] px-4 py-3`} style={{ borderColor: "var(--tone-line)" }}>
            <div className="text-xs tracking-widest text-slate-500">{k}</div>
            <div className="mt-0.5 font-bold text-slate-900">{v}</div>
          </div>
        ))}
      </div>

      {/* 1 任务背景 */}
      <OrderSection num="1" title="任务背景" />
      <div className="space-y-3 text-justify leading-relaxed text-slate-600">
        <p>
          合作社区拟在试点楼栋部署<b className="text-slate-900">人脸门禁与 AI 监控联动系统</b>，需建设居民
          <b className="text-slate-900">人脸特征底库</b>，用于实现<b className="text-cyan-600">黑名单人员预警</b>、
          <b className="text-cyan-600">独居老人长时间未出入研判</b>等功能。
        </p>
        <p>
          本工单委托数据服务实训小组完成<b className="text-amber-600">试点批次人脸特征模板的采集与交付</b>。
          请注意：本任务交付的<b className="text-slate-900">不是人脸照片</b>，而是
          <b className="text-amber-600">符合合规要求的人脸特征数据集</b>。
          <b className="text-slate-900">采集与处理过程须严格遵守相关法规。</b>
        </p>
      </div>

      {/* 2 交付成品清单（核心） */}
      <OrderSection num="2" title="交付成品清单（核心）" tone="emerald" />
      <div className="space-y-4">
        <Deliverable
          icon="🧠"
          title="交付物一：人脸特征模板数据集"
          desc={<>这是本次交付的<b className="text-slate-900">核心数据资产</b>。每一张人脸图像经过特征提取后，生成一个不可逆的 128 维特征向量，以 SHA-256 哈希值命名并加密存储。</>}
        >
          <Spec>存放位置：<C>features/</C> 目录下</Spec>
          <Spec>文件格式：<C>.enc</C> 加密二进制文件（每个约 512 字节）</Spec>
          <Spec>命名规则：<C>{"{feature_id}.enc"}</C>（feature_id 为 SHA-256 前 16 位）</Spec>
          <Spec>文件数量：与采集的有效样本数一致，<b className="text-slate-900">不得为空</b></Spec>
          <Spec>合规要求：<b className="text-slate-900">features/ 目录内不得包含任何原始图像</b></Spec>
        </Deliverable>

        <Deliverable
          icon="📊"
          title="交付物二：元数据索引表"
          desc={<>这是整个数据集的"<b className="text-slate-900">户籍册</b>"，用于追溯每一个特征模板的来源、质量与授权情况。由生成脚本自动写入，字段完整、不可缺失。</>}
        >
          <Spec>存放位置：交付根目录下 <C>metadata.csv</C></Spec>
          <Spec>编码格式：<C>UTF-8-sig</C>（防止 Excel 打开乱码）</Spec>
          <Spec>字段要求（8 个）：<C>feature_id</C>、<C>file_name</C>、<C>person_id</C>、<C>consent_id</C>、<C>time</C>、<C>device_id</C>、<C>quality_score</C>、<C>face_size</C></Spec>
          <Spec>person_id 必须为假名（如 P001），<b className="text-slate-900">严禁出现真实姓名</b></Spec>
          <Spec>每条记录须对应一个 <C>.enc</C> 文件，字段不得为空</Spec>
        </Deliverable>

        <Deliverable
          icon="📝"
          title="交付物三：合规记录"
          desc={<>证明本次采集与处理过程<b className="text-slate-900">合法合规</b>的证据材料。一旦缺失，整个数据集将<b className="text-rose-600">一票否决</b>，无法交付。</>}
        >
          <Spec>存放位置：<C>compliance/</C> 目录下</Spec>
          <Spec>内容一：每位被采集人的<b className="text-slate-900">知情同意卡</b>（照片或扫描件）</Spec>
          <Spec>内容二：<b className="text-slate-900">原始图像删除日志</b>（记录删除时间与数量）</Spec>
          <Spec>文件数量：至少 2 个（同意书 + 删除日志）</Spec>
        </Deliverable>

        <Deliverable
          icon="🗂"
          title="交付物四：数据卡"
          desc={<>对本次交付数据集质量的<b className="text-slate-900">汇总说明</b>，方便甲方快速了解数据可用性。</>}
        >
          <Spec>存放位置：交付根目录下 <C>datacard.md</C></Spec>
          <Spec>必须包含：采集设备、样本总量、平均质量分、<b className="text-slate-900">可用率</b></Spec>
          <Spec>必须包含：数据构成（特征维度、加密算法、存储位置）</Spec>
          <Spec>必须包含：合规状态说明（各项是否通过）</Spec>
        </Deliverable>
      </div>

      {/* 3 验收标准 */}
      <OrderSection num="3" title="验收标准" tone="amber" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["可用率（一票否决）", "≥ 80%", "可用样本数 / 采集总样本数"],
          ["单张人脸质量分", "≥ 0.5", "低于 0.5 视为不可用样本"],
          ["假名化合规", "全部通过", "person_id 不得出现真实姓名"],
          ["无原图残留", "0 张", "features/ 及根目录不得有 .jpg/.png"],
        ].map(([k, v, note]) => (
          <div key={k} className="tone-amber rounded-xl border bg-amber-400/[0.07] px-5 py-4" style={{ borderColor: "var(--tone-line)" }}>
            <div className="text-sm font-bold text-amber-600">{k}</div>
            <div className="mt-1 font-mono text-2xl font-extrabold text-slate-900">{v}</div>
            <div className="mt-1 text-xs text-slate-500">{note}</div>
          </div>
        ))}
      </div>

      {/* 4 合规要求 */}
      <OrderSection num="4" title="合规要求（一票否决项）" tone="rose" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["知情同意", "采集前须取得被采集人明确同意，并保留授权记录。"],
          ["不存原图", "不得存储人脸原始图像，使用后须立即删除。"],
          ["加密存储", "特征模板须采用标准加密算法存储，禁止明文保存。"],
          ["可追溯", "每个样本须关联唯一编号、采集时间、授权记录。"],
        ].map(([k, v]) => (
          <div key={k} className="tone-rose flex items-start gap-3 rounded-xl border bg-rose-400/[0.06] px-5 py-4 text-sm leading-relaxed text-slate-600" style={{ borderColor: "var(--tone-line)" }}>
            <span className="shrink-0 text-lg" style={{ color: "var(--tone)" }}>⚖</span>
            <div>
              <b className="block text-rose-600">{k}</b>
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* 5 交付提交要求 */}
      <OrderSection num="5" title="交付提交要求" tone="blue" />
      <div className="tone-blue rounded-xl border bg-slate-900/[0.04] px-6 py-3" style={{ borderColor: "var(--tone-line)" }}>
        {[
          ["提交形式", <>将整个交付文件夹压缩为 <C>.zip</C> 压缩包</>],
          ["命名规范", <><C>SQ-2026-001_第X组.zip</C>（X 为小组编号）</>],
          ["提交时间", <>课堂活动结束前 5 分钟统一提交</>],
          ["提交方式", <>上传至教学平台 / 拷贝至教师指定目录</>],
        ].map(([k, v], i) => (
          <div key={k as string} className={`flex flex-wrap items-baseline gap-x-4 py-2.5 ${i < 3 ? "border-b border-dashed border-slate-900/10" : ""}`}>
            <span className="min-w-[72px] text-sm font-bold" style={{ color: "var(--tone)" }}>{k}</span>
            <span className="text-sm text-slate-600">{v}</span>
          </div>
        ))}
      </div>

      {/* 工单页脚 */}
      <div className="mt-7 border-t border-slate-900/10 pt-4 text-center text-xs tracking-wider text-slate-500">
        数智社区 · 信息采集技术综合实训 <span className="mx-2 text-slate-700">|</span> 《人工智能数据服务》
        <span className="mx-2 text-slate-700">|</span> 校企融合真实任务工单
      </div>
    </Card>
  );
}

/* ---------- 工单速览：验收标准 + 合规红线 + 交付包结构 ---------- */

const ACCEPTANCE_QUICK = [
  { k: "可用率", v: "≥ 80%", note: "一票否决 · 可用样本 / 总样本", tone: "amber" as Tone },
  { k: "单张质量分", v: "≥ 0.5", note: "低于 0.5 视为不可用样本", tone: "cyan" as Tone },
  { k: "假名化合规", v: "全部通过", note: "person_id 严禁真实姓名", tone: "violet" as Tone },
  { k: "原图残留", v: "0 张", note: "features/ 与根目录无 .jpg/.png", tone: "rose" as Tone },
];

const RED_LINES = [
  { k: "知情同意", v: "先授权、后采集，同意卡留痕" },
  { k: "不存原图", v: "特征提取后立即删除原始图像" },
  { k: "加密存储", v: ".enc 加密保存，禁止明文" },
  { k: "全程可追溯", v: "编号 · 时间 · 授权记录一一对应" },
];

function WorkOrderQuickView() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card tone="amber" className="p-6">
        <SectionTitle icon={<IconCheck className="h-6 w-6" />} title="验收标准速览" sub="交付前逐项自查，任一不达标即退回" tone="amber" />
        <div className="grid grid-cols-2 gap-3">
          {ACCEPTANCE_QUICK.map((a) => (
            <div key={a.k} className={`tone-${a.tone} rounded-xl border bg-slate-900/[0.03] px-4 py-3`} style={{ borderColor: "var(--tone-line)" }}>
              <div className="text-sm text-slate-500">{a.k}</div>
              <div className="grad-text mt-0.5 font-mono text-2xl font-extrabold">{a.v}</div>
              <div className="mt-1 text-xs leading-relaxed text-slate-500">{a.note}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card tone="rose" className="p-6">
        <SectionTitle icon={<IconShield className="h-6 w-6" />} title="合规红线提示板" sub="四条一票否决项，触碰任何一条整单作废" tone="rose" />
        <div className="space-y-3">
          {RED_LINES.map((r, i) => (
            <div key={r.k} className="tone-rose flex items-center gap-4 rounded-xl border bg-slate-900/[0.03] px-4 py-3" style={{ borderColor: "var(--tone-line)" }}>
              <span className="grad-text text-xl font-extrabold">0{i + 1}</span>
              <div className="min-w-0">
                <div className="text-base font-bold text-rose-600">{r.k}</div>
                <div className="text-sm text-slate-500">{r.v}</div>
              </div>
              <span className="ml-auto shrink-0 text-lg text-rose-600">⚖</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DeliveryTree() {
  return (
    <Card tone="blue" className="p-6">
      <SectionTitle icon={<IconUpload className="h-6 w-6" />} title="标准交付包结构" sub="按此结构打包，命名 SQ-2026-001_第X组.zip" tone="blue" />
      <pre className="scrollbar-thin overflow-x-auto rounded-xl border border-slate-900/10 bg-white/85 px-5 py-4 font-mono text-sm leading-7 text-slate-600">
        <span className="font-bold text-slate-900">SQ-2026-001_第X组.zip</span>{"\n"}
        ├─ <span className="text-cyan-600">features/</span>{"        "}<span className="text-slate-500"># {"{feature_id}.enc"} 加密特征模板（严禁原图）</span>{"\n"}
        ├─ <span className="text-emerald-600">metadata.csv</span>{"     "}<span className="text-slate-500"># 8 字段元数据索引 · UTF-8-sig · 假名化</span>{"\n"}
        ├─ <span className="text-violet-600">compliance/</span>{"      "}<span className="text-slate-500"># 知情同意卡 + 原始图像删除日志（≥2 个文件）</span>{"\n"}
        └─ <span className="text-amber-600">datacard.md</span>{"      "}<span className="text-slate-500"># 数据卡：设备 / 样本量 / 质量分 / 可用率 / 合规状态</span>
      </pre>
    </Card>
  );
}

/* ---------- 页面 ---------- */

const TASK_INTRO: Record<string, string> = {
  P1T1: "以模拟企业数据页面为采集对象，完成网页表格抓取测试，练就从网页到结构化数据的采集基本功，并找出混入的脏数据。",
  P1T2: "依据企业任务工单 SQ-2026-001，使用 K230 端侧设备完成多姿态人脸采集、特征提取与加密入库，交付合规的人脸特征数据集。",
  P4T1: "任选一个社区物联感知维度，设计并实现单维度数据看板，用图表讲清数据结论，独立提交看板作品截图。",
};

export default function TaskDetail() {
  const { taskId = "" } = useParams();
  const found = findTask(taskId);

  if (!found) return <Navigate to="/projects" replace />;

  const { project, task } = found;
  const active = task.active;

  if (!active) return <Navigate to="/projects" replace />;

  const tone = PROJECT_TONES[project.id] ?? "cyan";

  return (
    <div className="flex flex-col gap-6">
      {/* 顶部任务横幅 */}
      <div className={`tone-${tone} tone-card glass animate-rise relative overflow-hidden rounded-2xl px-7 py-8`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="icon-chip h-12 w-12 rounded-xl"><IconBook className="h-6 w-6" /></span>
          <h1 className="grad-text text-3xl font-extrabold tracking-wide lg:text-4xl">{task.title}</h1>
          <Tag tone={tone}>{task.id === "P1T2" ? "进行中 · 主线任务" : "已开放"}</Tag>
        </div>
        <p className="mt-3 max-w-4xl text-base leading-relaxed text-slate-600">
          {TASK_INTRO[task.id] ?? `${project.title} · 课堂任务实操`}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-4">
          <Stat value={project.id} label={project.title} tone={tone} />
          <Stat value={project.hours} label="项目课时" tone="blue" />
          {task.id === "P1T2" && (
            <>
              <Stat value={ACTIVE_TASK_CHECKLIST.length} label="课堂步骤" tone="violet" />
              <Stat value="4" label="交付物" tone="emerald" />
              <Stat value="≥80%" label="可用率红线" tone="amber" />
            </>
          )}
          {task.id === "P1T1" && (
            <>
              <Stat value="18" label="脱敏工单" tone="violet" />
              <Stat value="12" label="数据字段" tone="emerald" />
              <Stat value="4" label="脏数据类型" tone="amber" />
            </>
          )}
          {task.id === "P4T1" && (
            <>
              <Stat value="1" label="聚焦维度" tone="violet" />
              <Stat value="4" label="设计步骤" tone="emerald" />
              <Stat value="16:30" label="今日作业截止" tone="amber" />
            </>
          )}
        </div>
      </div>

      {task.id === "P1T1" ? (
        <P1T1Content />
      ) : task.id === "P4T1" ? (
        <P4T1Content />
      ) : (
        <>
          <div className="animate-rise rise-1">
            <WorkOrderQuickView />
          </div>

          <div className="animate-rise rise-2">
            <WorkOrder />
          </div>

          <div className="animate-rise rise-2">
            <DeliveryTree />
          </div>

          <div className="animate-rise rise-3">
            <SectionTitle
              icon={<IconClock className="h-6 w-6" />}
              title="课堂任务清单"
              sub="依据企业工单 SQ-2026-001 的 8 步实操路线"
              tone="cyan"
            />
            <div className="space-y-3">
              {ACTIVE_TASK_CHECKLIST.map((c, i) => {
                const stepTones: Tone[] = ["cyan", "rose", "blue", "amber", "violet", "emerald", "orange", "cyan"];
                const st = stepTones[i % stepTones.length];
                return (
                  <Card key={c.step} tone={st} hover className="flex items-start gap-4 p-5">
                    <span className={`tone-${st} icon-chip grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold`}>
                      {c.step}
                    </span>
                    <div>
                      <div className="text-base font-medium text-slate-900">{c.title}</div>
                      <div className="mt-0.5 text-sm leading-relaxed text-slate-500">{c.desc}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="animate-rise rise-4 grid gap-4 sm:grid-cols-2">
            <Link to="/student/homework">
              <Card tone="blue" hover className="flex items-center gap-4 p-5">
                <span className="tone-blue icon-chip grid h-11 w-11 place-items-center rounded-xl"><IconUpload className="h-5 w-5" /></span>
                <div>
                  <div className="font-semibold text-slate-900">提交作业</div>
                  <div className="text-xs text-slate-500">上传数据质检报告截图</div>
                </div>
              </Card>
            </Link>
            <Link to="/class">
              <Card tone="emerald" hover className="flex items-center gap-4 p-5">
                <span className="tone-emerald icon-chip grid h-11 w-11 place-items-center rounded-xl"><IconBoard className="h-5 w-5" /></span>
                <div>
                  <div className="font-semibold text-slate-900">后台大屏</div>
                  <div className="text-xs text-slate-500">查看本任务课堂实时数据</div>
                </div>
              </Card>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-600">
            <IconCheck className="h-4 w-4" /> 当前课程正在进行该任务，预习 / 作业 / 问答均已按「传感与视觉数据采集」配置（企业工单：人脸特征底库建设与交付）。
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- 项目一·任务1：社区民意文本数据采集（数据抓取测试） ---------- */

const P1T1_STEPS = [
  {
    title: "打开数据页面",
    desc: "点击下方「打开数据页面」，在新标签页查看「智慧社区工单管理平台 · 多平台汇总视图」，共 18 条工单、12 个字段，来源含小程序 / 12345 热线 / 网格上报。",
  },
  {
    title: "练习数据抓取",
    desc: "观察表格结构（工单编号、状态、类型、来源、区域、诉求内容等字段），把工单内容整理为 CSV / Excel，或用工具脚本抓取表格数据，体验从网页到结构化数据的采集过程。",
  },
  {
    title: "找出脏数据（火眼金睛）",
    desc: "页面数据中故意混入了脏数据：所属区域命名不统一、个别姓名和电话未脱敏、重复提交的工单、明显非法的时间格式。把它们全部找出来并记录工单编号。",
  },
  {
    title: "下载留存（可选）",
    desc: "点击「下载数据文件」把数据页面 HTML 保存到本地，用文本编辑器打开即可看到网页源码与数据表结构，作为课后抓取 / 清洗练习素材。",
  },
];

const DIRTY_GUIDE: { name: string; sign: string; fix: string; tone: Tone }[] = [
  { name: "区域命名不统一", sign: "同一区域出现多种写法（如「3栋 / 三栋 / 3号楼」）", fix: "建立区域映射表，统一为标准名称后再入库", tone: "cyan" },
  { name: "姓名电话未脱敏", sign: "个别记录仍保留完整姓名或 11 位手机号", fix: "姓名假名化、电话掩码（如 138****0000）", tone: "rose" },
  { name: "重复提交工单", sign: "不同编号但诉求内容、时间高度雷同", fix: "按「内容 + 时间 + 来源」组合键去重并留痕", tone: "amber" },
  { name: "非法时间格式", sign: "出现 2026-13-45、空值或乱码时间", fix: "正则校验 + 统一为 ISO 格式，无法修复的标记剔除", tone: "violet" },
];

const CRAWL_TOOLS: { name: string; desc: string; tone: Tone }[] = [
  { name: "Requests", desc: "发起 HTTP 请求，获取页面 HTML 源码", tone: "cyan" },
  { name: "BeautifulSoup", desc: "解析 HTML 表格，逐行提取字段文本", tone: "blue" },
  { name: "pandas.read_html", desc: "一行代码把网页表格转为 DataFrame", tone: "emerald" },
  { name: "CSV / Excel", desc: "手工整理留存，作为清洗练习的原始语料", tone: "amber" },
];

function P1T1Content() {
  return (
    <>
      <Card tone="cyan" className="animate-rise rise-1 p-8">
        <div className="text-base leading-relaxed text-slate-600">
          <b className="text-slate-900">任务背景：</b>智慧社区项目需要采集<b className="text-slate-900">居民诉求文本数据</b>作为民意语料。
          本任务使用一套模拟的企业数据页面——「智慧社区工单管理平台（多平台汇总视图）」，数据已完成<b className="text-cyan-600">混合脱敏</b>处理。
          请以此页面为采集对象，完成<b className="text-amber-600">数据抓取测试</b>：认识工单数据结构、练习把网页表格转为结构化数据，并找出其中混入的脏数据。
        </div>
      </Card>

      <div className="animate-rise rise-2">
        <SectionTitle icon={<IconBook className="h-6 w-6" />} title="操作指引" sub="四步完成抓取测试" tone="cyan" />
        <div className="space-y-3">
          {P1T1_STEPS.map((c, i) => {
            const st: Tone[] = ["cyan", "blue", "amber", "emerald"];
            return (
              <Card key={c.title} tone={st[i]} hover className="flex items-start gap-4 p-5">
                <span className={`tone-${st[i]} icon-chip grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold`}>
                  {i + 1}
                </span>
                <div>
                  <div className="text-base font-medium text-slate-900">{c.title}</div>
                  <div className="mt-0.5 text-sm leading-relaxed text-slate-500">{c.desc}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Card tone="amber" className="animate-rise rise-3 p-8">
        <SectionTitle icon={<IconShield className="h-6 w-6" />} title="脏数据识别指南" sub="四类混入的脏数据：识别特征与处理建议（为项目二清洗打基础）" tone="amber" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {DIRTY_GUIDE.map((d) => (
            <div key={d.name} className={`tone-${d.tone} rounded-xl border bg-slate-900/[0.03] p-5`} style={{ borderColor: "var(--tone-line)" }}>
              <div className="text-base font-bold" style={{ color: "var(--tone)" }}>{d.name}</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">{d.sign}</div>
              <div className="mt-3 border-t border-slate-900/5 pt-3 text-sm leading-relaxed text-slate-500">
                <b className="text-slate-700">处理：</b>{d.fix}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card tone="violet" className="animate-rise rise-3 p-8">
        <SectionTitle icon={<IconBook className="h-6 w-6" />} title="抓取工具箱" sub="从手工整理到脚本抓取的四种方式，任选其一完成练习" tone="violet" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CRAWL_TOOLS.map((t) => (
            <div key={t.name} className={`tone-${t.tone} flex items-start gap-3 rounded-xl border bg-slate-900/[0.03] px-4 py-4`} style={{ borderColor: "var(--tone-line)" }}>
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: "var(--tone)", boxShadow: "0 0 10px var(--tone-glow)" }} />
              <div>
                <div className="font-mono text-base font-bold text-slate-900">{t.name}</div>
                <div className="mt-1 text-sm leading-relaxed text-slate-500">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="animate-rise rise-4 grid gap-4 sm:grid-cols-2">
        <a href="/resources/appeal-data.html" target="_blank" rel="noreferrer">
          <Card tone="cyan" hover className="flex items-center gap-4 p-6">
            <span className="tone-cyan icon-chip grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl">🖥</span>
            <div className="min-w-0">
              <div className="text-base font-semibold text-slate-900">打开数据页面</div>
              <div className="mt-0.5 text-sm text-slate-500">新标签页查看 18 条脱敏工单（在线浏览）</div>
            </div>
            <span className="ml-auto shrink-0 text-sm font-medium text-cyan-600">前往 →</span>
          </Card>
        </a>
        <a href="/resources/appeal-data.html" download="诉求部分脱敏后的数据.html">
          <Card tone="emerald" hover className="flex items-center gap-4 p-6">
            <span className="tone-emerald icon-chip grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl">⬇</span>
            <div className="min-w-0">
              <div className="text-base font-semibold text-slate-900">下载数据文件</div>
              <div className="mt-0.5 text-sm text-slate-500">保存 诉求部分脱敏后的数据.html 到本机练习</div>
            </div>
            <span className="ml-auto shrink-0 text-sm font-medium text-emerald-600">下载 ↓</span>
          </Card>
        </a>
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-600">
        <IconCheck className="h-4 w-4" /> 本任务为数据抓取测试任务，可进入练习；当前正在进行的主线任务仍为「传感与视觉数据采集」。
      </div>
    </>
  );
}

/* ---------- 项目四·任务1：社区数据单维度看板设计 ---------- */

const P4T1_STEPS = [
  {
    title: "选定数据维度",
    desc: "从社区物联感知数据中任选一个维度作为看板主题：环境温湿度、人流变化、设备状态、能耗等。维度越聚焦，看板结论越清晰。",
  },
  {
    title: "梳理数据结构",
    desc: "明确该维度的字段含义、数据量级与时间范围（如逐小时温湿度序列、逐日人流量），判断适合的图表类型：趋势用折线图、对比用柱状图、占比用饼图 / 环形图。",
  },
  {
    title: "实现看板",
    desc: "使用 ECharts（或表格工具 + 图表）实现单维度看板：包含看板标题、核心指标卡（如最大值 / 平均值 / 最新值）与主图表，配色统一、坐标轴与单位标注完整。",
  },
  {
    title: "提炼数据结论",
    desc: "在看板上写出 1–2 条关键数据结论（如「下午 2 点人流达到峰值 320 人」），让看数据的人不用逐个图表分析就能得到答案。",
  },
];

const CHART_PICK: { q: string; a: string; tip: string; tone: Tone }[] = [
  { q: "随时间怎么变？", a: "折线图", tip: "逐小时温湿度、逐日人流等趋势序列", tone: "cyan" },
  { q: "谁多谁少？", a: "柱状图", tip: "各楼栋能耗对比、分时段人流对比", tone: "blue" },
  { q: "各占多少？", a: "饼图 / 环形图", tip: "设备状态占比、告警类型构成", tone: "violet" },
  { q: "分布在哪里？", a: "散点 / 热力图", tip: "温湿度联合分布、时段 × 区域人流热力", tone: "rose" },
];

const BOARD_CHECK = [
  "看板标题：主题维度 + 时间范围一目了然",
  "核心指标卡：最大值 / 平均值 / 最新值等关键数字",
  "主图表：类型匹配数据结构，坐标轴与单位标注完整",
  "关键结论：1–2 条数据结论直接写在看板上",
  "配色统一：整套看板使用一致的主题色系",
];

function P4T1Content() {
  return (
    <>
      <Card tone="rose" className="animate-rise rise-1 p-8">
        <div className="text-base leading-relaxed text-slate-600">
          <b className="text-slate-900">任务背景：</b>社区物联感知设备持续产生环境、人流与设备状态等数据，
          管理者需要一张<b className="text-slate-900">聚焦单一维度的数据看板</b>来快速掌握运行状况。
          本任务请选择一个感知维度，完成<b className="text-amber-600">看板设计与实现</b>，
          并将最终看板截图提交到平台作业（作业：社区物联感知看板设计与实现）。
        </div>
      </Card>

      <div className="animate-rise rise-2">
        <SectionTitle icon={<IconBook className="h-6 w-6" />} title="操作指引" sub="四步完成单维度看板" tone="rose" />
        <div className="space-y-3">
          {P4T1_STEPS.map((c, i) => {
            const st: Tone[] = ["rose", "violet", "blue", "emerald"];
            return (
              <Card key={c.title} tone={st[i]} hover className="flex items-start gap-4 p-5">
                <span className={`tone-${st[i]} icon-chip grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold`}>
                  {i + 1}
                </span>
                <div>
                  <div className="text-base font-medium text-slate-900">{c.title}</div>
                  <div className="mt-0.5 text-sm leading-relaxed text-slate-500">{c.desc}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Card tone="violet" className="animate-rise rise-3 p-8">
        <SectionTitle icon={<IconBoard className="h-6 w-6" />} title="图表选型速查" sub="先问「想回答什么问题」，再选图表类型" tone="violet" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CHART_PICK.map((c) => (
            <div key={c.a} className={`tone-${c.tone} rounded-xl border bg-slate-900/[0.03] p-5`} style={{ borderColor: "var(--tone-line)" }}>
              <div className="text-sm text-slate-500">{c.q}</div>
              <div className="grad-text mt-1 text-2xl font-extrabold">{c.a}</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-500">{c.tip}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card tone="emerald" className="animate-rise rise-3 p-8">
        <SectionTitle icon={<IconCheck className="h-6 w-6" />} title="看板交付自查清单" sub="提交截图前逐项打勾，对应作业验收要求" tone="emerald" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {BOARD_CHECK.map((c, i) => (
            <div key={c} className="tone-emerald flex items-start gap-3 rounded-xl border bg-slate-900/[0.03] px-4 py-3" style={{ borderColor: "var(--tone-line)" }}>
              <span className="icon-chip grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-bold">{i + 1}</span>
              <span className="text-sm leading-relaxed text-slate-600">{c}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="animate-rise rise-4 grid gap-4 sm:grid-cols-2">
        <Link to="/student/homework?task=P4T1">
          <Card tone="blue" hover className="flex items-center gap-4 p-5">
            <span className="tone-blue icon-chip grid h-11 w-11 place-items-center rounded-xl"><IconUpload className="h-5 w-5" /></span>
            <div>
              <div className="font-semibold text-slate-900">提交作业</div>
              <div className="text-xs text-slate-500">上传社区物联感知看板作品截图</div>
            </div>
          </Card>
        </Link>
        <Link to="/class/homework?task=P4T1">
          <Card tone="emerald" hover className="flex items-center gap-4 p-5">
            <span className="tone-emerald icon-chip grid h-11 w-11 place-items-center rounded-xl"><IconBoard className="h-5 w-5" /></span>
            <div>
              <div className="font-semibold text-slate-900">后台大屏</div>
              <div className="text-xs text-slate-500">查看本任务作业提交进度墙</div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-600">
        <IconCheck className="h-4 w-4" /> 本任务作业与项目一·任务2 的「数据质检报告」相互独立，分别统计、互不影响。
      </div>
    </>
  );
}