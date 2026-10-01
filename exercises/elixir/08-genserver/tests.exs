# Test file. Do not edit. You can run it yourself:  elixir -r solution.ex tests.exs

defmodule Z2D.Formatter do
  # Prints one line per test, in the form the zero2dev checker reads.
  use GenServer

  def init(_opts), do: {:ok, nil}

  def handle_cast({:test_finished, %ExUnit.Test{name: name, state: nil}}, state) do
    IO.puts("ok - #{label(name)}")
    {:noreply, state}
  end

  def handle_cast({:test_finished, %ExUnit.Test{name: name, state: {:failed, failures}}}, state) do
    IO.puts("not ok - #{label(name)}: #{failures |> Enum.map(&describe/1) |> Enum.join(" | ")}")
    {:noreply, state}
  end

  def handle_cast(_event, state), do: {:noreply, state}

  defp label(name), do: name |> Atom.to_string() |> String.replace_prefix("test ", "")

  defp describe({:error, %ExUnit.AssertionError{} = error, _stack}) do
    none = ExUnit.AssertionError.no_value()

    details =
      [code: error.expr, left: error.left, right: error.right]
      |> Enum.reject(fn {_key, value} -> value == none end)
      |> Enum.map(fn
        {:code, value} when is_binary(value) -> "code: #{value}"
        {:code, value} -> "code: #{Macro.to_string(value)}"
        {key, value} -> "#{key}: #{inspect(value)}"
      end)

    one_line(Enum.join([to_string(error.message) | details], "; "))
  end

  defp describe({:error, %{__exception__: true} = error, _stack}) do
    one_line("#{inspect(error.__struct__)}: #{Exception.message(error)}")
  end

  defp describe({kind, reason, _stack}), do: one_line("#{kind}: #{inspect(reason)}")

  defp one_line(text), do: text |> String.split() |> Enum.join(" ") |> String.slice(0, 400)
end

ExUnit.start(formatters: [Z2D.Formatter], seed: 0)

defmodule SolutionTest do
  use ExUnit.Case

  test "start_link/0 starts an empty stack" do
    assert {:ok, pid} = Stack.start_link()
    assert is_pid(pid)
    assert Stack.size(pid) == 0
  end

  test "start_link/1 takes the initial items, top first" do
    {:ok, pid} = Stack.start_link([1, 2, 3])
    assert Stack.size(pid) == 3
    assert Stack.pop(pid) == {:ok, 1}
  end

  test "push/2 returns :ok and puts the item on top" do
    {:ok, pid} = Stack.start_link()
    assert Stack.push(pid, :a) == :ok
    assert Stack.push(pid, :b) == :ok
    assert Stack.size(pid) == 2
    assert Stack.peek(pid) == {:ok, :b}
  end

  test "pop/1 returns items in reverse order of pushing" do
    {:ok, pid} = Stack.start_link()
    Stack.push(pid, 1)
    Stack.push(pid, 2)
    Stack.push(pid, 3)
    assert Stack.pop(pid) == {:ok, 3}
    assert Stack.pop(pid) == {:ok, 2}
    assert Stack.pop(pid) == {:ok, 1}
  end

  test "pop/1 and peek/1 return :empty on an empty stack" do
    {:ok, pid} = Stack.start_link()
    assert Stack.pop(pid) == :empty
    assert Stack.peek(pid) == :empty
    assert Stack.size(pid) == 0
  end

  test "peek/1 does not remove the item" do
    {:ok, pid} = Stack.start_link([:x])
    assert Stack.peek(pid) == {:ok, :x}
    assert Stack.peek(pid) == {:ok, :x}
    assert Stack.size(pid) == 1
  end

  test "the server survives popping when empty" do
    {:ok, pid} = Stack.start_link()
    Stack.pop(pid)
    Stack.push(pid, 9)
    assert Process.alive?(pid)
    assert Stack.pop(pid) == {:ok, 9}
  end

  test "two stacks are independent" do
    {:ok, a} = Stack.start_link()
    {:ok, b} = Stack.start_link()
    Stack.push(a, 1)
    assert Stack.size(a) == 1
    assert Stack.size(b) == 0
  end

  test "Stack is a GenServer" do
    behaviours = Stack.__info__(:attributes) |> Keyword.get_values(:behaviour) |> List.flatten()
    assert GenServer in behaviours
  end
end
