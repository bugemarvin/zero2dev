import { ref } from "vue";

export function useToggle(initial = false) {
  const on = ref(initial);

  function toggle() {
    on.value = !on.value;
  }

  return { on, toggle };
}
