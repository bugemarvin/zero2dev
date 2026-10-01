defmodule User do
  defstruct [:name, :age, admin: false]

  def new(name, age), do: %User{name: name, age: age}

  def birthday(%User{age: age} = user), do: %User{user | age: age + 1}

  def adult?(%User{age: age}), do: age >= 18

  def promote(%User{} = user), do: %User{user | admin: true}
end

defmodule Inventory do
  def add(inventory, item, quantity) do
    Map.update(inventory, item, quantity, &(&1 + quantity))
  end

  def remove(inventory, item, quantity) do
    case Map.fetch(inventory, item) do
      :error -> {:error, :unknown_item}
      {:ok, have} when have < quantity -> {:error, :not_enough}
      {:ok, have} -> {:ok, Map.put(inventory, item, have - quantity)}
    end
  end

  def total(inventory) do
    inventory |> Map.values() |> Enum.sum()
  end
end
