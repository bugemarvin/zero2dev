CREATE TABLE authors (
    id       INTEGER PRIMARY KEY,
    name     TEXT NOT NULL,
    country  TEXT NOT NULL
);

CREATE TABLE books (
    id         INTEGER PRIMARY KEY,
    title      TEXT NOT NULL,
    author_id  INTEGER NOT NULL REFERENCES authors(id),
    year       INTEGER NOT NULL,
    price      NUMERIC NOT NULL,
    genre      TEXT NOT NULL
);

CREATE TABLE customers (
    id    INTEGER PRIMARY KEY,
    name  TEXT NOT NULL,
    city  TEXT
);

CREATE TABLE orders (
    id           INTEGER PRIMARY KEY,
    customer_id  INTEGER NOT NULL REFERENCES customers(id),
    book_id      INTEGER NOT NULL REFERENCES books(id),
    quantity     INTEGER NOT NULL,
    ordered_on   DATE NOT NULL
);

INSERT INTO authors (id, name, country) VALUES
    (1, 'Mara Lind', 'Sweden'),
    (2, 'Tom Okafor', 'Nigeria'),
    (3, 'Chen Wei', 'China'),
    (4, 'Lucia Ferro', 'Italy'),
    (5, 'Sam Reyes', 'Mexico'),
    (6, 'Eva Brandt', 'Germany');

INSERT INTO books (id, title, author_id, year, price, genre) VALUES
    (1, 'The Silent River', 1, 1998, 12.50, 'fiction'),
    (2, 'Night Trains', 1, 2005, 14.00, 'fiction'),
    (3, 'Counting Stars', 2, 2012, 22.00, 'science'),
    (4, 'The Quiet Atom', 2, 2019, 27.00, 'science'),
    (5, 'Salt Roads', 3, 2001, 17.00, 'history'),
    (6, 'Empire of Tea', 3, 2015, 20.00, 'history'),
    (7, 'Paper Boats', 4, 1995, 9.50, 'fiction'),
    (8, 'The Glass Orchard', 4, 2021, 16.00, 'fiction'),
    (9, 'Small Hours', 5, 2010, 8.00, 'poetry'),
    (10, 'Deep Field', 2, 2008, 23.00, 'science'),
    (11, 'The Last Ferry', 5, 2018, 15.00, 'fiction'),
    (12, 'Northern Lines', 1, 2022, 19.00, 'travel');

INSERT INTO customers (id, name, city) VALUES
    (1, 'Amina', 'Lagos'),
    (2, 'Bruno', 'Lisbon'),
    (3, 'Chloe', 'Paris'),
    (4, 'Dev', NULL),
    (5, 'Emma', 'Lisbon'),
    (6, 'Farid', 'Cairo');

INSERT INTO orders (id, customer_id, book_id, quantity, ordered_on) VALUES
    (1, 1, 1, 1, '2024-01-05'),
    (2, 1, 3, 2, '2024-01-20'),
    (3, 2, 2, 1, '2024-02-02'),
    (4, 2, 7, 3, '2024-02-02'),
    (5, 3, 4, 1, '2024-02-14'),
    (6, 3, 5, 1, '2024-03-01'),
    (7, 3, 9, 2, '2024-03-01'),
    (8, 4, 11, 1, '2024-03-09'),
    (9, 5, 6, 1, '2024-03-15'),
    (10, 5, 3, 1, '2024-04-01'),
    (11, 1, 1, 1, '2024-04-10'),
    (12, 2, 10, 1, '2024-04-22'),
    (13, 5, 3, 2, '2024-05-03'),
    (14, 1, 4, 1, '2024-05-18');
