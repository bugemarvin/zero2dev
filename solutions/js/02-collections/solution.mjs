export function total(prices) {
  return prices.reduce((sum, price) => sum + price, 0);
}

export function names(users) {
  return users.map((user) => user.name);
}

export function adults(users) {
  return users.filter((user) => user.age >= 18);
}

export function byId(users) {
  const result = {};
  for (const user of users) {
    result[user.id] = user;
  }
  return result;
}

export function withDefaults(options) {
  return { theme: "light", fontSize: 14, sidebar: true, ...options };
}
