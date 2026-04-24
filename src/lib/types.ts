export type DomainSkill = 'CABINETRY' | 'PLUMBING' | 'ELECTRICAL' | 'MEASURING' | 'COUNTERTOP';

export type TaskType =
  | 'MEASURING'          // 사전 실측
  | 'DELIVERY'           // 자재 배송
  | 'CABINET_INSTALL'    // 캐비닛 설치
  | 'PLUMBING_INSTALL'   // 배관 작업
  | 'ELECTRICAL_INSTALL' // 전기 작업
  | 'COUNTERTOP_INSTALL' // 상판 설치
  | 'FINISHING'          // 마감 작업
  | 'GENERAL_ASSEMBLY';  // 일반 가구 조립 (레거시 호환)

export type EvidenceType = 'LEVELING' | 'PLUMBING_CONNECTION' | 'SILICONE_FINISH' | 'ELECTRICAL_CONNECTION' | 'OVERALL' | 'ISSUE_PHOTO';

/** Required evidence categories for kitchen task completion */
export const KITCHEN_REQUIRED_EVIDENCE: EvidenceType[] = ['LEVELING', 'SILICONE_FINISH', 'OVERALL'];

export type UserRole = 'ADMIN' | 'DISPATCHER' | 'ASSEMBLER';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  region?: string;
  assembler_id?: string;
}


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
  // Kitchen Planner Integration (제안 3)
  kitchenDesignCode?: string;  // IKEA Home Planner 설계 코드
  plannerPdfUrl?: string;      // PDF 도면 링크
  plannerData?: Record<string, unknown>; // 3D 데이터 메타정보
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
  | 'CREATED'              // 주문 접수, 배정 전
  | 'SCHEDULING'           // 시스템이 배정 중
  | 'ASSIGNED'             // Assembler에게 배정됨
  | 'CONFIRMED'            // Assembler가 수락함
  | 'EN_ROUTE'             // Assembler 이동 중
  | 'ARRIVED'              // 현장 도착
  | 'MATERIALS_VERIFIED'   // 자재 배송 확인됨 (Kitchen)
  | 'IN_PROGRESS'          // 조립 작업 중
  | 'COMPLETED'            // 작업 완료
  | 'VERIFIED'             // Admin 검수 완료
  | 'ISSUE'                // 문제 발생
  | 'CANCELLED';           // 취소됨

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
  requiredSkills: DomainSkill[]; // Domain-specific skills
  taskType: TaskType;            // 작업 유형
  isKitchenTask: boolean;        // Kitchen 작업 여부

  // Planning
  scheduledStart?: Date;
  scheduledEnd?: Date;

  // Execution
  actualStart?: Date;
  actualEnd?: Date;

  assignedAssemblerIds: string[];
  createdAt: Date;

  // UI fields
  estimatedDurationMinutes: number;
  history: JobEvent[];
}

export type AssemblerStatus = 'OFFLINE' | 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'WORKING' | 'BUSY' | 'INACTIVE';

export interface Assembler {
  id: string; // UUID (user_id)
  email?: string; // from profiles
  name: string;
  avatarUrl?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  rating: number;
  ratingCount: number;
  currentLocation: Location;

  // Relations
  skills: DomainSkill[];          // Domain-specific skills
  certifications: Record<string, { number: string; expiry: string }>; // skill → cert info
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
