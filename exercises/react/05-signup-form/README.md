# A form with validation

Complete `SignupForm.jsx`.

`<SignupForm onSubmit={fn} />` renders a `<form>` with:

- a text input labelled `Email`
- a password input labelled `Password`
- a submit button `Sign up`

Both inputs are controlled: their values live in state.

When the form is submitted:

- If the email does not contain `@`, show `Enter a valid email address.` in an element with `role="alert"`.
- If the password has fewer than 8 characters, show `Password must be at least 8 characters.` in an element with `role="alert"`.
- If anything is invalid, `onSubmit` is **not** called.
- If everything is valid, call `onSubmit({ email, password })` once, clear both fields and remove any error messages.

No error is shown before the first attempt to submit. The page must not reload: call `event.preventDefault()`.

Run the tests to check your component. **Start app** opens it in a browser tab.
