defmodule Hello do
  def greet do
    "Hello, world!"
  end

  def greet(name) do
    "Hello, #{name}!"
  end

  def shout(text) do
    String.upcase(text) <> "!"
  end

  def sum_and_product(a, b) do
    {a + b, a * b}
  end

  def halve(n) do
    div(n, 2)
  end
end
