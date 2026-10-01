export default async function UsersPage() {
  const response = await fetch(`${process.env.API_URL}/users`);
  if (!response.ok) {
    throw new Error("could not load users");
  }
  const users = await response.json();

  if (users.length === 0) {
    return <p>No users yet.</p>;
  }
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
