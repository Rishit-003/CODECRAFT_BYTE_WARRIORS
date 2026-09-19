// ============================================
// CivicConnect — Core Type Definitions
// ============================================

// --- Enums & Constants ---

export type UserRole = 'citizen' | 'worker' | 'admin';

export type Department =
  | 'transportation'
  | 'infrastructure'
  | 'sanitation'
  | 'public_safety'
  | 'parks_environment'
  | 'water_supply';

export type IssueCategory =
  | 'pothole'
  | 'broken_streetlight'
  | 'garbage_overflow'
  | 'water_leak'
  | 'road_damage'
  | 'fallen_tree'
  | 'traffic_signal'
  | 'drainage_block'
  | 'illegal_dumping'
  | 'park_damage'
  | 'noise_complaint'
  | 'other';

export type IssueStatus =
  | 'reported'
  | 'acknowledged'
  | 'assigned'
  | 'accepted'
  | 'inspection'
  | 'in_progress'
  | 'resolved'
  | 'admin_review'
  | 'closed'
  | 'reopened'
  | 'rejected'
  | 'referred';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export type AccessLevel = 'super_admin' | 'department_admin';

// --- User Types ---

export interface BaseUser {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenUser extends BaseUser {
  role: 'citizen';
  address?: string;
  area?: string;
}

export interface WorkerUser extends BaseUser {
  role: 'worker';
  department: Department;
  designation: string;
  employeeId: string;
  assignedZone: string;
  contactNumber: string;
  isActive: boolean;
  tasksCompleted: number;
  avgResolutionTime: number; // in hours
}

export interface AdminUser extends BaseUser {
  role: 'admin';
  adminId: string;
  departmentOversight: Department[];
  accessLevel: AccessLevel;
}

export type User = CitizenUser | WorkerUser | AdminUser;

// --- Issue Types ---

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  department: Department;
  status: IssueStatus;
  urgency: UrgencyLevel;
  location: GeoLocation;
  photos: string[];
  reportedBy: string; // User ID
  reporterName: string;
  assignedTo?: string; // Worker User ID
  assignedWorkerName?: string;
  assignedAt?: string;
  acceptedAt?: string;
  targetCompletionDate?: string;
  etaDate?: string;
  etaUpdateReason?: string;
  rejectionReason?: string;
  reopenedReason?: string;
  upvotes: string[]; // Array of User IDs
  upvoteCount: number;
  inspectionStartedAt?: string;
  inspectionObservations?: string;
  inspectionRemarks?: string;
  inspectionPhoto?: string;
  workStartedAt?: string;
  workPerformed?: string;
  resolutionPhoto?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  feedback?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

// --- Analytics Types ---

export interface DashboardAnalytics {
  totalIssues: number;
  pendingAssignment: number; // reported, reopened
  assigned: number; // assigned, inspection
  inProgress: number; // in_progress
  resolutionReview: number; // admin_review
  closed: number; // closed, resolved (legacy)
  overdue: number;
  resolvedIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  avgResolutionTime: number; // hours
  issuesByDepartment: Record<Department, number>;
  issuesByStatus: Record<IssueStatus, number>;
  issuesByUrgency: Record<UrgencyLevel, number>;
  issuesTrend: { date: string; count: number; resolved: number }[];
  topZones: { zone: string; count: number }[];
}

// --- Form Types ---

export interface ReportIssueForm {
  title: string;
  description: string;
  category: IssueCategory;
  urgency: UrgencyLevel;
  location: GeoLocation;
  photos: File[];
}

export interface LoginForm {
  email: string;
  password: string;
  role: UserRole;
}

export interface CitizenSignupForm {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  area?: string;
}

export interface WorkerSignupForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  department: Department;
  designation: string;
  employeeId: string;
  assignedZone: string;
  contactNumber: string;
}

export interface AdminSignupForm {
  name: string;
  email: string;
  password: string;
  adminId: string;
  departmentOversight: Department[];
  accessLevel: AccessLevel;
}

// --- Notification Types ---

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_update' | 'new_assignment' | 'upvote' | 'system';
  issueId?: string;
  read: boolean;
  createdAt: string;
}
