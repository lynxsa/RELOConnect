-- Initial database setup for RELOConnect
-- This file will be executed when the PostgreSQL container starts for the first time

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'reloconnect') THEN
        CREATE USER reloconnect WITH PASSWORD 'reloconnect_password';
    END IF;
END
$$;

-- Create the main database (this might already exist from environment variables)
-- CREATE DATABASE reloconnect;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE reloconnect TO reloconnect;
GRANT ALL PRIVILEGES ON SCHEMA public TO reloconnect;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO reloconnect;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO reloconnect;

-- Make reloconnect the owner of the database
ALTER DATABASE reloconnect OWNER TO reloconnect;
