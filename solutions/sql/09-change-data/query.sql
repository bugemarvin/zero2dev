INSERT INTO authors (id, name, country)
VALUES (7, 'Nina Park', 'Korea');

INSERT INTO books (id, title, author_id, year, price, genre)
VALUES (13, 'Tidal', 7, 2024, 18.00, 'fiction');

UPDATE books
SET price = price * 1.10
WHERE genre = 'science';

DELETE FROM orders
WHERE ordered_on < '2024-02-01';
