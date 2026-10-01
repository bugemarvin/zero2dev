---
title: GenServer
summary: The standard way to write a process that holds state and answers requests.
---

## From a hand-written loop to GenServer

The counter in the last lesson needed a receive loop, a message protocol, and care with replies. Every stateful process needs the same parts. **GenServer** ("generic server") supplies them. You write only what is specific to your server: how the state starts, and how each request changes it.

## A complete example

```elixir
defmodule Counter do
  use GenServer

  # ---- client API: runs in the caller's process ----

  def start_link(initial \\ 0) do
    GenServer.start_link(__MODULE__, initial)
  end

  def increment(pid), do: GenServer.cast(pid, :increment)

  def value(pid), do: GenServer.call(pid, :value)

  # ---- server callbacks: run inside the server process ----

  @impl true
  def init(initial) do
    {:ok, initial}
  end

  @impl true
  def handle_cast(:increment, count) do
    {:noreply, count + 1}
  end

  @impl true
  def handle_call(:value, _from, count) do
    {:reply, count, count}
  end
end
```

```elixir
{:ok, pid} = Counter.start_link(10)
Counter.increment(pid)
Counter.value(pid)        # 11
```

## The two halves

A GenServer module has two parts that run in **different processes**.

The **client API** is a set of ordinary functions that other code calls. They only send a request to the server.

The **callbacks** run inside the server process. GenServer calls them when a request arrives, passing in the current state.

`__MODULE__` is the name of the current module. `@impl true` tells the compiler that the next function implements a callback, so a misspelled name is reported.

## call and cast

| | `GenServer.call` | `GenServer.cast` |
| --- | --- | --- |
| Waits for a reply | yes | no |
| Handled by | `handle_call/3` | `handle_cast/2` |
| Use for | reading, or anything whose result or success you need | fire and forget |

When unsure, use `call`. It tells you that the request was really handled, and it naturally slows down a caller who sends faster than the server can work.

## What the callbacks return

| Callback | Arguments | Returns |
| --- | --- | --- |
| `init/1` | the argument given to `start_link` | `{:ok, state}` |
| `handle_call/3` | request, caller, state | `{:reply, reply, new_state}` |
| `handle_cast/2` | request, state | `{:noreply, new_state}` |
| `handle_info/2` | any other message, state | `{:noreply, new_state}` |

The state can be any value: a number, a list, a map, a struct. The last element of each return tuple is the state for the next request.

Match on the request in the function head to handle different requests, as with any function:

```elixir
@impl true
def handle_call(:pop, _from, [top | rest]) do
  {:reply, {:ok, top}, rest}
end

def handle_call(:pop, _from, []) do
  {:reply, :empty, []}
end

@impl true
def handle_cast({:push, item}, stack) do
  {:noreply, [item | stack]}
end
```

## One request at a time

A GenServer handles its messages strictly in order, one after another. Two callers can never change the state at the same moment. That is why no locks are needed.

It also means the server is a single lane. A slow callback holds up every other caller. Keep callbacks quick, and hand long work to a `Task`.

## Naming a server

Passing PIDs around gets awkward. A server can register under a name:

```elixir
GenServer.start_link(__MODULE__, initial, name: __MODULE__)

def value, do: GenServer.call(__MODULE__, :value)
```

## Supervisors

A **supervisor** is a process whose only job is to start other processes, watch them, and restart them when they crash.

```elixir
children = [
  {Counter, 0}
]

Supervisor.start_link(children, strategy: :one_for_one)
```

`:one_for_one` means: if a child dies, restart that child only. The restarted server begins again from `init`, in a clean state.

This is "let it crash" made practical. You do not write code to repair a broken state. You let the process die and start a fresh one. Supervisors can supervise other supervisors, forming a tree that keeps an application running through failures.

## Do you need a process?

Not for most code. A process is for something that must **exist over time**: state shared between callers, a connection, a periodic job, a resource that needs one owner. A calculation that turns input into output is a plain function in a plain module.

## Common mistakes

- **Doing the work in the client function.** It runs in the caller's process and cannot see the state.
- **Returning the wrong tuple shape** from a callback. The server crashes with a clear message.
- **Forgetting to return the new state.** Returning the old one silently discards the change.
- **`cast` when the caller needs to know it worked.**
- **A server calling itself with `GenServer.call`.** It waits for itself and times out.
