---
title: Forms
summary: Keep the value of every input in state, validate it, and handle the submit yourself.
---

## Controlled inputs

In React the usual way to handle an input is to make state the single source of truth. The input **shows** the state, and every keystroke **updates** it.

```jsx
function NameField() {
  const [name, setName] = useState("");

  return (
    <label>
      Name
      <input value={name} onChange={(event) => setName(event.target.value)} />
    </label>
  );
}
```

- `value={name}` makes the input display the state.
- `onChange` fires on every change. `event.target.value` is the new text.

Because the value lives in state, you can use it anywhere at any time: to validate, to enable a button, to show a preview.

An input with `value` and no `onChange` is frozen: the user cannot type in it.

| Element | Value prop | Read in onChange |
| --- | --- | --- |
| text input, textarea, select | `value` | `event.target.value` |
| checkbox | `checked` | `event.target.checked` |

## Labels

Every input needs a label. It tells users, and screen readers, what the field is for, and clicking it focuses the field. Either wrap the input in the `<label>`, or connect them by id:

```jsx
<label htmlFor="email">Email</label>
<input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
```

## Submitting

Put the fields in a `<form>` and handle its `submit` event. That way pressing Enter works as well as clicking the button.

```jsx
function SignupForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();               // stop the browser reloading the page
    onSubmit({ email, password });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit">Sign up</button>
    </form>
  );
}
```

## Validation

Validity can be **calculated** from the current values. It does not need its own state.

```jsx
const emailOk = email.includes("@");
const passwordOk = password.length >= 8;
const canSubmit = emailOk && passwordOk;

<button type="submit" disabled={!canSubmit}>Sign up</button>
```

Showing an error for a field the user has not touched yet is unfriendly. A common approach is to show errors only after the first attempt to submit:

```jsx
const [submitted, setSubmitted] = useState(false);

function handleSubmit(event) {
  event.preventDefault();
  setSubmitted(true);
  if (!canSubmit) {
    return;
  }
  onSubmit({ email, password });
}

{submitted && !emailOk && <p role="alert">Enter a valid email address.</p>}
```

`role="alert"` makes screen readers announce the message when it appears.

## Many fields in one object

```jsx
const [form, setForm] = useState({ name: "", email: "", city: "" });

function handleChange(event) {
  const { name, value } = event.target;
  setForm({ ...form, [name]: value });
}

<input name="email" value={form.email} onChange={handleChange} />
```

`[name]: value` uses the value of `name` as the property name. One handler serves every field, as long as each input has a `name` that matches the key.

## After a successful submit

Clear the form by resetting the state:

```jsx
setEmail("");
setPassword("");
setSubmitted(false);
```

## Validation here is for convenience

Checks in the browser help the user. They protect nothing: anyone can send a request to your server directly. The server must validate everything again.

## Common mistakes

- **`value` with no `onChange`.**
- **Forgetting `event.preventDefault()`**, so the page reloads and the state is lost.
- **Handling the button's click** in place of the form's submit. Enter then does nothing.
- **Inputs with no label.**
- **Storing "is valid" in state** when it follows from the values.
