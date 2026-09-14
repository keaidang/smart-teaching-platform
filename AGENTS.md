# AGENTS.md — 项目交接与协作说明

> 面向接手的 AI / 开发者。**先读本文件 + `README.md`**，再动手。这是「数智社区 · 教学资源库」无服务器教学平台的完整交接。

## 0. 一句话现状
一套 Vite+React 前端 + 一个 EdgeOne 云函数（Node）后端，数据存 EdgeOne KV/Blob，AI 接阿里通义千问；已上线 <https://class.keaidang.com>，主流程（资源库/学生端/教师大屏/管理后台/AI 问答/教师评价）已跑通，**剩余主要是内容替换与看板真实数据融合**。

## 1. 技术栈与运行
- 前端：Vite + React 18 + TypeScript + Tailwind CSS 4 + React Router 6 + ECharts（按需引入）+ react-markdown。
- 后端：EdgeOne Makers **Cloud Functions**（Node 20），单文件 `cloud-functions/api/[[default]].js`，Web Handler `onRequest`，catch-all 处理 `/api/*`。
- 存储：`@edgeone/pages-blob` 的 `getStore()` —— KV store 名 `class`、Blob store 名 `homework`（函数内自动鉴权，无需 token）。
- AI：DashScope 兼容模式 `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`，模型 `QWEN_MODEL`（默认 `qwen3.8-flash`），**SSE 流式 + `enable_thinking`**（思维链）。
- 部署：Git 仓库 `keaidang/smart-teaching-platform` 分支 `main` → EdgeOne 导入自动构建（读 `edgeone.json`）→ 自定义域名 `class.keaidang.com`（加速区域含中国大陆）。**push 即重新部署**。

本地：
```bash
npm install
npm run dev     # http://127.0.0.1:5173  默认 VITE_USE_MOCK=true，离线看界面
npm run build   # tsc --noEmit && vite build（必须过）
```
真实 KV/Blob/AI 只在部署环境可用（`getStore` 依赖运行时），本地用 mock。

## 2. 关键约定（务必遵守）
- **路由**：`/` 资源库主站；`/student` 学生端；`/class` 教师后台大屏；`/admin` 管理后台。学生/教师端都有「任务门禁」，当前仅 `P2T2 传感与视觉数据清洗` 可进入（课堂实操内容为企业工单 SQ-2026-001 人脸特征底库，工单清单展示在项目学习资源 P1T2 详情页），其余任务按钮显示「进入」但点击无反应（**不要**显示锁/未开放/建设中）。
- **名单与题目两处同步**：前端种子在 `src/lib/course.ts`（`ROSTER`/`PREVIEW_QUESTIONS`/`EXERCISE_QUESTIONS`/`ACTIVE_HOMEWORK`/`PROJECTS`/`EVAL_DIMENSIONS`），后端种子在 `cloud-functions/api/[[default]].js` 顶部（`ROSTER`/`SEED_PQ`/`SEED_EX`/`SEED_HW`）。**改任一处必须同步另一处**。
- **KV 种子只在 `students` 键缺失时自动写入**（`ensureSeed`）。改了名单/题目 → 部署后需调用重播种（见 §6），否则线上仍是旧数据。
- **班级固定 26 人**（学号 `20241216501`–`20241216526`，已剔除休学/集训）；答题/提交/在线/评价等记录可重置，但名单固定。
- **提交作者**：git 已配 `keaidang <keaidang@gmail.com>`。
- **绝不提交** `.env`、`.edgeone/`（含 CLI 令牌）；密钥只放 `.env`（已 gitignore）与 EdgeOne 控制台环境变量。
- 深色玻璃拟态主题，品牌色 cyan（`--color-brand-*`，见 `src/index.css`）；新页面沿用 `Card/SectionTitle/Avatar/Bar` 等 `src/components/ui.tsx`。
- 重依赖页（Evaluation 用 echarts、StudentAI 用 markdown）用 `React.lazy` 懒加载（见 `src/App.tsx`），别把它们塞回主包。

## 3. 数据模型（KV store `class`）
| 键 | 含义 |
|---|---|
| `students` | 名单（种子） |
| `preview:questions` / `exercises` / `homework` | 题目/作业定义（种子） |
| `preview:answer:<学号>` | 预习作答 `{studentId,name,score,answered,answers[]}` |
| `homework:sub:<学号>` | 作业元数据 `{...,fileName,size,key,contentType,submittedAt}` |
| `exercise:answer:<学号>` | 课后问答作答 |
| `teacher-eval:<学号>` | 教师评价 `{scores:{classroom,homework,knowledge,quality},comment,updatedAt}` |
| `presence:<学号>` | 在线心跳 `{ts}`（近 60s 算在线） |

