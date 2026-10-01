defmodule User do
  defstruct [:name]

  def new(_name, _age) do
    nil
  end

  def birthday(_user) do
    nil
  end

  def adult?(_user) do
    nil
  end

  def promote(_user) do
    nil
  end
end

defmodule Inventory do
  def add(_inventory, _item, _quantity) do
    nil
  end

  def remove(_inventory, _item, _quantity) do
    nil
  end

  def total(_inventory) do
    nil
  end
end
