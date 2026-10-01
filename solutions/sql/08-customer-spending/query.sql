WITH totals AS (
    SELECT o.customer_id, SUM(o.quantity * b.price) AS spent
    FROM orders AS o
    JOIN books AS b ON b.id = o.book_id
    GROUP BY o.customer_id
)
SELECT c.name, t.spent
FROM totals AS t
JOIN customers AS c ON c.id = t.customer_id
WHERE t.spent > 40
ORDER BY t.spent DESC;
