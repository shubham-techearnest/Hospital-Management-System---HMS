-- Health360 local development database bootstrap
-- Run as PostgreSQL superuser (postgres):
--   psql -U postgres -h localhost -f scripts/init-local-db.sql

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'health360') THEN
    CREATE ROLE health360 WITH LOGIN PASSWORD 'health360_local_dev';
  ELSE
    ALTER ROLE health360 WITH LOGIN PASSWORD 'health360_local_dev';
  END IF;
END
$$;

SELECT 'CREATE DATABASE health360_db OWNER health360'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'health360_db')
\gexec

GRANT ALL PRIVILEGES ON DATABASE health360_db TO health360;
