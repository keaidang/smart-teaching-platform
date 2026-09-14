数智社区 · 教学资源库
是什么：一个面向职业院校《信息采集技术》课程的智慧教学平台，围绕"城市'小微区域'环境与设施数据智能采集"主题，覆盖课前预习、课中作业、课后练习、AI 助学与教师大屏评价的完整教学闭环。

做什么：

主站资源库：展示课程项目/任务、行业案例、拓展资源与教学评价模型
学生端：登录、课前预习答题、课中作业上传（图片）、课后练习、AI 问答
教师大屏：实时在线人数与提交进度、预习排行、作业看板、练习正确率、四维评价打分
管理后台：查看统计、重置提交记录、清空文件、重播种课程数据
技术栈：Vite + React 18 + TypeScript + React Router + Tailwind CSS 4，图表用 ECharts，Markdown 渲染用 react-markdown。后端为 EdgeOne Pages 云函数（单文件路由），数据存储用 @edgeone/pages-blob（KV 存业务数据、Blob 存作业图片），AI 问答对接阿里通义千问（OpenAI 兼容协议，SSE 流式 + 思维链）。

主要结构：

src/
  App.tsx              路由总入口（主站 / 学生 / 大屏 / 后台）
  pages/
    site/              资源库主站（首页/项目/任务详情/行业/拓展/评价）
    student/           学生端（登录/预习/作业/练习/AI）
    display/           教师实时大屏（概览/预习/作业/练习/评价）
    admin/             管理后台
  components/          通用 UI、图标、EChart 封装、Logo
  lib/                 课程数据、API 封装、鉴权、类型、mock
cloud-functions/api/[[default]].js   EdgeOne 云函数（全部 API 路由）
edgeone.json           部署与 SPA 重写配置
运行方式：

npm install 安装依赖
npm run dev 本地开发（/api 代理到本地服务）
npm run build 构建，产物输出到 dist
环境变量：DASHSCOPE_API_KEY（AI 问答密钥）、ADMIN_KEY（管理端密钥）、KV_STORE/BLOB_STORE（存储命名空间，可选）、QWEN_MODEL（模型名，可选）。

说明：按当前请求范围，本次仅输出项目概览，未生成或写入任何文件。如需我把上述内容落成仓库中的 README.md 文件，请告知。
