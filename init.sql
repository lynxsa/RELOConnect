-- Initial database setup for RELOConnect
-- This file will be executed when the PostgreSQL container starts for the first time

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the main database (this might already exist from environment variables)
-- CREATE DATABASE reloconnect;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE reloconnect TO reloconnect;
GRANT ALL PRIVILEGES ON SCHEMA public TO reloconnect;
