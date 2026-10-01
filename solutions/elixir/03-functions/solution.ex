defmodule Calc do
  def sign(n) when n > 0, do: :positive
  def sign(n) when n < 0, do: :negative
  def sign(_), do: :zero

  def fizzbuzz(n) when rem(n, 15) == 0, do: "FizzBuzz"
  def fizzbuzz(n) when rem(n, 3) == 0, do: "Fizz"
  def fizzbuzz(n) when rem(n, 5) == 0, do: "Buzz"
  def fizzbuzz(n), do: Integer.to_string(n)

  def greet(name, greeting \\ "Hello") do
    "#{greeting}, #{name}!"
  end

  def apply_n(_fun, 0, value), do: value
  def apply_n(fun, n, value) when n > 0, do: apply_n(fun, n - 1, fun.(value))

  def compose(f, g) do
    fn x -> g.(f.(x)) end
  end
end
