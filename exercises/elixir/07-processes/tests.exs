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

  test "Counter.start/1 returns the pid of a live process" do
    pid = Counter.start(0)
    assert is_pid(pid)
    assert pid != self()
    Process.sleep(20)
    assert Process.alive?(pid), "the counter process ended. It needs a loop that waits for the next message."
  end

  test "Counter.value/1 returns the initial value" do
    assert Counter.value(Counter.start(10)) == 10
  end

  test "Counter.increment/1 adds one each time" do
    pid = Counter.start(0)
    Counter.increment(pid)
    Counter.increment(pid)
    Counter.increment(pid)
    assert Counter.value(pid) == 3
  end

  test "the counter keeps working after its value was read" do
    pid = Counter.start(5)
    assert Counter.value(pid) == 5
    Counter.increment(pid)
    assert Counter.value(pid) == 6
    assert Counter.value(pid) == 6
  end

  test "two counters are independent" do
    a = Counter.start(0)
    b = Counter.start(100)
    Counter.increment(a)
    assert Counter.value(a) == 1
    assert Counter.value(b) == 100
  end

  test "increments from many processes are all counted" do
    pid = Counter.start(0)
    parent = self()

    for _ <- 1..50 do
      spawn(fn ->
        for _ <- 1..20, do: Counter.increment(pid)
        send(parent, :done)
      end)
    end

    for _ <- 1..50, do: assert_receive(:done, 2000)
    assert Counter.value(pid) == 1000
  end

  test "Counter.value/1 works when called from another process" do
    pid = Counter.start(7)
    task = Task.async(fn -> Counter.value(pid) end)
    assert Task.await(task) == 7
  end

  test "Parallel.map/2 returns results in the original order" do
    assert Parallel.map([1, 2, 3, 4], fn x -> x * x end) == [1, 4, 9, 16]
    assert Parallel.map([], fn x -> x end) == []

    slow_first = fn x ->
      Process.sleep((5 - x) * 30)
      x
    end

    assert Parallel.map([1, 2, 3, 4], slow_first) == [1, 2, 3, 4]
  end

  test "Parallel.map/2 runs the calls at the same time" do
    started = System.monotonic_time(:millisecond)

    result =
      Parallel.map([1, 2, 3, 4, 5], fn x ->
        Process.sleep(200)
        x
      end)

    elapsed = System.monotonic_time(:millisecond) - started
    assert result == [1, 2, 3, 4, 5]
    assert elapsed < 700, "took #{elapsed} ms: the calls ran one after another"
  end

  test "Parallel.map/2 runs each call in its own process" do
    pids = Parallel.map([1, 2, 3], fn _ -> self() end)
    assert length(Enum.uniq(pids)) == 3
    refute self() in pids
  end
end
