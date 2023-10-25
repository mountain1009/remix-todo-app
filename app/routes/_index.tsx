import { ActionFunction, json, type MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { db } from "~/lib/db/database";
import { todos } from "~/lib/db/schema";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useSubmit } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader() {
  const result = await db.query.todos.findMany({
    orderBy: (posts, { asc }) => [asc(posts.id)],
  });

  console.log(result);
  return json({ todos: result });
}

export default function Index() {
  const submit = useSubmit();

  const { todos } = useLoaderData<typeof loader>();

  const [todo, setTodo] = useState("");

  return (
    <div style={{ width: "30%", margin: "0 auto", textAlign: "center" }}>
      <h1 className="text-xl font-bold">Remix Todo</h1>
      <Form
        method="post"
        className="flex gap-2 items-center mb-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!todo) return;

          submit(event.currentTarget);
          setTodo("");
        }}
      >
        <Input
          name="title"
          type="text"
          value={todo}
          onChange={(e) => {
            setTodo(e.target.value);
          }}
        />
        <button type="submit">plus</button>
      </Form>
      <ul className="flex flex-col gap-3">
        {todos.map((todo) => (
          <li key={todo.id}>
            <div className="flex justify-between items-center w-full">
              <p
                style={{
                  textDecoration: todo.completed ? "line-through" : undefined,
                }}
                className="mr-2 underline"
              >
                {todo.title}
              </p>
              <div className="flex gap-2 items-center">
                <Form method="put" className="flex items-center">
                  <input hidden name="completed" defaultValue={todo.id} />
                  <Button className="font-bold">done</Button>
                </Form>
                <Form method="delete" className="flex items-center">
                  <input hidden name="delete" defaultValue={todo.id} />
                  <Button>🙅‍♀️</Button>
                </Form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export let action: ActionFunction = async ({ request }) => {
  if (request.method === "POST") {
    const data = new URLSearchParams(await request.text());
    const title = data.get("title") ?? "";
    await db.insert(todos).values({ title, completed: false });

    const result = await db.query.todos.findFirst({
      orderBy: (posts, { asc }) => [asc(posts.id)],
    });

    return json(result, {
      status: 201,
    });
  }
  if (request.method === "PUT") {
    const data = new URLSearchParams(await request.text());
    const todoId = data.get("completed");
    console.log(todoId);
    if (!todoId)
      return json(
        { error: "Todo id must be defined" },
        {
          status: 400,
        }
      );
    const todo = await db.query.todos.findFirst({
      where: (users, { eq }) => eq(users.id, parseInt(todoId)),
    });
    console.log(todo);
    if (!todo) {
      return json(
        { error: "Todo does not exist" },
        {
          status: 400,
        }
      );
    }
    await db
      .update(todos)
      .set({ completed: !todo.completed })
      .where(eq(todos.id, todo.id));

    const updatedTodo = await db.query.todos.findFirst({
      where: (todos, { eq }) => eq(todos.id, todo.id),
    });

    return json({ todo: updatedTodo }, { status: 200 });
  }
  if (request.method === "DELETE") {
    const data = new URLSearchParams(await request.text());
    const todoId = data.get("delete");
    console.log(todoId);
    if (!todoId)
      return json(
        { error: "Todo id must be defined" },
        {
          status: 400,
        }
      );
    const todo = await db.query.todos.findFirst({
      where: (users, { eq }) => eq(users.id, parseInt(todoId)),
    });
    console.log(todo);
    if (!todo) {
      return json(
        { error: "Todo does not exist" },
        {
          status: 400,
        }
      );
    }

    await db.delete(todos).where(eq(todos.id, todo.id));
    const deletedTodo = await db.query.todos.findFirst({
      where: (todos, { eq }) => eq(todos.id, todo.id),
    });
    return json({ todo: deletedTodo }, { status: 200 });
  }
  return null;
};
