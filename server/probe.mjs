import "dotenv/config";
import mysql from "mysql2/promise";

const base = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectTimeout: 15000,
};

try {
  const conn = await mysql.createConnection(base); // 不指定 database
  const [who] = await conn.query("SELECT CURRENT_USER() AS cu, DATABASE() AS db");
  console.log("身份:", JSON.stringify(who[0]));
  const [dbs] = await conn.query("SHOW DATABASES");
  console.log("可见数据库:", dbs.map((d) => Object.values(d)[0]).join(", "));
  try {
    const [g] = await conn.query("SHOW GRANTS");
    console.log("授权:", g.map((x) => Object.values(x)[0]).join(" | "));
  } catch {}
  await conn.end();
} catch (e) {
  console.error("失败:", e.code || "", e.sqlMessage || e.message);
}
