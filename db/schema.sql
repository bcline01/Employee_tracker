DROP DATABASE IF EXISTS movies_db;
CREATE DATABASE movies_db;

\c movies_db;

/*//TODO: Create a movie table */
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    movie_name VARCHAR(100) NOT NULL
);

/*//TODO: Create a review table */
CREATE TABLE reviews (
id SERIAL PRIMARY KEY,
movie_id INTEGER,
review TEXT NOT NULL,
FOREIGN KEY (movie_id)
REFERENCES movies(id)
ON DELETE SET NULL
);