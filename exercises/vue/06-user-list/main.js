// Shows your component in the browser (Start app). You may change it; the tests do not use it.
import { createApp, h } from "vue";
import UserList from "./UserList.vue";

let attempt = 0;
async function load() {
  attempt++;
  await new Promise((resolve) => setTimeout(resolve, 800));
  if (attempt % 3 === 0) {
    throw new Error("the pretend server failed, press Reload");
  }
  return [{ id: 1, name: "Ada" }, { id: 2, name: "Linus" }, { id: 3, name: "Grace" }];
}

createApp({ render: () => h(UserList, { load }) }).mount("#app");
