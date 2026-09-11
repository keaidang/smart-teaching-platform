import "dotenv/config";
import express from "express";
import app from "../cloud-functions/api/[[default]].js";

// 云函数里 /api 前缀来自目录结构(cloud-functions/api/[[default]].js)，
// 本地用父级 app 挂到 /api 下保持一致。
const root = express();
root.use("/api", app);

const port = Number(process.env.API_PORT || 8787);
root.listen(port, () => {
  console.log(`本地 API 已启动: http://127.0.0.1:${port}/api  (健康检查 /api/health)`);
});
