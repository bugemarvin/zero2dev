SELECT payload ->> 'user' AS user_name,
       COUNT(*) AS logins
FROM events
WHERE payload @> '{"type": "login"}'
GROUP BY payload ->> 'user'
ORDER BY logins DESC, user_name;
