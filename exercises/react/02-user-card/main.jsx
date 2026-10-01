// Shows your component in the browser (Start app). You may change it; the tests do not use it.
import { createRoot } from "react-dom/client";
import UserCard from "./UserCard.jsx";

const users = [
  { name: "Ada", role: "Engineer", admin: true, online: true },
  { name: "Tim", role: "Designer", admin: false, online: false },
];

createRoot(document.getElementById("root")).render(
  <>
    {users.map((user) => (
      <UserCard key={user.name} user={user} />
    ))}
  </>
);
