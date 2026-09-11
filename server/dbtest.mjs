import "dotenv/config";
import mysql from "mysql2/promise";

const cfg = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 15000,
};

console.log("尝试连接:", cfg.host, ":", cfg.port, "库:", cfg.database, "用户:", cfg.user);

try {
  const conn = await mysql.createConnection(cfg);
  const [rows] = await conn.query("SELECT VERSION() AS v, NOW() AS now");
  console.log("连接成功:", JSON.stringify(rows[0]));
  const [tables] = await conn.query("SHOW TABLES");
  console.log("现有表:", tables.map((t) => Object.values(t)[0]).join(", ") || "(无)");
  await conn.end();
  process.exit(0);
} catch (e) {
  console.error("连接失败:", e.code || "", e.sqlMessage || e.message);
  process.exit(1);
}
