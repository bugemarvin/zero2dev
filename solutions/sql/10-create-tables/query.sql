CREATE TABLE members (
    id         INTEGER PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    name       TEXT NOT NULL,
    joined_on  DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE loans (
    id          INTEGER PRIMARY KEY,
    member_id   INTEGER NOT NULL REFERENCES members(id),
    book_title  TEXT NOT NULL,
    days        INTEGER NOT NULL CHECK (days BETWEEN 1 AND 30)
);
