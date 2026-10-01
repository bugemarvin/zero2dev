# A counter process and a parallel map

`solution.ex` holds two modules. Build them from `spawn`, `send` and `receive`. Do not use `GenServer` or `Agent` here: the next lesson is about those.

## `Counter`

A process that holds a number.

- `Counter.start(initial)` starts the process and returns its PID.
- `Counter.increment(pid)` adds one. It does not wait for a reply.
- `Counter.value(pid)` asks the process for its current number and returns it.

```elixir
pid = Counter.start(10)
Counter.increment(pid)
Counter.value(pid)      # 11
```

## `Parallel`

- `Parallel.map(list, fun)` returns the same result as `Enum.map(list, fun)`, with every call to `fun` running in its **own process at the same time**. The results are in the original order.

Five calls that each sleep for 200 ms must finish in well under a second. You may use `Task.async` and `Task.await`, or `spawn` with `send` and `receive`.
