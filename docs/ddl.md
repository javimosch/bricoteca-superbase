# Migration 1

-- Create tools table
CREATE TABLE tools (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  image_url text,
  category text, -- e.g., power tools, hand tools
  usage text, -- e.g., gardening, construction
  availability boolean DEFAULT TRUE,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Create tool_categories table
CREATE TABLE tool_categories (
  id bigserial PRIMARY KEY,
  category_name text NOT NULL UNIQUE,
  description text
);

-- Create tool_category_mappings table
CREATE TABLE tool_category_mappings (
  tool_id bigserial NOT NULL REFERENCES tools(id),
  category_id bigserial NOT NULL REFERENCES tool_categories(id),
  PRIMARY KEY (tool_id, category_id)
);

-- Create users table
CREATE TABLE users (
  id bigserial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  name text,
  address text,
  phone_number text,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE reservations (
  id bigserial PRIMARY KEY,
  tool_id bigserial NOT NULL REFERENCES tools(id),
  user_id bigserial NOT NULL REFERENCES users(id),
  reservation_start timestamp NOT NULL,
  reservation_end timestamp NOT NULL,
  status text DEFAULT 'pending', -- e.g., pending, confirmed, cancelled
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Create unique index to prevent overlapping reservations
CREATE UNIQUE INDEX unique_reservation ON reservations (tool_id, reservation_start, reservation_end)
WHERE status IN ('pending', 'confirmed');

-- Create user_reservation_history table (optional)
CREATE TABLE user_reservation_history (
  id bigserial PRIMARY KEY,
  reservation_id bigserial NOT NULL REFERENCES reservations(id),
  user_id bigserial NOT NULL REFERENCES users(id),
  status text NOT NULL, -- e.g., pending, confirmed, cancelled
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);


# Migration 2

ALTER TABLE tools
ADD COLUMN user_ref uuid NULL REFERENCES auth.users(id);
