export type SkillLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  address: Location;
  items: Item[];
  deliveryWindow: TimeRange;
  // New Fields
  phone: string;
  email: string;
  deliveryDate: string; // YYYY-MM-DD
  assemblyWindow: string; // e.g. "09:00 - 12:00"
  estimatedTime: number; // minutes
  serviceFee: number;
  notes?: string;
}

export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';


export type JobEventType = 'job_created' | 'worker_assigned' | 'worker_enroute' | 'job_started' | 'job_completed' | 'issue_reported';

export interface JobEvent {
  type: JobEventType;
  timestamp: Date;
  description: string;
}

export interface AssemblyTask {
  id: string;
  orderId: string;
  status: TaskStatus;
  requiredSkills: SkillLevel;
  estimatedDurationMinutes: number;
  assignedAssemblerId: string | null;
  scheduledTime: Date | null;
  history: JobEvent[];
}

export interface Assembler {
  id: string;
  name: string;
  avatarUrl?: string; // For UI
  skills: SkillLevel[];
  rating: number; // 0-5
  currentLocation: Location;
  availability: TimeRange[];
  activeTaskId: string | null;
}

export interface AssignmentRecommendation {
  assembler: Assembler;
  score: number;
  matchReasons: string[];
}
