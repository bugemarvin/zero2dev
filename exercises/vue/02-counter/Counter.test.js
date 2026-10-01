// Tests. Do not edit.
import { mount, flushPromises } from "@vue/test-utils";
import Counter from "./Counter.vue";

function setup() {
  const wrapper = mount(Counter);
  const button = (name) => wrapper.findAll("button").find((b) => b.text() === name);
  return { wrapper, button };
}

test("it starts at 0, even, with double 0", () => {
  const { wrapper } = setup();
  expect(wrapper.find("p.count").text()).toBe("Count: 0");
  expect(wrapper.find("p.double").text()).toBe("Double: 0");
  expect(wrapper.find("p.parity").text()).toBe("even");
});

test("the three buttons exist", () => {
  const { button } = setup();
  expect(button("Add")).toBeTruthy();
  expect(button("Subtract")).toBeTruthy();
  expect(button("Reset")).toBeTruthy();
});

test("Add increases the count, and the computed values follow", async () => {
  const { wrapper, button } = setup();
  await button("Add").trigger("click");
  await button("Add").trigger("click");
  await button("Add").trigger("click");
  expect(wrapper.find("p.count").text()).toBe("Count: 3");
  expect(wrapper.find("p.double").text()).toBe("Double: 6");
  expect(wrapper.find("p.parity").text()).toBe("odd");
});

test("Subtract decreases the count", async () => {
  const { wrapper, button } = setup();
  await button("Add").trigger("click");
  await button("Add").trigger("click");
  await button("Subtract").trigger("click");
  expect(wrapper.find("p.count").text()).toBe("Count: 1");
});

test("Subtract is disabled at 0 and enabled above it", async () => {
  const { button } = setup();
  expect(button("Subtract").attributes("disabled")).toBeDefined();
  await button("Add").trigger("click");
  expect(button("Subtract").attributes("disabled")).toBeUndefined();
});

test("the count never goes below 0", async () => {
  const { wrapper, button } = setup();
  await button("Subtract").trigger("click");
  expect(wrapper.find("p.count").text()).toBe("Count: 0");
});

test("Reset goes back to 0", async () => {
  const { wrapper, button } = setup();
  await button("Add").trigger("click");
  await button("Add").trigger("click");
  await button("Reset").trigger("click");
  expect(wrapper.find("p.count").text()).toBe("Count: 0");
  expect(wrapper.find("p.parity").text()).toBe("even");
});
