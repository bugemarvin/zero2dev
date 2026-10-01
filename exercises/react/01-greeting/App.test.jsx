// Tests. Do not edit.
import { render, screen } from "@testing-library/react";
import App, { Footer } from "./App.jsx";

test("App shows the heading", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Hello, React!");
});

test("App shows the paragraph with the class lead", () => {
  const { container } = render(<App />);
  const lead = container.querySelector("p.lead");
  expect(lead, "no <p className=\"lead\"> found").not.toBe(null);
  expect(lead.textContent).toBe("This is my first component.");
});

test("Footer renders a footer element", () => {
  const { container } = render(<Footer />);
  const footer = container.querySelector("footer");
  expect(footer, "Footer should return a <footer> element").not.toBe(null);
  expect(footer.textContent).toBe("Made with React");
});

test("App uses the Footer component", () => {
  const { container } = render(<App />);
  expect(container.querySelectorAll("footer").length).toBe(1);
  expect(container.querySelector("footer").textContent).toBe("Made with React");
});
