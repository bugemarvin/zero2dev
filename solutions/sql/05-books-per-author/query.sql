SELECT a.name, COUNT(b.id) AS books
FROM authors AS a
LEFT JOIN books AS b ON b.author_id = a.id
GROUP BY a.id, a.name
ORDER BY books DESC, a.name;
