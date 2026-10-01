"use server";

import { revalidatePath } from "next/cache";
import { addTodo, deleteTodo } from "../lib/todos.js";

export async function createTodo(formData) {
  const title = String(formData.get("title") ?? "").trim();
  if (title === "") {
    return { error: "A title is required." };
  }
  if (title.length > 50) {
    return { error: "A title can have at most 50 characters." };
  }
  addTodo(title);
  revalidatePath("/todos");
  return { ok: true };
}

export async function removeTodo(id) {
  if (!deleteTodo(id)) {
    return { error: "No such todo." };
  }
  revalidatePath("/todos");
  return { ok: true };
}
