-- Run this script as PostgreSQL superuser (e.g. postgres) to create the app user and database.
-- From project root: psql -U postgres -f backend/scripts/init-db.sql
-- If role or database already exists, you can ignore "already exists" errors.

-- Create the application user (password: password123)
CREATE ROLE legal_user WITH LOGIN PASSWORD 'password123';

-- Create the database (legal_user will own it and have full access)
CREATE DATABASE legal_signing_db OWNER legal_user;
