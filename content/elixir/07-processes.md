---
title: Processes and messages
summary: Elixir's model of concurrency. Lightweight processes that share nothing and talk by sending messages.
---

## Processes

An Elixir **process** is not an operating system process. It is a very small, independent unit of execution managed by the virtual machine. One costs a few kilobytes and starts in microseconds. Running hundreds of thousands at once is normal.

Three rules define them:

1. **They share no memory.** One process cannot touch another's data.
2. **They communicate only by messages.** Each process has a mailbox.
3. **They fail independently.** A crash in one does not corrupt the others.

Because nothing is shared, the bugs that haunt threads in other languages, where two pieces of code change the same data at once, cannot happen here.

## spawn

```elixir
pid = spawn(fn -> IO.puts("hello from another process") end)
```

`spawn` starts a process that runs the given function and returns its **process identifier** (PID) at once, without waiting. When the function finishes, the process ends.

`self()` is the PID of the current process.

## send and receive

```elixir
send(self(), {:greeting, "hi"})

receive do
  {:greeting, text} -> IO.puts("got: #{text}")
end
```

- `send(pid, message)` puts a message in a mailbox and returns immediately. The message can be any value.
- `receive` waits until a message matching one of its patterns arrives, then runs that branch.

Add a timeout so a process does not wait for ever:

```elixir
receive do
  {:greeting, text} -> text
after
  1000 -> :nothing_arrived
end
```

## Asking another process

A process answers by sending a message back, so the request must say who is asking:

```elixir
parent = self()

spawn(fn ->
  result = 6 * 7
  send(parent, {:answer, result})
end)

receive do
  {:answer, n} -> IO.puts("the answer is #{n}")
end
```

`self()` is captured in `parent` **outside** the function. Inside the spawned function, `self()` would be the new process.

## A process that keeps state

Data is immutable, so how does anything remember a value? A process runs a function that **calls itself with the new state**, for ever.

```elixir
defmodule Counter do
  def start(initial) do
    spawn(fn -> loop(initial) end)
  end

  defp loop(count) do
    receive do
      :increment ->
        loop(count + 1)

      {:value, caller} ->
        send(caller, {:count, count})
        loop(count)
    end
  end
end
```

```elixir
pid = Counter.start(0)
send(pid, :increment)
send(pid, :increment)
send(pid, {:value, self()})

receive do
  {:count, n} -> n
end
# 2
```

The state is the argument of `loop`. Each message produces the next state. The recursive call is in tail position, so this runs indefinitely in constant memory. Messages are handled one at a time, in order, so the count is never corrupted however many processes send to it.

Wrap the message passing in functions, so users of the module never see the protocol:

```elixir
def increment(pid), do: send(pid, :increment)

def value(pid) do
  send(pid, {:value, self()})

  receive do
    {:count, n} -> n
  end
end
```

## Tasks

For "run this in the background and give me the result", use `Task`:

```elixir
task = Task.async(fn -> slow_computation() end)
other_work()
result = Task.await(task)
```

Running the same function over a list, concurrently:

```elixir
urls
|> Enum.map(fn url -> Task.async(fn -> fetch(url) end) end)
|> Enum.map(&Task.await/1)
```

All the tasks start first. Then the results are collected in the original order. Ten jobs of one second each finish in about one second.

## Let it crash

In most languages you defend against every possible error. Elixir takes a different approach: a process that reaches a state it cannot handle should **crash**, and another process, a **supervisor**, restarts it in a known good state.

`spawn_link` ties two processes together, so that if one dies the other is told. Supervisors are built on that, and you will meet them with GenServer in the next lesson. This is how systems written for the BEAM stay up for years.

## Common mistakes

- **Calling `self()` inside the spawned function** when you meant the parent.
- **A `receive` with no matching message and no `after`.** The process waits for ever.
- **Forgetting the recursive call** in a loop. The process handles one message and exits.
- **Expecting an immediate reply.** `send` never waits. You must `receive` the answer.
