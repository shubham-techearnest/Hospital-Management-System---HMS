-- Health360 local development database bootstrap
-- Run as PostgreSQL superuser (postgres):
--   psql -U postgres -h localhost -f scripts/init-local-db.sql

CREATE ROLE health360 WITH LOGIN PASSWORD 'health360_local_dev';
CREATE DATABASE health360_db OWNER health360;
GRANT ALL PRIVILEGES ON DATABASE health360_db TO health360;
