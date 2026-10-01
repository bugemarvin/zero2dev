SELECT genre,
       COUNT(*) AS books,
       ROUND(AVG(price), 2) AS average_price
FROM books
GROUP BY genre
HAVING COUNT(*) >= 2
ORDER BY genre;
