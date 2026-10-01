# A sign-up form

Write `SignupForm.vue`.

## Fields

Each field has a `label` whose `for` matches the field's `id`.

- A text input with the id `name`, bound with `v-model.trim`.
- An input with the id `email`, bound with `v-model.trim`.
- A `select` with the id `plan` and the options `free`, `pro` and `team` (these are the `value`s). It starts on `free`.
- A checkbox with the id `terms`.

## Rules

- The name must not be empty. Otherwise the error is `Name is required`.
- The email must contain `@`. Otherwise the error is `Enter a valid email`.
- The terms must be accepted. Otherwise the error is `Accept the terms`.

Errors are shown **only after the first attempt to submit**. Each one is a paragraph with the class `error`, and they appear in the order name, email, terms.

## Submitting

The form has a submit button with the text `Create account`.

- When something is wrong, submitting shows the errors and emits nothing.
- When everything is right, it emits `submit` with an object `{ name, email, plan }`, and shows a paragraph with the class `ok` and the text `Welcome, NAME!`.

Run the tests to check your component. **Start app** opens it in a browser tab, and the page reloads when you save.
