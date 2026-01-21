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
  id: string; // UUID
  customerName: string;
  address: Location;
  items: Item[];

  // New Fields matching SQL Schema
  customerPhone: string; // was phone
  deliveryFrom: Date; // was deliveryWindow.start
  deliveryTo: Date; // was deliveryWindow.end

  location?: Location; // SQL says location is in Orders
  status: 'DELIVERED' | 'CANCELLED'; // SQL Enum

  // Legacy/UI fields (keeping for compatibility/mockData for now, but should ideally map)
  email: string;
  assemblyWindow: string;
  estimatedTime: number;
  serviceFee: number;
  notes?: string;
  deliveryDate: string; // Keeping for UI display convenience
}

export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'ISSUE';

export type JobEventType = 'ASSIGNED' | 'EN_ROUTE' | 'STARTED' | 'PAUSED' | 'RESUMED' | 'COMPLETED' | 'ISSUE_REPORTED';

export interface JobEvent {
  id: string; // UUID
  taskId: string;
  type: JobEventType; // Uppercase Enum
  eventTime: Date; // SQL column
  location?: Location;
  metadata?: any; // JSONB

  // Legacy/UI
  timestamp: Date; // Mapping eventTime to this for UI compatibility if needed, or update UI
  description?: string;
}

export interface AssemblyTask {
  id: string; // UUID
  orderId: string;
  status: TaskStatus;
  skillRequired: SkillLevel; // SQL column

  // Planning
  scheduledStart?: Date;
  scheduledEnd?: Date;

  // Execution
  actualStart?: Date;
  actualEnd?: Date;

  assignedAssemblerIds: string[]; // SQL column (was assemblerId, previously assignedAssemblerId)
  createdAt: Date;

  // Legacy/UI
  requiredSkills: SkillLevel; // Mapping to skillRequired
  estimatedDurationMinutes: number;
  scheduledTime: Date | null;
  history: JobEvent[];
}

export interface Assembler {
  id: string; // UUID (user_id)
  name: string;
  avatarUrl?: string;
  rating: number;
  ratingCount: number;
  currentLocation: Location;

  // Relations
  skills: SkillLevel[];
  availability: TimeRange[];

  activeTaskId: string | null;

  // SQL Columns
  isActive: boolean;
  lastSeenAt: Date;
  mobileNumberPrimary: string;
  mobileNumberSecondary?: string;
}

export interface AssignmentRecommendation {
  assembler: Assembler;
  score: number;
  matchReasons: string[];
}
