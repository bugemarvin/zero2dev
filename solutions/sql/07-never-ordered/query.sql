SELECT b.title
FROM books AS b
WHERE NOT EXISTS (
    SELECT 1 FROM orders AS o WHERE o.book_id = b.id
)
ORDER BY b.title;
