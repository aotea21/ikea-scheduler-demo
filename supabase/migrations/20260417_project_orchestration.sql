-- Enums for new statuses and types
CREATE TYPE project_status AS ENUM ('PLANNING', 'DESIGN_APPROVED', 'MATERIAL_READY', 'INSTALLING', 'FINISHING', 'VERIFIED', 'CLOSED');
CREATE TYPE phase_status AS ENUM ('PENDING', 'READY', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED');
CREATE TYPE extended_task_status AS ENUM ('CREATED', 'SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'DELAYED', 'COMPLETED', 'VERIFIED');
CREATE TYPE phase_type AS ENUM ('DESIGN', 'PREP', 'INSTALL', 'FINISH');
CREATE TYPE resource_type AS ENUM ('ASSEMBLER', 'CONTRACTOR', 'ELECTRICIAN', 'PLUMBER');

-- 1. Projects (Kitchen Job)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_order_id TEXT, -- For migration
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    address_line TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326),
    status project_status DEFAULT 'PLANNING',
    expected_start_date DATE,
    expected_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Phases
CREATE TABLE phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type phase_type NOT NULL,
    status phase_status DEFAULT 'PENDING',
    sequence_order INT NOT NULL,  -- e.g., 1: DESIGN, 2: PREP, etc.
    planned_start DATE,
    planned_end DATE,
    actual_start DATE,
    actual_end DATE
);

-- 3. Tasks (Extended)
CREATE TABLE project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID REFERENCES phases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'CABINET_INSTALL', 'ELECTRICAL_ROUGH_IN', etc.
    duration_days INT NOT NULL,
    required_resource_type resource_type NOT NULL,
    status extended_task_status DEFAULT 'CREATED',
    block_reason TEXT,
    planned_start DATE,
    planned_end DATE,
    actual_start DATE,
    actual_end DATE
);

-- 4. Dependencies (DAG)
CREATE TABLE task_dependencies (
    task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, depends_on_task_id)
);

-- 5. Resource Allocations (Calendar Blocks)
CREATE TABLE resource_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assembler_id UUID REFERENCES assemblers(user_id) ON DELETE CASCADE,
    task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED')) DEFAULT 'SCHEDULED',
    CONSTRAINT date_range_check CHECK (end_date >= start_date)
);

-- 6. Project Events (Logging)
CREATE TABLE project_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    entity_type TEXT CHECK (entity_type IN ('PROJECT', 'PHASE', 'TASK')),
    entity_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    old_state TEXT,
    new_state TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

