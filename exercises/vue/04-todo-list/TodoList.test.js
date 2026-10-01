// Tests. Do not edit.
import { mount, flushPromises } from "@vue/test-utils";
import TodoList from "./TodoList.vue";

const todos = [
  { id: 1, title: "Buy milk", done: false },
  { id: 2, title: "Walk the dog", done: true },
  { id: 3, title: "Learn Vue", done: false },
];
const titles = (wrapper) => wrapper.findAll("li").map((li) => li.text().replace("Delete", "").trim());
const toggle = (wrapper) => wrapper.findAll("button").find((b) => b.text() === "Hide done" || b.text() === "Show done");

test("an empty list shows the message and no ul", () => {
  const wrapper = mount(TodoList, { props: { todos: [] } });
  expect(wrapper.find("p.empty").text()).toBe("Nothing to do.");
  expect(wrapper.find("ul").exists()).toBe(false);
  expect(wrapper.find("p.summary").exists()).toBe(false);
});

test("a list shows one li per todo and no empty message", () => {
  const wrapper = mount(TodoList, { props: { todos } });
  expect(titles(wrapper)).toEqual(["Buy milk", "Walk the dog", "Learn Vue"]);
  expect(wrapper.find("p.empty").exists()).toBe(false);
});

test("done todos have the class done", () => {
  const wrapper = mount(TodoList, { props: { todos } });
  expect(wrapper.findAll("li").map((li) => li.classes().includes("done"))).toEqual([false, true, false]);
});

test("the summary counts the done todos", () => {
  expect(mount(TodoList, { props: { todos } }).find("p.summary").text()).toBe("1 of 3 done");
});

test("Hide done removes the done todos from the list, Show done brings them back", async () => {
  const wrapper = mount(TodoList, { props: { todos } });
  expect(toggle(wrapper).text()).toBe("Hide done");
  await toggle(wrapper).trigger("click");
  expect(titles(wrapper)).toEqual(["Buy milk", "Learn Vue"]);
  expect(toggle(wrapper).text()).toBe("Show done");
  expect(wrapper.find("p.summary").text()).toBe("1 of 3 done");
  await toggle(wrapper).trigger("click");
  expect(titles(wrapper)).toEqual(["Buy milk", "Walk the dog", "Learn Vue"]);
});

test("Delete emits remove with the id", async () => {
  const wrapper = mount(TodoList, { props: { todos } });
  const deleteButtons = wrapper.findAll("li button");
  expect(deleteButtons).toHaveLength(3);
  await deleteButtons[2].trigger("click");
  await deleteButtons[0].trigger("click");
  expect(wrapper.emitted("remove")).toEqual([[3], [1]]);
});

test("the list follows the prop", async () => {
  const wrapper = mount(TodoList, { props: { todos } });
  await wrapper.setProps({ todos: [{ id: 9, title: "Rest", done: true }] });
  expect(titles(wrapper)).toEqual(["Rest"]);
  expect(wrapper.find("p.summary").text()).toBe("1 of 1 done");
});
