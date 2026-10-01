import { useEffect, useState } from "react";

export default function UserList({ url }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);

    async function load() {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`request failed: ${response.status}`);
        }
        const data = await response.json();
        if (!cancelled) {
          setUsers(data);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (failed) {
    return <p role="alert">Could not load users.</p>;
  }
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
