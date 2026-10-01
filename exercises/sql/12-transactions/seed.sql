CREATE TABLE accounts (
    name     TEXT PRIMARY KEY,
    balance  INTEGER NOT NULL CHECK (balance >= 0)
);

CREATE TABLE transfers (
    id         INTEGER PRIMARY KEY,
    from_name  TEXT NOT NULL REFERENCES accounts(name),
    to_name    TEXT NOT NULL REFERENCES accounts(name),
    amount     INTEGER NOT NULL CHECK (amount > 0)
);

INSERT INTO accounts (name, balance) VALUES
    ('alice', 100),
    ('bob', 50),
    ('carol', 0);
