export type ProjectStatus = 'PLANNING' | 'DESIGN_APPROVED' | 'MATERIAL_READY' | 'INSTALLING' | 'FINISHING' | 'VERIFIED' | 'CLOSED';
export type PhaseStatus = 'PENDING' | 'READY' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';
export type ExtendedTaskStatus = 'CREATED' | 'SCHEDULED' | 'ASSIGNED' | 'IN_PROGRESS' | 'BLOCKED' | 'DELAYED' | 'COMPLETED' | 'VERIFIED';
export type PhaseType = 'DESIGN' | 'PREP' | 'INSTALL' | 'FINISH';
export type ResourceType = 'ASSEMBLER' | 'CONTRACTOR' | 'ELECTRICIAN' | 'PLUMBER';

export interface Project {
  id: string;
  legacy_order_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  address_line: string;
  location?: { lat: number; lng: number };
  status: ProjectStatus;
  expected_start_date?: string; // YYYY-MM-DD
  expected_end_date?: string;   // YYYY-MM-DD
  created_at: string;
}

export interface Phase {
  id: string;
  project_id: string;
  type: PhaseType;
  status: PhaseStatus;
  sequence_order: number;
  planned_start?: string;
  planned_end?: string;
  actual_start?: string;
  actual_end?: string;
}

export interface ProjectTask {
  id: string;
  phase_id: string;
  title: string;
  type: string;
  duration_days: number;
  required_resource_type: ResourceType;
  status: ExtendedTaskStatus;
  block_reason?: string;
  planned_start?: string;
  planned_end?: string;
  actual_start?: string;
  actual_end?: string;
}

export interface TaskDependency {
  task_id: string;
  depends_on_task_id: string;
}

export interface ResourceAllocation {
  id: string;
  assembler_id: string;
  task_id: string;
  start_date: string;
  end_date: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}
