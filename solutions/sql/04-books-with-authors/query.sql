SELECT b.title, a.name AS author
FROM books AS b
JOIN authors AS a ON a.id = b.author_id
WHERE b.year > 2010
ORDER BY b.title;
