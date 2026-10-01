// Tests. Do not edit.
import { mount, flushPromises } from "@vue/test-utils";
import ProfileCard from "./ProfileCard.vue";

test("the name is in an h2", () => {
  expect(mount(ProfileCard).find("h2").text()).toBe("Ada Lovelace");
});

test("the role is in a paragraph with the class role", () => {
  expect(mount(ProfileCard).find("p.role").text()).toBe("Role: Engineer");
});

test("the image has its src and alt bound", () => {
  const img = mount(ProfileCard).find("img");
  expect(img.attributes("src")).toBe("ada.jpg");
  expect(img.attributes("alt")).toBe("Ada Lovelace");
});

test("the link goes to the site", () => {
  const link = mount(ProfileCard).find("a");
  expect(link.text()).toBe("Website");
  expect(link.attributes("href")).toBe("https://example.com/ada");
});

test("the button starts as Follow", () => {
  expect(mount(ProfileCard).find("button").text()).toBe("Follow");
});

test("a click switches the button to Following, and back", async () => {
  const button = mount(ProfileCard).find("button");
  await button.trigger("click");
  expect(button.text()).toBe("Following");
  await button.trigger("click");
  expect(button.text()).toBe("Follow");
});

test("two cards do not share their state", async () => {
  const first = mount(ProfileCard);
  const second = mount(ProfileCard);
  await first.find("button").trigger("click");
  expect(first.find("button").text()).toBe("Following");
  expect(second.find("button").text()).toBe("Follow");
});
