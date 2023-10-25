import type { Config } from "drizzle-kit";

export default {
  schema: "./app/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: "localhost",
    user: "root",
    password: "password",
    database: "todo_app",
    port: 3307,
  },
  driver: "mysql2",
} satisfies Config;
