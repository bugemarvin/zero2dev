CREATE TABLE events (
    id       SERIAL PRIMARY KEY,
    payload  JSONB NOT NULL
);

INSERT INTO events (payload) VALUES
    ('{"type": "login", "user": "ada", "device": {"os": "linux"}}'),
    ('{"type": "purchase", "user": "ada", "total": 42.5}'),
    ('{"type": "login", "user": "linus", "device": {"os": "linux"}}'),
    ('{"type": "login", "user": "ada", "device": {"os": "android"}}'),
    ('{"type": "logout", "user": "ada"}'),
    ('{"type": "login", "user": "grace", "device": {"os": "macos"}}'),
    ('{"type": "purchase", "user": "grace", "total": 12}'),
    ('{"type": "login", "user": "ada", "device": {"os": "linux"}}'),
    ('{"type": "login", "user": "linus", "device": {"os": "windows"}}'),
    ('{"type": "purchase", "user": "linus", "total": 7.25}');
