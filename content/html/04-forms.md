---
title: Forms
summary: Collect input: fields, labels, choices, buttons, and the checks the browser does for you.
---

## A form

```html
<form action="/signup" method="post">
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required>

  <button type="submit">Sign up</button>
</form>
```

- `action` is the address the data is sent to. `method` is `get` (the data goes in the address, for searches) or `post` (the data goes in the body, for anything that changes something).
- When the form is submitted, the browser sends one `name=value` pair for every field that has a **`name`**. A field with no `name` is not sent.

## Labels

Every field needs a label, and the label must be **connected** to the field:

```html
<label for="email">Email</label>
<input type="email" id="email" name="email">
```

The `for` of the label equals the `id` of the field. Then:

- clicking the label puts the cursor in the field, a bigger target on a phone;
- a screen reader says "Email, edit text" in place of just "edit text".

A `placeholder` is not a label. It disappears as soon as the user types.

## Input types

The `type` chooses the keyboard on a phone and the check the browser applies:

| Type | For |
| --- | --- |
| `text` | one line of text (the default) |
| `email` | an email address |
| `password` | hidden characters |
| `number` | a number, with `min`, `max`, `step` |
| `date` | a date picker |
| `checkbox` | on or off |
| `radio` | one choice out of several |
| `file` | a file to upload |

## Choices

Radio buttons that share a `name` form one group: only one can be chosen.

```html
<fieldset>
  <legend>Plan</legend>
  <input type="radio" id="basic" name="plan" value="basic" checked>
  <label for="basic">Basic</label>
  <input type="radio" id="pro" name="plan" value="pro">
  <label for="pro">Pro</label>
</fieldset>
```

`fieldset` groups related fields and `legend` names the group.

A drop-down list:

```html
<label for="country">Country</label>
<select id="country" name="country">
  <option value="">Choose one</option>
  <option value="ke">Kenya</option>
  <option value="ug">Uganda</option>
</select>
```

Several lines of text:

```html
<label for="message">Message</label>
<textarea id="message" name="message" rows="4"></textarea>
```

A checkbox:

```html
<input type="checkbox" id="terms" name="terms" required>
<label for="terms">I accept the terms</label>
```

## Validation by the browser

| Attribute | Rule |
| --- | --- |
| `required` | must not be empty |
| `minlength`, `maxlength` | length of the text |
| `min`, `max` | range of a number or date |
| `pattern` | a regular expression the text must match |

The browser refuses to submit and shows a message next to the first wrong field. This is a convenience for the user. It is **not security**: anyone can send a request without your form, so the server must check everything again.

## Buttons

```html
<button type="submit">Send</button>
<button type="button">Does nothing by itself: for JavaScript</button>
```

A `button` inside a form is a submit button unless you say `type="button"`.

## Common mistakes

- **A field with no `name`.** Its value is never sent.
- **A label that is not connected**: no `for`, or a `for` that matches no `id`.
- **Using a placeholder as the label.**
- **Radio buttons with different names**, so all of them can be selected.
- **Trusting browser validation** on the server.
