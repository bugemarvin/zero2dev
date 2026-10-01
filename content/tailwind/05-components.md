---
title: Reuse without repeating classes
summary: Components first, @apply second, and how to keep long class lists readable.
---

## The problem

A button with twelve classes is fine once. The page has nine buttons.

```html
<button class="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">Order</button>
<button class="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">Save</button>
<button class="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">Send</button>
```

Change the radius, and you edit nine places and forget one.

## First answer: a component

With React, Vue or any template system, the repetition disappears where it should: in the **markup**.

```jsx
function Button({ children }) {
  return (
    <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
      {children}
    </button>
  );
}
```

```jsx
<Button>Order</Button>
<Button>Save</Button>
```

The classes are written once. This is the approach Tailwind is designed for, and in a component framework it is nearly always the right one. A loop over data does the same job for lists.

## Second answer: @apply

In plain HTML there are no components. There you can give a set of utilities a name in your CSS file:

```css
@import "tailwindcss";

@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-semibold;
  }

  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }
}
```

```html
<button class="btn btn-primary">Order</button>
```

- `@apply` copies the declarations of those utilities into your rule. Variants work inside it.
- `@layer components` places the rules **before** the utilities in the cascade. So a utility on the element still wins: `class="btn px-8"` gets the wider padding.

## Do not rebuild CSS with it

`@apply` everywhere brings back what Tailwind removed: names to invent, a stylesheet that grows, and styles far from the markup. Keep it for a few small, much-repeated things: buttons, form inputs, badges. Everything else stays in the markup.

## Variants of a component

A component usually has a few looks. Keep each look as one complete list, and choose between them:

```jsx
const looks = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  quiet: "bg-transparent text-blue-600 hover:bg-blue-50",
};

function Button({ look = "primary", children }) {
  return <button className={"px-4 py-2 rounded-md font-semibold " + looks[look]}>{children}</button>;
}
```

Every class name is complete in the source, so Tailwind finds them all.

## Keeping class lists readable

- **A fixed order.** The official Prettier plugin sorts classes for you, the same way in every file.
- **One concern per line** in long lists: layout, then spacing, then colour, then states.
- **The editor extension** (Tailwind CSS IntelliSense) completes names and shows the CSS behind each class.

## When Tailwind fits, and when it does not

| Fits well | Fits less well |
| --- | --- |
| applications built from components | long articles of plain HTML from a CMS |
| teams that want one consistent scale | a design with many unique, one-off pages |
| fast changes to the look | people who are still learning CSS itself |

For text that you do not control, such as a blog post rendered from Markdown, the Typography plugin styles it with one class, `prose`.

Tailwind and [Sass](scss/01-variables) answer the same question differently. Sass keeps the styles in stylesheets and gives you tools to organise them. Tailwind moves the styles into the markup and lets components organise them. Many teams have a strong opinion. Knowing both lets you work in either kind of project.

## Common mistakes

- **`@apply` for everything**, ending with a hand-written stylesheet again.
- **Copying a long class list** to a tenth place in a project that has components.
- **Component classes outside `@layer components`**, which then beat the utilities.
- **Building class names from pieces** for the variants of a component.
- **No class sorting**, so every file orders them differently.
