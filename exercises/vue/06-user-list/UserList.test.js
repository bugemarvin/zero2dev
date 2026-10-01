// Tests. Do not edit.
import { mount, flushPromises } from "@vue/test-utils";
import { isRef } from "vue";
import UserList from "./UserList.vue";
import { useToggle } from "./useToggle.js";

const people = [{ id: 1, name: "Ada" }, { id: 2, name: "Linus" }];
const button = (wrapper, ...names) => wrapper.findAll("button").find((b) => names.includes(b.text()));

test("useToggle returns a ref and a function", () => {
  const { on, toggle } = useToggle();
  expect(isRef(on)).toBe(true);
  expect(on.value).toBe(false);
  toggle();
  expect(on.value).toBe(true);
  toggle();
  expect(on.value).toBe(false);
});

test("useToggle starts at the value it is given, and each call has its own state", () => {
  const first = useToggle(true);
  const second = useToggle(true);
  first.toggle();
  expect(first.on.value).toBe(false);
  expect(second.on.value).toBe(true);
});

test("it shows Loading while waiting, then the users", async () => {
  let finish;
  const load = () => new Promise((resolve) => { finish = resolve; });
  const wrapper = mount(UserList, { props: { load } });
  await flushPromises();
  expect(wrapper.find("p.loading").text()).toBe("Loading ...");
  expect(wrapper.find("ul").exists()).toBe(false);
  finish(people);
  await flushPromises();
  expect(wrapper.find("p.loading").exists()).toBe(false);
  expect(wrapper.findAll("li").map((li) => li.text())).toEqual(["Ada", "Linus"]);
});

test("load is called once when the component is mounted", async () => {
  let calls = 0;
  mount(UserList, { props: { load: async () => { calls++; return people; } } });
  await flushPromises();
  expect(calls).toBe(1);
});

test("a failure shows the message as an alert, and no list", async () => {
  const wrapper = mount(UserList, { props: { load: async () => { throw new Error("server is down"); } } });
  await flushPromises();
  expect(wrapper.find('[role="alert"]').text()).toBe("Could not load: server is down");
  expect(wrapper.find("ul").exists()).toBe(false);
  expect(wrapper.find("p.loading").exists()).toBe(false);
});

test("Reload calls load again and recovers from an error", async () => {
  let calls = 0;
  const load = async () => {
    calls++;
    if (calls === 1) {
      throw new Error("try again");
    }
    return people;
  };
  const wrapper = mount(UserList, { props: { load } });
  await flushPromises();
  expect(wrapper.find('[role="alert"]').exists()).toBe(true);
  await button(wrapper, "Reload").trigger("click");
  await flushPromises();
  expect(calls).toBe(2);
  expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  expect(wrapper.findAll("li")).toHaveLength(2);
});

test("Reload shows Loading while it waits", async () => {
  let finish;
  let calls = 0;
  const load = () => { calls++; return calls === 1 ? Promise.resolve(people) : new Promise((resolve) => { finish = resolve; }); };
  const wrapper = mount(UserList, { props: { load } });
  await flushPromises();
  await button(wrapper, "Reload").trigger("click");
  await flushPromises();
  expect(wrapper.find("p.loading").exists()).toBe(true);
  finish([{ id: 3, name: "Grace" }]);
  await flushPromises();
  expect(wrapper.findAll("li").map((li) => li.text())).toEqual(["Grace"]);
});

test("the list can be hidden and shown", async () => {
  const wrapper = mount(UserList, { props: { load: async () => people } });
  await flushPromises();
  expect(button(wrapper, "Hide list", "Show list").text()).toBe("Hide list");
  await button(wrapper, "Hide list", "Show list").trigger("click");
  expect(wrapper.find("ul").exists()).toBe(false);
  expect(button(wrapper, "Hide list", "Show list").text()).toBe("Show list");
  await button(wrapper, "Hide list", "Show list").trigger("click");
  expect(wrapper.findAll("li")).toHaveLength(2);
});
