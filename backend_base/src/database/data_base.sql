CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE roles (
  id          SMALLSERIAL PRIMARY KEY,
  name        VARCHAR(30) NOT NULL UNIQUE,   -- admin, manager, cashier
  description TEXT
);

CREATE TABLE users (
  id               BIGSERIAL PRIMARY KEY,
  username         CITEXT NOT NULL UNIQUE,
  email            CITEXT NOT NULL UNIQUE,
  password_hash    TEXT NOT NULL,
  role_id          SMALLINT NOT NULL REFERENCES roles(id),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  failed_attempts  SMALLINT NOT NULL DEFAULT 0,
  locked_until     TIMESTAMPTZ,
  last_login_at    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employees (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  phone       VARCHAR(20),
  address     TEXT,
  job_title   VARCHAR(60),
  hired_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role_id ON users(role_id);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO roles (name, description) VALUES
  ('admin',   'Full access'),
  ('manager', 'Manages employees and products'),
  ('cashier', 'Handles sales');