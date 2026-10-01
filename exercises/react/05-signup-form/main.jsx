// Shows your component in the browser (Start app). You may change it; the tests do not use it.
import { createRoot } from "react-dom/client";
import SignupForm from "./SignupForm.jsx";

createRoot(document.getElementById("root")).render(
  <SignupForm onSubmit={(values) => alert("Submitted: " + JSON.stringify(values))} />
);