作业图片二进制在 Blob `homework`（`hw/<学号>/<ts>-<名>`），`homework:sub` 存其 `key`。
`reset-submissions`/`reset-all` 会清掉 `preview:answer/homework:sub/exercise:answer/presence/teacher-eval`，保留 `students/preview:questions/exercises/homework`。

## 4. 接口一览（`/api/*`，云函数内）
GET：`health` `students` `overview` `preview/questions` `preview/scores` `homework` `homework/submissions` `homework/file?sid=` `exercises` `exercises/stats` `evaluations` `admin/stats` `presence`
POST：`preview/answers` `homework/upload-url` `homework/submissions` `exercises/answers` `ai/chat`(SSE) `evaluations` `presence` `reseed` `admin/reset-submissions` `admin/clear-blob` `admin/reset-all`
管理端点需 `x-admin-key`（或 `?key=`）等于 `ADMIN_KEY`。

## 5. 环境变量
前端：`VITE_USE_MOCK`、`VITE_API_BASE`。 后端（EdgeOne 控制台配）：`KV_STORE`、`BLOB_STORE`、`DASHSCOPE_API_KEY`、`QWEN_MODEL`、`ADMIN_KEY`。
当前测试环境 `ADMIN_KEY` 代码默认 `admin`（**上线前务必改强密钥或删管理端点**）。`DASHSCOPE_API_KEY` 已在项目环境变量配好（值见控制台，勿写入代码/仓库）。

## 6. 常用运维操作
重播种（名单/题目更新后）：
```bash
curl -X POST "https://class.keaidang.com/api/reseed" -H "x-admin-key: <ADMIN_KEY>"
```
或后台页 `/admin` 点「重新播种」。重置记录/清图片同理（见 §4）。
EdgeOne CLI 已登录（`edgeone whoami`），项目已 `link`；环境变量可用 `edgeone makers env set KEY VAL -e production`。

## 7. 已知坑
- **Blob 最终一致**：刚上传后取图有数秒延迟（前端已 `onError` 兜底 + 教师端 4s 轮询）。
- **KV 最终一致**：刚写立即读可能拿不到，读用 `consistency:"strong"`（已做）。
- **改种子不自动生效**：见 §2，必须 reseed。
- **函数冷启/最大时长**：AI 用流式避免 504；长任务注意函数超时上限。
- **本地无后端**：真实接口只在部署环境。

## 8. 待办 / 剩余工作（重点）
1. **达成度看板接真实数据（最重要）**：`src/pages/site/Evaluation.tsx` 现用 `buildEvalData()` 示例数据。需：
   - 后端加 `GET /api/evaluation`：把 KV 的 `preview:answer`(课前)/`homework:sub`(课中)/`exercise:answer`(课后) 按 `lesson`/`kp`/`dim` 聚合成 `evalModel.ts` 的 `RealScores`（课前/课中/课后 0–100），喂给 `buildEvalData(real)`（注入点已留）。
   - 教师评价 4 维（`teacher-eval`）可映射进「课堂表现/课后作业」等维度或画像。
2. **内容替换（占位→正式）**：`course.ts` 的 `PROJECTS`/`ACTIVE_TASK_CHECKLIST`/`PREVIEW_QUESTIONS`/`EXERCISE_QUESTIONS`、`Industry.tsx` 4 案例、各模块「资源」实际文件/链接上传（目前只有结构占位）。
3. **资源库资源上传/展示**：项目/案例点开应有真实资料列表（文件走 Blob，元数据走 KV，参考作业上传的预签名直传）。
4. **安全**：`/preview/questions`、`/exercises` 目前把 `answer` 下发前端（可作弊）→ 改为不下发、纯服务端判分；写接口加学生会话令牌防伪造；生产换 `ADMIN_KEY`、收敛 `reseed`。
5. **体验/健壮性**：全局 ErrorBoundary、接口失败提示、presence 过期键清理、Evaluation 首包可再瘦身（manualChunks）。
6. **多任务/多班扩展**（若需要）：当前单班单任务；`course.ts` 与 KV 键可按 `classId`/`taskId` 分区。

## 9. 接手第一步建议
```bash
npm install && npm run build   # 确认能编译
npm run dev                    # 本地看界面
```
读 `src/App.tsx`（路由）、`cloud-functions/api/[[default]].js`（后端）、`src/lib/course.ts`（内容种子）、`src/lib/evalModel.ts`（看板模型）、`edgeone.json`（部署/rewrites）。改内容→同步前后端种子→部署→`/admin` 重播种→线上验证。

---
交接人备注：项目为测试环境，密钥/题目多为占位；优先做 §8.1（看板真实化）与 §8.2（内容替换）。有疑问先翻本文件与 `README.md`。
