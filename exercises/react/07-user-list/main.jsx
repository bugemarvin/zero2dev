// Shows your component in the browser (Start app). You may change it; the tests do not use it.
import { createRoot } from "react-dom/client";
import UserList from "./UserList.jsx";

// There is no server here, so the preview answers the request itself, after a short wait.
const realFetch = window.fetch;
window.fetch = async (url) => {
  if (String(url) !== "/api/users") return realFetch(url);
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { ok: true, status: 200, json: async () => [{ id: 1, name: "Ada" }, { id: 2, name: "Linus" }, { id: 3, name: "Grace" }] };
};

createRoot(document.getElementById("root")).render(<UserList url="/api/users" />);
