-- Enable Row Level Security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app schema
CREATE SCHEMA IF NOT EXISTS app;

-- Enable RLS on all tables by default
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO padelyzer;

-- Create a function to get current club context
CREATE OR REPLACE FUNCTION app.current_club_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('app.current_club_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to set club context
CREATE OR REPLACE FUNCTION app.set_club_id(club_id TEXT) 
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_club_id', club_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA app TO padelyzer;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO padelyzer;