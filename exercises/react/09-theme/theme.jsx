import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  return children;
}

export function useTheme() {
  return { theme: "light", toggleTheme() {} };
}

export function ThemeButton() {
  return <button>Theme: light</button>;
}

export function ThemedBox({ children }) {
  return <div className="box light">{children}</div>;
}
