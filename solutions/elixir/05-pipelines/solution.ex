defmodule Pipes do
  def sum_of_even_squares(numbers) do
    numbers
    |> Enum.filter(&(rem(&1, 2) == 0))
    |> Enum.map(&(&1 * &1))
    |> Enum.sum()
  end

  def initials(name) do
    name
    |> String.split()
    |> Enum.map(&String.first/1)
    |> Enum.join()
    |> String.upcase()
  end

  def word_frequencies(text) do
    text
    |> String.downcase()
    |> String.split()
    |> Enum.frequencies()
  end

  def top_words(text, n) do
    text
    |> word_frequencies()
    |> Enum.sort_by(fn {word, count} -> {-count, word} end)
    |> Enum.take(n)
  end
end
