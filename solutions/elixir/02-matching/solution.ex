defmodule Match do
  def swap({a, b}), do: {b, a}

  def first([head | _]), do: {:ok, head}
  def first([]), do: :error

  def second([_, second | _]), do: second
  def second(_), do: nil

  def describe({:ok, value}), do: "ok: #{value}"
  def describe({:error, reason}), do: "error: #{reason}"
  def describe(_), do: "unknown"

  def area({:circle, r}), do: 3.14 * r * r
  def area({:rect, w, h}), do: w * h
  def area({:square, s}), do: s * s
end
