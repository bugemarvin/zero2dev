defmodule Counter do
  def start(initial) do
    spawn(fn -> loop(initial) end)
  end

  def increment(pid) do
    send(pid, :increment)
    :ok
  end

  def value(pid) do
    ref = make_ref()
    send(pid, {:value, self(), ref})

    receive do
      {:count, ^ref, n} -> n
    end
  end

  defp loop(count) do
    receive do
      :increment ->
        loop(count + 1)

      {:value, caller, ref} ->
        send(caller, {:count, ref, count})
        loop(count)
    end
  end
end

defmodule Parallel do
  def map(list, fun) do
    list
    |> Enum.map(fn item -> Task.async(fn -> fun.(item) end) end)
    |> Enum.map(&Task.await/1)
  end
end
