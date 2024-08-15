DROP DATABASE IF EXISTS movies_db;
CREATE DATABASE movies_db;

\c movies_db;

/*//TODO: Create a department table */
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(30) UNIQUE NOT NULL
);

/*//TODO: Create a role table */
CREATE TABLE roles (
id SERIAL PRIMARY KEY,
title VARCHAR(30) UNIQUE NOT NULL,
salary DECIMAL NOT NULL,
department_id INTEGER NOT NULL,
FOREIGN KEY (department_id)
REFERENCES department(id)
ON DELETE SET NULL
);

/*//TODO: Create a employee table */
CREATE TABLE employee (
id SERIAL PRIMARY KEY,
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL,
role_id INTEGER NOT NULL,
manager_id INTEGER,
FOREIGN KEY (role_id)
REFERENCES roles(id)
ON DELETE SET NULL
);