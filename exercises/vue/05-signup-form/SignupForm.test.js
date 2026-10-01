// Tests. Do not edit.
import { mount, flushPromises } from "@vue/test-utils";
import SignupForm from "./SignupForm.vue";

const errors = (wrapper) => wrapper.findAll("p.error").map((p) => p.text());

async function fill(wrapper, { name = "", email = "", plan, terms = false }) {
  await wrapper.find("#name").setValue(name);
  await wrapper.find("#email").setValue(email);
  if (plan) {
    await wrapper.find("#plan").setValue(plan);
  }
  await wrapper.find("#terms").setValue(terms);
}

test("the four fields exist, each with a label", () => {
  const wrapper = mount(SignupForm);
  for (const id of ["name", "email", "plan", "terms"]) {
    expect(wrapper.find("#" + id).exists(), `a field with the id ${id}`).toBe(true);
    expect(wrapper.find(`label[for="${id}"]`).exists(), `a label for ${id}`).toBe(true);
  }
});

test("the plan select has three options and starts on free", () => {
  const wrapper = mount(SignupForm);
  expect(wrapper.findAll("#plan option").map((o) => o.attributes("value"))).toEqual(["free", "pro", "team"]);
  expect(wrapper.find("#plan").element.value).toBe("free");
});

test("no errors are shown before the first submit", () => {
  expect(errors(mount(SignupForm))).toEqual([]);
});

test("submitting an empty form shows the three errors in order and emits nothing", async () => {
  const wrapper = mount(SignupForm);
  await wrapper.find("form").trigger("submit");
  expect(errors(wrapper)).toEqual(["Name is required", "Enter a valid email", "Accept the terms"]);
  expect(wrapper.emitted("submit")).toBeUndefined();
});

test("only the rules that are broken are reported", async () => {
  const wrapper = mount(SignupForm);
  await fill(wrapper, { name: "Sam", email: "not-an-email", terms: true });
  await wrapper.find("form").trigger("submit");
  expect(errors(wrapper)).toEqual(["Enter a valid email"]);
});

test("a name of only spaces counts as empty", async () => {
  const wrapper = mount(SignupForm);
  await fill(wrapper, { name: "   ", email: "sam@example.com", terms: true });
  await wrapper.find("form").trigger("submit");
  expect(errors(wrapper)).toEqual(["Name is required"]);
});

test("the errors disappear as the form is corrected", async () => {
  const wrapper = mount(SignupForm);
  await wrapper.find("form").trigger("submit");
  await fill(wrapper, { name: "Sam", email: "sam@example.com", terms: false });
  expect(errors(wrapper)).toEqual(["Accept the terms"]);
});

test("a valid form emits submit with the data and welcomes the user", async () => {
  const wrapper = mount(SignupForm);
  await fill(wrapper, { name: "  Sam  ", email: "sam@example.com", plan: "pro", terms: true });
  await wrapper.find("form").trigger("submit");
  expect(wrapper.emitted("submit")).toEqual([[{ name: "Sam", email: "sam@example.com", plan: "pro" }]]);
  expect(errors(wrapper)).toEqual([]);
  expect(wrapper.find("p.ok").text()).toBe("Welcome, Sam!");
});

test("there is a submit button", () => {
  const button = mount(SignupForm).find("button[type='submit']");
  expect(button.text()).toBe("Create account");
});
