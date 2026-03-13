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
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'; // SQL Enum

  // Legacy/UI fields (keeping for compatibility/mockData for now, but should ideally map)
  email: string;
  assemblyWindow: string;
  estimatedTime: number;
  serviceFee: number;
  notes?: string;
  deliveryDate: string; // Keeping for UI display convenience
}

export type TaskStatus =
  | 'CREATED'       // 주문 접수, 배정 전
  | 'SCHEDULING'    // 시스템이 배정 중
  | 'ASSIGNED'      // Assembler에게 배정됨
  | 'CONFIRMED'     // Assembler가 수락함
  | 'EN_ROUTE'      // Assembler 이동 중
  | 'ARRIVED'       // 현장 도착
  | 'IN_PROGRESS'   // 조립 작업 중
  | 'COMPLETED'     // 작업 완료
  | 'VERIFIED'      // Admin 검수 완료
  | 'ISSUE'         // 문제 발생
  | 'CANCELLED';    // 취소됨

export type TaskActorType = 'assembler' | 'admin' | 'system';

export interface TaskEventActor {
  type: TaskActorType;
  id: string;
}

export type JobEventType =
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'CONFIRMED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'STARTED'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'ISSUE_REPORTED'
  | 'CANCELLED'
  | 'REASSIGNED';

export interface JobEvent {
  id: string; // UUID
  taskId: string;
  type: JobEventType;
  eventTime: Date;
  actor?: TaskEventActor;   // 누가 변경했는지
  oldStatus?: TaskStatus;   // 이전 상태
  newStatus?: TaskStatus;   // 새 상태
  location?: Location;
  metadata?: Record<string, unknown>;
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

  assignedAssemblerIds: string[];
  createdAt: Date;

  // UI fields (no direct DB column yet)
  estimatedDurationMinutes: number;
  history: JobEvent[];
}

export type AssemblerStatus = 'OFFLINE' | 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'WORKING';

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
  status: AssemblerStatus;
  lastSeenAt: Date;
  mobileNumberPrimary: string;
  mobileNumberSecondary?: string;
}

export interface AssignmentRecommendation {
  assembler: Assembler;
  score: number;
  matchReasons: string[];
}
