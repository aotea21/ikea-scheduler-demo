-- =============================================================
-- Kitchen Installation Upgrade Migration
-- Covers: Skills, FSM states, Task Types, Evidence, Tracking
-- =============================================================

-- ============ Phase 1: Skill System — Complete Replacement ============

-- Replace EASY/MEDIUM/HARD with domain-specific skills
ALTER TABLE assembler_skills DROP CONSTRAINT IF EXISTS assembler_skills_skill_check;
ALTER TABLE assembler_skills ADD CONSTRAINT assembler_skills_skill_check
    CHECK (skill IN ('CABINETRY', 'PLUMBING', 'ELECTRICAL', 'MEASURING', 'COUNTERTOP'));

-- Certification tracking for licensed trades (NZ requirement)
ALTER TABLE assembler_skills ADD COLUMN IF NOT EXISTS certification_number TEXT;
ALTER TABLE assembler_skills ADD COLUMN IF NOT EXISTS certification_expiry DATE;

-- Update tasks skill_required to domain skills
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_skill_required_check;
ALTER TABLE tasks ALTER COLUMN skill_required DROP NOT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS required_domain_skills TEXT[];

-- ============ Phase 2: FSM + Task Type ============

-- Expand task status enum to include MATERIALS_VERIFIED
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
    CHECK (status IN (
        'OPEN', 'CREATED', 'SCHEDULING', 'ASSIGNED', 'CONFIRMED',
        'EN_ROUTE', 'ARRIVED', 'MATERIALS_VERIFIED', 'IN_PROGRESS',
        'COMPLETED', 'VERIFIED', 'ISSUE', 'CANCELLED'
    ));

-- Task type and kitchen flag
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_kitchen_task BOOLEAN DEFAULT false;

-- Expand event types for task_events
ALTER TABLE task_events DROP CONSTRAINT IF EXISTS task_events_event_type_check;
ALTER TABLE task_events ADD CONSTRAINT task_events_event_type_check
    CHECK (event_type IN (
        'ASSIGNED', 'EN_ROUTE', 'STARTED', 'PAUSED', 'RESUMED',
        'COMPLETED', 'ISSUE_REPORTED', 'STATUS_CHANGED',
        'MATERIALS_VERIFIED', 'EVIDENCE_UPLOADED'
    ));

-- ============ Phase 3: Evidence / Photo Verification ============

CREATE TABLE IF NOT EXISTS task_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN (
        'LEVELING', 'PLUMBING_CONNECTION', 'SILICONE_FINISH',
        'ELECTRICAL_CONNECTION', 'OVERALL', 'ISSUE_PHOTO'
    )),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_task_evidence_task_id ON task_evidence(task_id);

-- ============ Phase 4: Planner Data ============
-- No DDL needed: orders.items is JSONB and already accepts extended fields
-- (kitchenDesignCode, plannerPdfUrl added at application level)

-- ============ Phase 5: Customer Tracking ============

CREATE TABLE IF NOT EXISTS customer_tracking_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_token ON customer_tracking_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tracking_order ON customer_tracking_tokens(order_id);
