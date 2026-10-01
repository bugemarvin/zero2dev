BEGIN;
UPDATE accounts SET balance = balance - 40 WHERE name = 'alice';
UPDATE accounts SET balance = balance + 40 WHERE name = 'bob';
INSERT INTO transfers (id, from_name, to_name, amount) VALUES (1, 'alice', 'bob', 40);
COMMIT;

BEGIN;
DELETE FROM transfers;
DELETE FROM accounts;
ROLLBACK;
