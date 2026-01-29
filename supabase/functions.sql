-- 1. Drop existing functions to allow return type changes
DROP FUNCTION IF EXISTS get_assemblers_with_location();
DROP FUNCTION IF EXISTS get_orders_with_location();

-- 2. Re-create get_assemblers_with_location (Returning JSON)
CREATE OR REPLACE FUNCTION get_assemblers_with_location()
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  phone_primary TEXT,
  phone_secondary TEXT,
  rating FLOAT,
  rating_count INT,
  status TEXT,
  active_task_uuid UUID, -- Changed from active_task_id
  address_line TEXT,
  location_json JSON
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.user_id,
    a.name,
    a.avatar_url,
    a.phone_primary,
    a.phone_secondary,
    a.rating,
    a.rating_count,
    a.status,
    a.active_task_uuid, -- Changed from active_task_id
    a.address_line,
    ST_AsGeoJSON(a.current_location)::JSON as location_json
  FROM assemblers a;
END;
$$;

-- 3. Re-create get_orders_with_location (Returning JSON)
CREATE OR REPLACE FUNCTION get_orders_with_location()
RETURNS TABLE (
  id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  delivery_date TEXT,
  assembly_window_start TEXT,
  assembly_window_end TEXT,
  address_line TEXT,
  items JSONB,
  service_fee FLOAT,
  notes TEXT,
  status TEXT,
  location_json JSON
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.customer_name,
    o.customer_phone,
    o.customer_email,
    o.delivery_date,
    o.assembly_window_start,
    o.assembly_window_end,
    o.address_line,
    o.items,
    o.service_fee,
    o.notes,
    o.status,
    ST_AsGeoJSON(o.location)::JSON as location_json
  FROM orders o;
END;
$$;

-- 4. FIX SCHEMA MISMATCH: Change active_task_id to TEXT to match tasks.id
-- (This line is kept for reference but assuming user ran the UUID column add instead)
-- ALTER TABLE assemblers ALTER COLUMN active_task_id TYPE TEXT;

-- 5. Define the Assignment Function (Robust Logic)
CREATE OR REPLACE FUNCTION assign_task_to_assemblers(
  p_task_id TEXT,
  p_assembler_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assembler_id UUID;
  v_task_uuid UUID;
BEGIN
  -- 1. Look up Task UUID (needed for assembler FK)
  SELECT uuid INTO v_task_uuid FROM tasks WHERE id = p_task_id;
  
  IF v_task_uuid IS NULL THEN
    RAISE EXCEPTION 'Task UUID not found for ID %', p_task_id;
  END IF;

  -- 2. Lock task row
  PERFORM 1 FROM tasks WHERE id = p_task_id FOR UPDATE;

  -- 3. Update task
  UPDATE tasks
  SET 
    status = 'ASSIGNED',
    scheduled_start = NOW(),
    scheduled_end = NOW() + (estimated_duration_minutes || ' minutes')::INTERVAL
  WHERE id = p_task_id;

  -- 4. Clear previous assignments
  DELETE FROM task_assignments WHERE task_uuid = v_task_uuid;

  -- 5. Reset previous assemblers
  UPDATE assemblers
  SET 
    status = 'AVAILABLE',
    active_task_uuid = NULL
  WHERE active_task_uuid = v_task_uuid;

  -- 6. Assign new assemblers
  FOREACH v_assembler_id IN ARRAY p_assembler_ids
  LOOP
    INSERT INTO task_assignments (task_uuid, assembler_id)
    VALUES (v_task_uuid, v_assembler_id);

    UPDATE assemblers
    SET 
      status = 'BUSY',
      active_task_uuid = v_task_uuid
    WHERE user_id = v_assembler_id;
  END LOOP;
END;
$$;
