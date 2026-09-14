# 数智社区 · 教学资源库

面向职业院校《信息采集技术》（城市“小微区域”环境与设施数据智能采集）课程的**无服务器教学平台**。
一套代码同时承载 **资源库主站**、**学生端**、**教师后台大屏** 与 **管理后台**，数据存于 EdgeOne KV / Blob，AI 问答接阿里通义千问。

- 线上地址：<https://class.keaidang.com>
- 技术栈：Vite + React 18 + TypeScript + Tailwind CSS 4 + React Router + ECharts
- 部署：腾讯云 EdgeOne Makers（原 Pages）· Cloud Functions（Node 20）· KV + Blob 存储

---

## 目录结构

```
.
├─ index.html                     # 入口（含 favicon / 标题）
├─ public/favicon.svg             # 标签页图标
├─ edgeone.json                   # EdgeOne 构建/路由(SPA rewrites)/函数区域配置
├─ cloud-functions/api/[[default]].js   # 云函数（Express 式 catch-all，处理 /api/*）
└─ src/
   ├─ App.tsx                     # 路由（懒加载 Evaluation / StudentAI）
   ├─ components/                 # Logo / EChart / icons / ui
   ├─ lib/
   │  ├─ api.ts                   # 前端接口层（含 mock 开关 + 流式 AI）
   │  ├─ auth.tsx                 # 学生登录态（学号+姓名）
   │  ├─ course.ts                # 名单/项目任务/题目/评价维度（前端种子）
   │  ├─ evalModel.ts             # 课程达成度评价模型（看板数据）
   │  ├─ mock.ts / types.ts / echarts.ts
   └─ pages/
      ├─ site/      # 资源库主站：首页/项目学习/产教融合/拓展课程/教学评价/任务详情
      ├─ student/   # 学生端：登录/课前预习/提交作业/课后问答/AI 问答
      ├─ display/   # 教师后台大屏：总览/预习榜/作业墙/习题统计/教师评价
      └─ admin/     # 管理后台：统计 + 重置/重播种
```

## 路由

| 路径 | 说明 |
|---|---|
| `/` | 资源库首页（课程导学 · 技术资源库 · 四模块入口） |
| `/projects` | 项目学习资源（4 项目 8 任务，2×2） |
| `/projects/task/:id` | 任务详情（当前仅 `P2T2` 传感与视觉数据清洗 开放） |
| `/industry` | 产教融合资源（智慧社区/交通/巡检/安防 4 案例） |
| `/extensions` | 拓展课程资源 |
| `/evaluation` | 教学评价 · 课程目标达成度看板（ECharts 5 视图） |
| `/student` | 学生端（学号+姓名登录 → 任务门禁 → 预习/作业/问答/AI） |
| `/class` | 教师后台大屏（任务门禁 → 总览/预习榜/作业墙/习题统计/教师评价） |
| `/admin` | 管理后台（统计 + 重置/重播种） |

## 数据模型（EdgeOne KV，store 名 `class`）

| 键 | 含义 |
|---|---|
| `students` | 班级名单（26 人，学号 20241216501–526） |
| `preview:questions` / `exercises` / `homework` | 题目与作业定义（种子） |
| `preview:answer:<学号>` | 课前预习作答 + 得分（含 lesson/kp/dim 标签） |
| `homework:sub:<学号>` | 作业提交元数据（文件名/大小/`key`/时间） |
| `exercise:answer:<学号>` | 课后知识点问答作答 |
| `teacher-eval:<学号>` | 教师评价（课堂表现/课后作业/知识掌握/综合素养 1–5 星 + 评语） |
| `presence:<学号>` | 在线心跳（近 60s 视为在线） |

- 作业图片二进制存于 **Blob**（store 名 `homework`），元数据（`key`）存 KV；上传走**预签名直传**，取图经云函数回读。
- 首次访问若 `students` 不存在会自动播种（`ensureSeed`）。

## 环境变量

前端（Vite，仅 `VITE_` 前缀进包）与后端（云函数运行时读 `process.env`）分开：

| 变量 | 用途 | 默认 |
|---|---|---|
| `VITE_USE_MOCK` | `true` 时前端走内置 mock（离线演示） | 未设=走真实 `/api` |
| `VITE_API_BASE` | 接口前缀 | `/api` |
| `KV_STORE` | KV store 名 | `class` |
| `BLOB_STORE` | Blob store 名 | `homework` |
| `DASHSCOPE_API_KEY` | 阿里通义千问 AI 问答 | — |
| `QWEN_MODEL` | 模型 id | `qwen3.8-flash` |
| `ADMIN_KEY` | 管理端密钥 | `admin`（测试环境） |

> `.env` 已被 `.gitignore` 忽略，密钥不入库；部署时在 EdgeOne 控制台「环境变量」配置。

## 本地开发

```bash
npm install
npm run dev          # http://127.0.0.1:5173  （默认 mock 模式，可离线看界面）
npm run build        # tsc 校验 + 打包到 dist/
```

- 本地默认 `VITE_USE_MOCK=true`，无需后端即可预览全部界面。
- 联调真实 KV/Blob/AI 需部署到 EdgeOne（`getStore` 依赖运行时自动鉴权）。

## 部署（Git 自动构建）

1. 代码推送到 GitHub `keaidang/smart-teaching-platform`（分支 `main`）。
2. EdgeOne Makers 导入该 Git 仓库，构建配置读 `edgeone.json`（`npm run build` → `dist`）。
3. 在控制台建两个存储：KV `class`、Blob `homework`。
4. 配环境变量（至少 `DASHSCOPE_API_KEY`）。
5. push 即自动重新构建部署。

## 管理后台 `/admin`

密钥登录（默认 `admin`），可：
- 查看统计（名单/在线/预习/作业/问答 完成数）
- **重置答题/提交记录（KV）**：清作答与心跳，保留名单、题目、图片
- **清空作业图片（Blob）**
- **全部重置（记录 + 图片）**：保留名单与题目
- **重新播种（名单 + 题目）**：清空全部并按最新代码重写（内容更新后用）

等效接口（带 `x-admin-key`）：`GET /api/admin/stats`、`POST /api/admin/{reset-submissions,clear-blob,reset-all,reseed}`。

## 说明 / 待办

- 当前课程只开放任务 **P2T2「传感与视觉数据清洗」**，其余任务入口显示但暂不可进入。
- 题目、任务清单、案例内容为**占位**，待正式资源替换。
- 达成度看板目前用模型示例数据，后续可接入真实作答（`buildEvalData(real)` 已预留注入点）。
- 生产环境请更换 `ADMIN_KEY`、收敛 `/api/reseed` 等管理端点。
