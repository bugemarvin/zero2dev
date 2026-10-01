// Tests. Do not edit.
import { renderList, setupCounter, setupFilter } from "./dom.js";

function type(input, value) {
  input.value = value;
  input.dispatchEvent(new Event("input"));
}

test("renderList creates one ul with an li per item", () => {
  const container = document.createElement("div");
  renderList(container, ["Milk", "Bread", "Eggs"]);
  expect(container.children.length).toBe(1);
  expect(container.firstElementChild.tagName).toBe("UL");
  expect([...container.querySelectorAll("li")].map((li) => li.textContent)).toEqual(["Milk", "Bread", "Eggs"]);
});

test("renderList replaces what was there before", () => {
  const container = document.createElement("div");
  container.innerHTML = "<p>old</p>";
  renderList(container, ["a"]);
  renderList(container, ["b", "c"]);
  expect(container.querySelectorAll("ul").length).toBe(1);
  expect(container.querySelector("p")).toBe(null);
  expect([...container.querySelectorAll("li")].map((li) => li.textContent)).toEqual(["b", "c"]);
});

test("renderList handles an empty array", () => {
  const container = document.createElement("div");
  renderList(container, []);
  expect(container.querySelectorAll("li").length).toBe(0);
});

test("renderList shows text as text, not as HTML", () => {
  const container = document.createElement("div");
  renderList(container, ["<b>bold</b>"]);
  expect(container.querySelector("b")).toBe(null);
  expect(container.querySelector("li").textContent).toBe("<b>bold</b>");
});

test("setupCounter starts at 0 and counts clicks", () => {
  const button = document.createElement("button");
  const output = document.createElement("span");
  setupCounter(button, output);
  expect(output.textContent).toBe("0");
  button.click();
  button.click();
  button.click();
  expect(output.textContent).toBe("3");
});

test("two counters do not share their count", () => {
  const b1 = document.createElement("button");
  const o1 = document.createElement("span");
  const b2 = document.createElement("button");
  const o2 = document.createElement("span");
  setupCounter(b1, o1);
  setupCounter(b2, o2);
  b1.click();
  expect(o1.textContent).toBe("1");
  expect(o2.textContent).toBe("0");
});

test("setupFilter hides items that do not match", () => {
  const input = document.createElement("input");
  const list = document.createElement("ul");
  renderList(document.createElement("div"), []);
  for (const text of ["Apple", "Banana", "Pineapple"]) {
    const li = document.createElement("li");
    li.textContent = text;
    list.append(li);
  }
  setupFilter(input, list);
  type(input, "apple");
  expect([...list.children].map((li) => li.hidden)).toEqual([false, true, false]);
  type(input, "BAN");
  expect([...list.children].map((li) => li.hidden)).toEqual([true, false, true]);
});

test("setupFilter shows everything again when the input is empty", () => {
  const input = document.createElement("input");
  const list = document.createElement("ul");
  for (const text of ["one", "two"]) {
    const li = document.createElement("li");
    li.textContent = text;
    list.append(li);
  }
  setupFilter(input, list);
  type(input, "zzz");
  expect([...list.children].every((li) => li.hidden)).toBe(true);
  type(input, "");
  expect([...list.children].some((li) => li.hidden)).toBe(false);
});
