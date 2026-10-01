---
title: Maps, keyword lists and structs
summary: Key-value data in three forms, how to "update" what cannot change, and your own named data types.
---

## Maps

A map holds key-value pairs.

```elixir
user = %{"name" => "Sam", "age" => 30}
user["name"]             # "Sam"
user["email"]            # nil: no such key
```

When the keys are atoms, there is a shorter syntax, and the dot reads a key:

```elixir
user = %{name: "Sam", age: 30}
user.name                # "Sam"
user[:age]               # 30
user.email               # ** (KeyError): the dot insists that the key exists
```

Use `user.name` when the key must be there, and `user[:name]` or `Map.get` when it may be missing.

## "Changing" a map

Nothing changes. Every operation returns a new map.

```elixir
older = %{user | age: 31}                 # update an EXISTING key
Map.put(user, :email, "sam@example.com")  # add or replace a key
Map.delete(user, :age)
Map.get(user, :email, "none")             # with a default
Map.has_key?(user, :name)                 # true
Map.keys(user)                            # [:age, :name]
Map.update(user, :age, 0, &(&1 + 1))      # apply a function to a value
Map.merge(user, %{age: 40, city: "Lagos"})
```

`%{map | key: value}` raises an error if the key does not exist, which catches typing mistakes. Use it to update, and `Map.put` to add.

The new map shares most of its structure with the old one, so this is cheap.

## Matching on maps

A map pattern matches when the map contains the listed keys, whatever else it holds:

```elixir
def greeting(%{name: name}), do: "Hello, #{name}"

def describe(%{admin: true}), do: "administrator"
def describe(%{}), do: "regular user"
```

`%{}` as a pattern matches **any** map, not only an empty one.

## Keyword lists

A keyword list is a list of two-element tuples whose first element is an atom, with a friendlier syntax:

```elixir
opts = [timeout: 5000, retries: 3]
opts == [{:timeout, 5000}, {:retries, 3}]     # true
opts[:timeout]                                # 5000
Keyword.get(opts, :verbose, false)            # false
```

It keeps its order and allows repeated keys. Its main use is **optional arguments**. When it is the last argument of a call, the square brackets can be left out:

```elixir
String.split("a,b,c", ",", trim: true)
```

| | Map | Keyword list |
| --- | --- | --- |
| Keys | anything | atoms |
| Order kept | no | yes |
| Duplicate keys | no | yes |
| Lookup | fast | walks the list |
| Use for | data | options |

## Structs

A **struct** is a map with a name and a fixed set of keys. It gives your data a type.

```elixir
defmodule User do
  defstruct [:name, :age, admin: false]
end

user = %User{name: "Sam", age: 30}
user.name                         # "Sam"
user.admin                        # false: the default
%User{user | age: 31}             # update

%User{nmae: "Sam"}                # ** compile error: unknown key :nmae
```

Keys given with a value have that default. The others default to `nil`. Unlike a bare map, a struct refuses unknown keys at compile time.

Matching on the struct name makes a function accept only that type:

```elixir
defmodule User do
  defstruct [:name, :age, admin: false]

  def new(name, age), do: %User{name: name, age: age}

  def birthday(%User{age: age} = user), do: %User{user | age: age + 1}

  def adult?(%User{age: age}), do: age >= 18
end
```

`%User{age: age} = user` both checks the type, pulls out `age`, and keeps the whole struct in `user`.

The usual arrangement is the one shown: a module defines a struct and the functions that work on it. This is how Elixir groups data with behaviour, without classes and without mutation. `birthday` does not change a user. It returns a new one.

## Nested data

Updating something deep inside nested maps by hand is tedious. These helpers take a path of keys:

```elixir
data = %{user: %{profile: %{city: "Lagos"}}}

get_in(data, [:user, :profile, :city])                 # "Lagos"
put_in(data, [:user, :profile, :city], "Accra")
update_in(data, [:user, :profile, :city], &String.upcase/1)
```

## Common mistakes

- **`%{map | new_key: 1}`** to add a key. That syntax only updates existing keys.
- **Mixing `"name"` and `:name`.** A string key and an atom key are different keys.
- **Forgetting to use the returned value.** `Map.put(user, :age, 31)` on its own line changes nothing you can see.
- **Using a map where a struct would catch mistakes.**
