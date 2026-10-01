// Tests. Do not edit.
import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import { ThemeProvider, useTheme, ThemeButton, ThemedBox } from "./theme.jsx";

test("the theme starts as light", () => {
  const { container } = render(<ThemeProvider><ThemeButton /><ThemedBox>hello</ThemedBox></ThemeProvider>);
  expect(screen.getByRole("button").textContent).toBe("Theme: light");
  expect(container.querySelector("div.box").className).toBe("box light");
  expect(screen.getByText("hello")).toBeTruthy();
});

test("clicking the button switches the theme everywhere under the provider", () => {
  const { container } = render(
    <ThemeProvider>
      <ThemeButton />
      <section><ThemedBox>one</ThemedBox><div><ThemedBox>two</ThemedBox></div></section>
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button").textContent).toBe("Theme: dark");
  expect([...container.querySelectorAll("div.box")].map((box) => box.className)).toEqual(["box dark", "box dark"]);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button").textContent).toBe("Theme: light");
});

test("two buttons under one provider stay in step", () => {
  render(<ThemeProvider><ThemeButton /><ThemeButton /></ThemeProvider>);
  fireEvent.click(screen.getAllByRole("button")[0]);
  expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Theme: dark", "Theme: dark"]);
});

test("two providers have separate themes", () => {
  render(<><ThemeProvider><ThemeButton /></ThemeProvider><ThemeProvider><ThemeButton /></ThemeProvider></>);
  fireEvent.click(screen.getAllByRole("button")[0]);
  expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Theme: dark", "Theme: light"]);
});

test("useTheme returns the theme and a toggle function", () => {
  const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
  expect(result.current.theme).toBe("light");
  expect(typeof result.current.toggleTheme).toBe("function");
});

test("useTheme outside a provider throws a helpful error", () => {
  const silence = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => renderHook(() => useTheme())).toThrow("useTheme must be used inside a ThemeProvider");
  silence.mockRestore();
});
