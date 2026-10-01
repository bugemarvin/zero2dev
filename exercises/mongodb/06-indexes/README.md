# Indexes that enforce and speed up

Two collections are given: `users` and `orders`.

1. Create a **unique** index on the `email` field of `users`.
2. Create a **compound** index on `orders`: `customer` ascending, then `date` descending.
3. Put the orders of the customer `"ada"`, newest first, in `result`: only the fields `date` and `total`, without `_id`.

The tests check that both indexes exist, that a second user with an existing email is rejected, and that your query can be answered with the index.

Write your commands in `query.js`. **Show result** runs the file on the sample data and prints `result`. Each run starts from a fresh copy of the data, so you can experiment freely.
