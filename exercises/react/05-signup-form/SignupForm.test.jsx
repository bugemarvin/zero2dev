// Tests. Do not edit.
import { render, screen, fireEvent } from "@testing-library/react";
import SignupForm from "./SignupForm.jsx";

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

test("the form has labelled Email and Password fields", () => {
  render(<SignupForm onSubmit={() => {}} />);
  expect(screen.getByLabelText("Email").tagName).toBe("INPUT");
  expect(screen.getByLabelText("Password").type).toBe("password");
});

test("typing updates the fields", () => {
  render(<SignupForm onSubmit={() => {}} />);
  type("Email", "ada@example.org");
  type("Password", "secret123");
  expect(screen.getByLabelText("Email").value).toBe("ada@example.org");
  expect(screen.getByLabelText("Password").value).toBe("secret123");
});

test("no errors are shown before submitting", () => {
  render(<SignupForm onSubmit={() => {}} />);
  type("Email", "nope");
  expect(screen.queryAllByRole("alert").length).toBe(0);
});

test("a valid form calls onSubmit once with the values", () => {
  const onSubmit = vi.fn();
  render(<SignupForm onSubmit={onSubmit} />);
  type("Email", "ada@example.org");
  type("Password", "secret123");
  submit();
  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith({ email: "ada@example.org", password: "secret123" });
});

test("the fields are cleared after a successful submit", () => {
  render(<SignupForm onSubmit={() => {}} />);
  type("Email", "ada@example.org");
  type("Password", "secret123");
  submit();
  expect(screen.getByLabelText("Email").value).toBe("");
  expect(screen.getByLabelText("Password").value).toBe("");
  expect(screen.queryAllByRole("alert").length).toBe(0);
});

test("an invalid email shows an error and does not submit", () => {
  const onSubmit = vi.fn();
  render(<SignupForm onSubmit={onSubmit} />);
  type("Email", "not-an-email");
  type("Password", "secret123");
  submit();
  expect(screen.getByRole("alert").textContent).toBe("Enter a valid email address.");
  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Email").value).toBe("not-an-email");
});

test("a short password shows an error and does not submit", () => {
  const onSubmit = vi.fn();
  render(<SignupForm onSubmit={onSubmit} />);
  type("Email", "ada@example.org");
  type("Password", "short");
  submit();
  expect(screen.getByRole("alert").textContent).toBe("Password must be at least 8 characters.");
  expect(onSubmit).not.toHaveBeenCalled();
});

test("both errors can show at once, and go away when the form is fixed", () => {
  const onSubmit = vi.fn();
  render(<SignupForm onSubmit={onSubmit} />);
  submit();
  expect(screen.getAllByRole("alert").length).toBe(2);
  type("Email", "ada@example.org");
  type("Password", "longenough");
  submit();
  expect(screen.queryAllByRole("alert").length).toBe(0);
  expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("submitting the form does not reload the page", () => {
  const { container } = render(<SignupForm onSubmit={() => {}} />);
  const event = new Event("submit", { bubbles: true, cancelable: true });
  container.querySelector("form").dispatchEvent(event);
  expect(event.defaultPrevented, "call event.preventDefault() in the submit handler").toBe(true);
});
