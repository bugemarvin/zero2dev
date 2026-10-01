defmodule Rec do
  def sum(list), do: sum(list, 0)

  defp sum([], acc), do: acc
  defp sum([head | tail], acc), do: sum(tail, acc + head)

  def count(list), do: count(list, 0)

  defp count([], acc), do: acc
  defp count([_ | tail], acc), do: count(tail, acc + 1)

  def reverse(list), do: reverse(list, [])

  defp reverse([], acc), do: acc
  defp reverse([head | tail], acc), do: reverse(tail, [head | acc])

  def map([], _fun), do: []
  def map([head | tail], fun), do: [fun.(head) | map(tail, fun)]

  def largest([]), do: nil
  def largest([head | tail]), do: largest(tail, head)

  defp largest([], best), do: best
  defp largest([head | tail], best) when head > best, do: largest(tail, head)
  defp largest([_ | tail], best), do: largest(tail, best)
end
