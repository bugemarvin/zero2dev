export function renderList(container, items) {
  const ul = document.createElement("ul");
  for (const text of items) {
    const li = document.createElement("li");
    li.textContent = text;
    ul.append(li);
  }
  container.replaceChildren(ul);
}

export function setupCounter(button, output) {
  let count = 0;
  output.textContent = String(count);
  button.addEventListener("click", () => {
    count += 1;
    output.textContent = String(count);
  });
}

export function setupFilter(input, list) {
  input.addEventListener("input", () => {
    const wanted = input.value.toLowerCase();
    for (const item of list.children) {
      item.hidden = !item.textContent.toLowerCase().includes(wanted);
    }
  });
}
