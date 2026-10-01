# A stack server

Write the module `Stack` in `solution.ex` as a `GenServer` whose state is a list.

Client functions:

- `Stack.start_link(initial \\ [])` starts the server and returns `{:ok, pid}`. The first element of `initial` is the top of the stack.
- `Stack.push(pid, item)` puts an item on top. It returns `:ok`.
- `Stack.pop(pid)` removes the top item and returns `{:ok, item}`, or `:empty` when there is nothing to pop.
- `Stack.peek(pid)` returns `{:ok, item}` without removing it, or `:empty`.
- `Stack.size(pid)` returns the number of items.

```elixir
{:ok, pid} = Stack.start_link([1, 2])
Stack.push(pid, 0)
Stack.pop(pid)       # {:ok, 0}
Stack.size(pid)      # 2
```

Use `GenServer.call` for the functions that return something, and write the matching `handle_call` clauses.
