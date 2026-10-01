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

  test "User.new/2 builds a struct with admin false" do
    user = User.new("Sam", 30)
    assert user.__struct__ == User
    assert Map.get(user, :name) == "Sam"
    assert Map.get(user, :age) == 30
    assert Map.get(user, :admin) == false
  end

  test "User.birthday/1 returns an older user" do
    user = User.new("Sam", 30)
    older = User.birthday(user)
    assert Map.get(older, :age) == 31
    assert Map.get(older, :name) == "Sam"
    assert Map.get(user, :age) == 30
  end

  test "User.adult?/1" do
    assert User.adult?(User.new("A", 18)) == true
    assert User.adult?(User.new("B", 17)) == false
    assert User.adult?(User.new("C", 60)) == true
  end

  test "User.promote/1 sets admin" do
    user = User.new("Sam", 30)
    assert Map.get(User.promote(user), :admin) == true
    assert Map.get(user, :admin) == false
  end

  test "User functions reject a plain map" do
    assert_raise FunctionClauseError, fn -> User.birthday(%{name: "x", age: 1, admin: false}) end
    assert_raise FunctionClauseError, fn -> User.adult?(%{age: 30}) end
  end

  test "Inventory.add/3" do
    assert Inventory.add(%{}, "apple", 3) == %{"apple" => 3}
    assert Inventory.add(%{"apple" => 3}, "apple", 2) == %{"apple" => 5}
    assert Inventory.add(%{"apple" => 3}, "pear", 1) == %{"apple" => 3, "pear" => 1}
  end

  test "Inventory.remove/3 succeeds when there is enough" do
    assert Inventory.remove(%{"apple" => 3}, "apple", 2) == {:ok, %{"apple" => 1}}
    assert Inventory.remove(%{"apple" => 3}, "apple", 3) == {:ok, %{"apple" => 0}}
  end

  test "Inventory.remove/3 reports errors" do
    assert Inventory.remove(%{"apple" => 3}, "pear", 1) == {:error, :unknown_item}
    assert Inventory.remove(%{"apple" => 3}, "apple", 4) == {:error, :not_enough}
  end

  test "Inventory.total/1" do
    assert Inventory.total(%{"apple" => 3, "pear" => 4}) == 7
    assert Inventory.total(%{}) == 0
  end
end
