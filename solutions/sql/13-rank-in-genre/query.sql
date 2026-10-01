SELECT title,
       genre,
       price,
       RANK() OVER (PARTITION BY genre ORDER BY price DESC) AS position
FROM books
ORDER BY genre, position, title;
