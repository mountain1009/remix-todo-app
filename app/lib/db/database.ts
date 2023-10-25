import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

export const connection = await mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "todo_app",
  password: "password",
  port: 3307,
});

export const db = drizzle(connection, { schema, mode: "default" });
