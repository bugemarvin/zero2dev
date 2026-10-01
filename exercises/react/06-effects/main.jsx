// Shows your component in the browser (Start app). You may change it; the tests do not use it.
import { createRoot } from "react-dom/client";
import Stopwatch, { DocumentTitle } from "./Timer.jsx";

createRoot(document.getElementById("root")).render(
  <>
    <DocumentTitle title="Stopwatch" />
    <Stopwatch />
  </>
);
