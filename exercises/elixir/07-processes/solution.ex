defmodule Counter do
  def start(_initial) do
    spawn(fn -> :ok end)
  end

  def increment(_pid) do
    :ok
  end

  def value(_pid) do
    nil
  end
end

defmodule Parallel do
  def map(_list, _fun) do
    nil
  end
end
