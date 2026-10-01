import { useState } from "react";

export default function SignupForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emailOk = email.includes("@");
  const passwordOk = password.length >= 8;

  function handleSubmit(event) {
    event.preventDefault();
    if (!emailOk || !passwordOk) {
      setSubmitted(true);
      return;
    }
    onSubmit({ email, password });
    setEmail("");
    setPassword("");
    setSubmitted(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input type="text" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      {submitted && !emailOk && <p role="alert">Enter a valid email address.</p>}
      <label>
        Password
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      {submitted && !passwordOk && <p role="alert">Password must be at least 8 characters.</p>}
      <button type="submit">Sign up</button>
    </form>
  );
}
