-- Enable PostGIS
create extension if not exists postgis;

-- Users (Dispatcher, Assembler, Admin)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('DISPATCHER', 'ASSEMBLER', 'ADMIN')),
  password_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Assembler Details
CREATE TABLE assemblers (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  name TEXT NOT NULL,
  avatar_url TEXT,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  rating FLOAT CHECK (rating BETWEEN 1 AND 5),
  rating_count INT DEFAULT 0,
  current_location GEOGRAPHY(Point, 4326),
  address_line TEXT,
  active_task_uuid UUID REFERENCES tasks(uuid),
  status TEXT CHECK (status IN ('AVAILABLE', 'BUSY', 'OFFLINE')) DEFAULT 'OFFLINE'
);

-- Assembler Skills
CREATE TABLE assembler_skills (
  assembler_id UUID REFERENCES assemblers(user_id),
  skill TEXT NOT NULL CHECK (skill IN ('EASY', 'MEDIUM', 'HARD')),
  PRIMARY KEY (assembler_id, skill)
);

-- Orders
CREATE TABLE orders (
  id TEXT PRIMARY KEY, -- Using TEXT to match 'ORD-001' format from mock
  uuid UUID DEFAULT gen_random_uuid() UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  delivery_date TIMESTAMP WITH TIME ZONE,
  assembly_window_start TIMESTAMP WITH TIME ZONE,
  assembly_window_end TIMESTAMP WITH TIME ZONE,
  address_line TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326),
  items JSONB, -- Array of { id, name, sku, weightKg }
  service_fee DECIMAL(10, 2),
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED')) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Assembly Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY, -- Using TEXT to match 't1' format from mock
  uuid UUID DEFAULT gen_random_uuid() UNIQUE,
  order_id TEXT REFERENCES orders(id),
  skill_required TEXT NOT NULL CHECK (skill_required IN ('EASY', 'MEDIUM', 'HARD')),
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'ISSUE')),
  
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  estimated_duration_minutes INT,
  
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  
  -- Flexible assignment to multiple assemblers (Join table would be normalized, but using Array for simplicity based on mock)
  -- Actually, let's normalize this for SQL best practices, but if we want to stick to the architecture doc...
  -- Architecture doc said: assignee_id UUID. We just changed to multi-assign.
  -- Let's create a task_assignments table.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Task Assignments (Many-to-Many)
CREATE TABLE task_assignments (
  task_uuid UUID REFERENCES tasks(uuid) ON DELETE CASCADE,
  assembler_id UUID REFERENCES assemblers(user_id) ON DELETE CASCADE,
  PRIMARY KEY (task_uuid, assembler_id)
);

-- Event Log
CREATE TABLE task_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id TEXT REFERENCES tasks(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('ASSIGNED', 'EN_ROUTE', 'STARTED', 'PAUSED', 'RESUMED', 'COMPLETED', 'ISSUE_REPORTED')),
  event_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  location GEOGRAPHY(Point, 4326),
  metadata JSONB
);

-- Indexes
CREATE INDEX idx_assembler_location ON assemblers USING GIST(current_location);
CREATE INDEX idx_orders_location ON orders USING GIST(location);
