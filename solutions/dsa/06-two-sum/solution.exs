[_n, target | numbers] =
  IO.read(:stdio, :eof)
  |> String.split()
  |> Enum.map(&String.to_integer/1)

numbers
|> Enum.with_index()
|> Enum.reduce_while(%{}, fn {x, i}, seen ->
  case Map.fetch(seen, target - x) do
    {:ok, j} ->
      IO.puts("#{j} #{i}")
      {:halt, seen}

    :error ->
      {:cont, Map.put(seen, x, i)}
  end
end)
