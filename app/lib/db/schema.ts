import {
  mysqlTable,
  serial,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/mysql-core";

export const todos = mysqlTable("todo", {
  id: serial("id"),
  title: text("title"),
  completed: boolean("completed"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
