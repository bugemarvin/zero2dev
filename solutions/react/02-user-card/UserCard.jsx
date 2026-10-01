export function Card({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function UserCard({ user }) {
  return (
    <Card title={user.name}>
      <p>{user.role ?? "No role"}</p>
      {user.admin && <span className="badge">Admin</span>}
      <p>{user.online ? "Online" : "Offline"}</p>
    </Card>
  );
}
