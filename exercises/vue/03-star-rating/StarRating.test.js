// Tests. Do not edit.
import { mount, flushPromises } from "@vue/test-utils";
import StarRating from "./StarRating.vue";

test("it shows five stars by default, none active", () => {
  const wrapper = mount(StarRating);
  expect(wrapper.findAll("button.star")).toHaveLength(5);
  expect(wrapper.findAll("button.active")).toHaveLength(0);
  expect(wrapper.findAll("button.star").every((b) => b.text() === "★")).toBe(true);
});

test("max sets the number of stars", () => {
  expect(mount(StarRating, { props: { max: 3 } }).findAll("button.star")).toHaveLength(3);
  expect(mount(StarRating, { props: { max: 10 } }).findAll("button.star")).toHaveLength(10);
});

test("the stars up to value are active", () => {
  const stars = mount(StarRating, { props: { value: 3 } }).findAll("button.star");
  expect(stars.map((s) => s.classes().includes("active"))).toEqual([true, true, true, false, false]);
});

test("each star has an aria-label", () => {
  const labels = mount(StarRating, { props: { max: 3 } }).findAll("button.star").map((s) => s.attributes("aria-label"));
  expect(labels).toEqual(["1 star", "2 stars", "3 stars"]);
});

test("a click emits rate with the number of the star", async () => {
  const wrapper = mount(StarRating, { props: { value: 1 } });
  await wrapper.findAll("button.star")[3].trigger("click");
  await wrapper.findAll("button.star")[0].trigger("click");
  expect(wrapper.emitted("rate")).toEqual([[4], [1]]);
});

test("the component does not change the rating by itself", async () => {
  const wrapper = mount(StarRating, { props: { value: 1 } });
  await wrapper.findAll("button.star")[4].trigger("click");
  expect(wrapper.findAll("button.active")).toHaveLength(1);
});

test("when the parent passes a new value, the stars follow", async () => {
  const wrapper = mount(StarRating, { props: { value: 1 } });
  await wrapper.setProps({ value: 4 });
  expect(wrapper.findAll("button.active")).toHaveLength(4);
});

test("the label shows Rating by default, and the slot content when given", () => {
  expect(mount(StarRating).find("span.label").text()).toBe("Rating");
  expect(mount(StarRating, { slots: { default: "How was it?" } }).find("span.label").text()).toBe("How was it?");
});
