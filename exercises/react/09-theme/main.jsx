// Shows your component in the browser (Start app). You may change it; the tests do not use it.
import { createRoot } from "react-dom/client";
import { ThemeButton, ThemedBox, ThemeProvider } from "./theme.jsx";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <ThemeButton />
    <ThemedBox>
      <p>This box follows the theme.</p>
    </ThemedBox>
  </ThemeProvider>
);
