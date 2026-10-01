CREATE INDEX orders_customer_id_idx ON orders (customer_id);
CREATE INDEX books_genre_price_idx ON books (genre, price);
CREATE UNIQUE INDEX authors_name_idx ON authors (name);
