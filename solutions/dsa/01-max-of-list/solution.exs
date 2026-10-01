[_n | numbers] =
  IO.read(:stdio, :eof)
  |> String.split()
  |> Enum.map(&String.to_integer/1)

IO.puts(Enum.max(numbers))
