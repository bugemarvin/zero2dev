// Shows your component in the browser (Start app). You may change it; the tests do not use it.
import { createApp, h, ref } from "vue";
import SignupForm from "./SignupForm.vue";

createApp({
  setup() {
    const last = ref(null);
    return () => h("div", [
      h(SignupForm, { onSubmit: (data) => { last.value = data; } }),
      last.value ? h("pre", JSON.stringify(last.value, null, 2)) : null,
    ]);
  },
}).mount("#app");
