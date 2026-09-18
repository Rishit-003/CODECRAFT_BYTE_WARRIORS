// ============================================
// CivicConnect — App Constants
// ============================================

import { Department, IssueCategory, IssueStatus, UrgencyLevel } from '@/types';

// --- Department Configuration ---

export const DEPARTMENTS: Record<Department, {
  label: string;
  icon: string;
  color: string;
  roles: string[];
}> = {
  transportation: {
    label: 'Transportation',
    icon: '🚗',
    color: '#3b82f6',
    roles: ['Driver', 'Traffic Controller', 'Transit Supervisor'],
  },
  infrastructure: {
    label: 'Infrastructure',
    icon: '🏗️',
    color: '#f59e0b',
    roles: ['Electrician', 'Road Worker', 'Plumber', 'Civil Engineer'],
  },
  sanitation: {
    label: 'Sanitation',
    icon: '🧹',
    color: '#10b981',
    roles: ['Garbage Collector', 'Sanitation Supervisor', 'Drainage Technician'],
  },
  public_safety: {
    label: 'Public Safety',
    icon: '🛡️',
    color: '#ef4444',
    roles: ['Security Officer', 'Street Light Technician', 'Emergency Responder'],
  },
  parks_environment: {
    label: 'Parks & Environment',
    icon: '🌳',
    color: '#22c55e',
    roles: ['Gardener', 'Tree Maintenance', 'Park Supervisor'],
  },
  water_supply: {
    label: 'Water Supply',
    icon: '💧',
    color: '#06b6d4',
    roles: ['Plumber', 'Water Quality Inspector'],
  },
};

// --- Category to Department Mapping ---

export const CATEGORY_CONFIG: Record<IssueCategory, {
  label: string;
  department: Department;
  icon: string;
  description: string;
}> = {
  pothole: {
    label: 'Pothole',
    department: 'infrastructure',
    icon: '🕳️',
    description: 'Road surface damage or potholes',
  },
  broken_streetlight: {
    label: 'Broken Streetlight',
    department: 'public_safety',
    icon: '💡',
    description: 'Non-functional or damaged street lights',
  },
  garbage_overflow: {
    label: 'Garbage Overflow',
    department: 'sanitation',
    icon: '🗑️',
    description: 'Overflowing bins or uncollected garbage',
  },
  water_leak: {
    label: 'Water Leak',
    department: 'water_supply',
    icon: '💧',
    description: 'Water pipe leaks or burst mains',
  },
  road_damage: {
    label: 'Road Damage',
    department: 'infrastructure',
    icon: '🚧',
    description: 'Cracked, broken, or damaged roads',
  },
  fallen_tree: {
    label: 'Fallen Tree',
    department: 'parks_environment',
    icon: '🌲',
    description: 'Fallen or dangerous trees blocking paths',
  },
  traffic_signal: {
    label: 'Traffic Signal Issue',
    department: 'transportation',
    icon: '🚦',
    description: 'Malfunctioning traffic signals or signs',
  },
  drainage_block: {
    label: 'Drainage Blockage',
    department: 'sanitation',
    icon: '🌊',
    description: 'Blocked drains or flooding areas',
  },
  illegal_dumping: {
    label: 'Illegal Dumping',
    department: 'sanitation',
    icon: '⚠️',
    description: 'Unauthorized waste dumping',
  },
  park_damage: {
    label: 'Park Damage',
    department: 'parks_environment',
    icon: '🏞️',
    description: 'Damaged park facilities or equipment',
  },
  noise_complaint: {
    label: 'Noise Complaint',
    department: 'public_safety',
    icon: '🔊',
    description: 'Excessive noise disturbance',
  },
  other: {
    label: 'Other',
    department: 'infrastructure',
    icon: '📋',
    description: 'Other infrastructure or civic issue',
  },
};

// --- Status Configuration ---

export const STATUS_CONFIG: Record<IssueStatus, {
  label: string;
  color: string;
  bgColor: string;
  step: number;
}> = {
  reported: {
    label: 'Reported',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
    step: 0,
  },
  acknowledged: {
    label: 'Acknowledged',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    step: 1,
  },
  assigned: {
    label: 'Assigned',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    step: 2,
  },
  inspection: {
    label: 'Inspection',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    step: 3,
  },
  in_progress: {
    label: 'In Progress',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    step: 4,
  },
  resolved: {
    label: 'Resolved',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    step: 5,
  },
  admin_review: {
    label: 'Admin Review',
    color: '#0ea5e9',
    bgColor: 'rgba(14, 165, 233, 0.15)',
    step: 6,
  },
  closed: {
    label: 'Closed',
    color: '#64748b',
    bgColor: 'rgba(100, 116, 139, 0.15)',
    step: 7,
  },
  reopened: {
    label: 'Reopened',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    step: 2,
  },
  rejected: {
    label: 'Rejected',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    step: -1,
  },
  referred: {
    label: 'Referred',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    step: 1,
  },
};

// --- Urgency Configuration ---

export const URGENCY_CONFIG: Record<UrgencyLevel, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  low: {
    label: 'Low',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: '🟢',
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: '🟡',
  },
  high: {
    label: 'High',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: '🔴',
  },
};

// --- Zones/Wards ---

export const ZONES = [
  'Zone A - Downtown',
  'Zone B - Midtown',
  'Zone C - Uptown',
  'Zone D - Westside',
  'Zone E - Eastside',
  'Zone F - Northside',
  'Zone G - Southside',
  'Zone H - Industrial',
  'Zone I - Suburban East',
  'Zone J - Suburban West',
];

// --- Status Pipeline Order ---

export const STATUS_PIPELINE: IssueStatus[] = [
  'reported',
  'acknowledged',
  'assigned',
  'inspection',
  'in_progress',
  'resolved',
  'admin_review',
  'closed',
];
