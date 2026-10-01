defmodule Roman do
  @numerals [
    {1000, "M"},
    {900, "CM"},
    {500, "D"},
    {400, "CD"},
    {100, "C"},
    {90, "XC"},
    {50, "L"},
    {40, "XL"},
    {10, "X"},
    {9, "IX"},
    {5, "V"},
    {4, "IV"},
    {1, "I"}
  ]

  def to_roman(n) when n > 0 and n < 4000, do: to_roman(n, @numerals)

  defp to_roman(0, _numerals), do: ""

  defp to_roman(n, [{value, symbol} | _] = numerals) when n >= value do
    symbol <> to_roman(n - value, numerals)
  end

  defp to_roman(n, [_ | rest]), do: to_roman(n, rest)

  def from_roman(text), do: from_roman(text, @numerals, 0)

  defp from_roman("", _numerals, total), do: total

  defp from_roman(text, [{value, symbol} | rest] = numerals, total) do
    if String.starts_with?(text, symbol) do
      remaining = String.replace_prefix(text, symbol, "")
      from_roman(remaining, numerals, total + value)
    else
      from_roman(text, rest, total)
    end
  end
end
