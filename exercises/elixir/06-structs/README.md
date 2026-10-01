# A struct and a map

`solution.ex` holds two modules.

## `User`

A struct with the fields `name`, `age` and `admin`, where `admin` defaults to `false`.

- `User.new(name, age)` returns a `%User{}`.
- `User.birthday(user)` returns the user with the age increased by one.
- `User.adult?(user)` is `true` when the age is 18 or more.
- `User.promote(user)` returns the user with `admin` set to `true`.

These functions accept only a `%User{}`. Called with a plain map they must raise `FunctionClauseError`, which is what a `%User{}` pattern in the function head gives you.

## `Inventory`

Works on a plain map from item name to quantity, such as `%{"apple" => 3}`.

- `Inventory.add(inventory, item, quantity)` returns the inventory with the quantity added. A new item starts from 0.
- `Inventory.remove(inventory, item, quantity)` returns `{:ok, new_inventory}`. If the item is not present it returns `{:error, :unknown_item}`. If there are fewer than `quantity` it returns `{:error, :not_enough}`. An item whose quantity reaches 0 stays in the map with 0.
- `Inventory.total(inventory)` returns the sum of all quantities.
