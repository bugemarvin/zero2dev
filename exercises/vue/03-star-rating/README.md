# A star rating

Write `StarRating.vue`: a row of star buttons.

## Props

- `value`: a number, the current rating. Default 0.
- `max`: a number, how many stars. Default 5.

## Template

- One `button` per star, each with the text `★` and the class `star`.
- The stars up to and including `value` also have the class `active`.
- Each button has an `aria-label`: `1 star` for the first, `2 stars`, `3 stars` and so on.
- Before the stars, a `span` with the class `label` holds a **slot**. When the parent gives no content, it shows `Rating`.

## Event

A click on star number N emits the event `rate` with the number N. The component does not change `value` itself: that belongs to the parent.

Run the tests to check your component. **Start app** opens it in a browser tab, and the page reloads when you save.
