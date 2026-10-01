// Shows your component in the browser (Start app). You may change it; the tests do not use it.
import { createApp, h, ref } from "vue";
import StarRating from "./StarRating.vue";

createApp({
  setup() {
    const stars = ref(2);
    return () => h("div", { class: "card" }, [
      h(StarRating, { value: stars.value, onRate: (n) => { stars.value = n; } }, () => "How was the lesson?"),
      h("p", `You gave ${stars.value} of 5.`),
    ]);
  },
}).mount("#app");
