// ============================================
// CivicConnect — Mock Database with Seed Data
// ============================================
// In-memory store for hackathon demo. Replace with MongoDB in production.

import { User, Issue, Notification, CitizenUser, WorkerUser, AdminUser } from '@/types';

// --- Seed Users ---

const seedCitizens: CitizenUser[] = [
  {
    id: 'citizen-1',
    firebaseUid: 'fb-citizen-1',
    name: 'Arjun Mehta',
    email: 'arjun@example.com',
    phone: '9876543210',
    role: 'citizen',
    address: '42 MG Road, Sector 5',
    area: 'Zone B - Midtown',
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-08-01T10:00:00Z',
  },
  {
    id: 'citizen-2',
    firebaseUid: 'fb-citizen-2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9876543211',
    role: 'citizen',
    address: '15 Park Avenue, Sector 12',
    area: 'Zone A - Downtown',
    createdAt: '2025-08-05T10:00:00Z',
    updatedAt: '2025-08-05T10:00:00Z',
  },
  {
    id: 'citizen-3',
    firebaseUid: 'fb-citizen-3',
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    role: 'citizen',
    area: 'Zone C - Uptown',
    createdAt: '2025-08-10T10:00:00Z',
    updatedAt: '2025-08-10T10:00:00Z',
  },
];

const seedWorkers: WorkerUser[] = [
  {
    id: 'worker-1',
    firebaseUid: 'fb-worker-1',
    name: 'Vikram Singh',
    email: 'vikram@civic.gov',
    phone: '9876543220',
    role: 'worker',
    department: 'infrastructure',
    designation: 'Road Worker',
    employeeId: 'EMP-1001',
    assignedZone: 'Zone A - Downtown',
    contactNumber: '9876543220',
    isActive: true,
    tasksCompleted: 23,
    avgResolutionTime: 4.5,
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'worker-2',
    firebaseUid: 'fb-worker-2',
    name: 'Deepak Kumar',
    email: 'deepak@civic.gov',
    phone: '9876543221',
    role: 'worker',
    department: 'sanitation',
    designation: 'Sanitation Supervisor',
    employeeId: 'EMP-1002',
    assignedZone: 'Zone B - Midtown',
    contactNumber: '9876543221',
    isActive: true,
    tasksCompleted: 45,
    avgResolutionTime: 2.1,
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'worker-3',
    firebaseUid: 'fb-worker-3',
    name: 'Suresh Patel',
    email: 'suresh@civic.gov',
    phone: '9876543222',
    role: 'worker',
    department: 'public_safety',
    designation: 'Street Light Technician',
    employeeId: 'EMP-1003',
    assignedZone: 'Zone A - Downtown',
    contactNumber: '9876543222',
    isActive: true,
    tasksCompleted: 31,
    avgResolutionTime: 3.2,
    createdAt: '2025-07-15T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'worker-4',
    firebaseUid: 'fb-worker-4',
    name: 'Anil Reddy',
    email: 'anil@civic.gov',
    phone: '9876543223',
    role: 'worker',
    department: 'water_supply',
    designation: 'Plumber',
    employeeId: 'EMP-1004',
    assignedZone: 'Zone C - Uptown',
    contactNumber: '9876543223',
    isActive: true,
    tasksCompleted: 18,
    avgResolutionTime: 5.0,
    createdAt: '2025-07-20T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'worker-5',
    firebaseUid: 'fb-worker-5',
    name: 'Rajesh Nair',
    email: 'rajesh@civic.gov',
    phone: '9876543224',
    role: 'worker',
    department: 'parks_environment',
    designation: 'Park Supervisor',
    employeeId: 'EMP-1005',
    assignedZone: 'Zone D - Westside',
    contactNumber: '9876543224',
    isActive: false,
    tasksCompleted: 12,
    avgResolutionTime: 6.3,
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'worker-6',
    firebaseUid: 'fb-worker-6',
    name: 'Manoj Tiwari',
    email: 'manoj@civic.gov',
    phone: '9876543225',
    role: 'worker',
    department: 'transportation',
    designation: 'Traffic Controller',
    employeeId: 'EMP-1006',
    assignedZone: 'Zone B - Midtown',
    contactNumber: '9876543225',
    isActive: true,
    tasksCompleted: 37,
    avgResolutionTime: 1.8,
    createdAt: '2025-07-10T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
];

const seedAdmins: AdminUser[] = [
  {
    id: 'admin-1',
    firebaseUid: 'fb-admin-1',
    name: 'Kavita Desai',
    email: 'kavita@civic.gov',
    phone: '9876543200',
    role: 'admin',
    adminId: 'ADM-001',
    departmentOversight: ['infrastructure', 'sanitation', 'public_safety', 'transportation', 'parks_environment', 'water_supply'],
    accessLevel: 'super_admin',
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'admin-2',
    firebaseUid: 'fb-admin-2',
    name: 'Ravi Gupta',
    email: 'ravi@civic.gov',
    phone: '9876543201',
    role: 'admin',
    adminId: 'ADM-002',
    departmentOversight: ['infrastructure', 'transportation'],
    accessLevel: 'department_admin',
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
];

// --- Seed Issues ---
// Coordinates are around a fictional Indian city center (using Bangalore-like coords)

const seedIssues: Issue[] = [
  {
    id: 'issue-1',
    title: 'Large pothole on MG Road',
    description: 'A dangerous pothole has formed near the bus stop on MG Road. Multiple vehicles have been damaged. Needs urgent repair.',
    category: 'pothole',
    department: 'infrastructure',
    status: 'in_progress',
    urgency: 'high',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716],
      address: 'MG Road, near Central Bus Stop, Sector 5',
    },
    photos: ['/demo/pothole1.jpg'],
    reportedBy: 'citizen-1',
    reporterName: 'Arjun Mehta',
    assignedTo: 'worker-1',
    assignedWorkerName: 'Vikram Singh',
    upvotes: ['citizen-2', 'citizen-3'],
    upvoteCount: 2,
    createdAt: '2025-09-10T08:30:00Z',
    updatedAt: '2025-09-12T14:00:00Z',
  },
  {
    id: 'issue-2',
    title: 'Streetlight out on Park Avenue',
    description: 'The streetlight outside 15 Park Avenue has been non-functional for 3 days. The area becomes very dark and unsafe at night.',
    category: 'broken_streetlight',
    department: 'public_safety',
    status: 'assigned',
    urgency: 'medium',
    location: {
      type: 'Point',
      coordinates: [77.5890, 12.9750],
      address: '15 Park Avenue, Sector 12',
    },
    photos: ['/demo/streetlight1.jpg'],
    reportedBy: 'citizen-2',
    reporterName: 'Priya Sharma',
    assignedTo: 'worker-3',
    assignedWorkerName: 'Suresh Patel',
    upvotes: ['citizen-1'],
    upvoteCount: 1,
    createdAt: '2025-09-11T19:45:00Z',
    updatedAt: '2025-09-13T09:00:00Z',
  },
  {
    id: 'issue-3',
    title: 'Garbage overflow at Market Junction',
    description: 'The garbage bins at Market Junction have been overflowing for 2 days. The smell is unbearable and causing health concerns for nearby residents and shopkeepers.',
    category: 'garbage_overflow',
    department: 'sanitation',
    status: 'resolved',
    urgency: 'high',
    location: {
      type: 'Point',
      coordinates: [77.5980, 12.9680],
      address: 'Market Junction, Sector 3',
    },
    photos: ['/demo/garbage1.jpg'],
    reportedBy: 'citizen-3',
    reporterName: 'Rahul Verma',
    assignedTo: 'worker-2',
    assignedWorkerName: 'Deepak Kumar',
    upvotes: ['citizen-1', 'citizen-2'],
    upvoteCount: 2,
    resolutionPhoto: '/demo/garbage_resolved.jpg',
    resolutionNotes: 'All bins cleared and sanitized. Additional bin placed at the location.',
    resolvedAt: '2025-09-12T16:30:00Z',
    createdAt: '2025-09-09T07:00:00Z',
    updatedAt: '2025-09-12T16:30:00Z',
  },
  {
    id: 'issue-4',
    title: 'Water pipe leak on 3rd Cross Road',
    description: 'A water pipe has burst on 3rd Cross Road causing water wastage and road flooding. The leak has been ongoing for about 6 hours.',
    category: 'water_leak',
    department: 'water_supply',
    status: 'reported',
    urgency: 'high',
    location: {
      type: 'Point',
      coordinates: [77.6010, 12.9730],
      address: '3rd Cross Road, Sector 7',
    },
    photos: ['/demo/waterleak1.jpg'],
    reportedBy: 'citizen-1',
    reporterName: 'Arjun Mehta',
    upvotes: [],
    upvoteCount: 0,
    createdAt: '2025-09-14T11:20:00Z',
    updatedAt: '2025-09-14T11:20:00Z',
  },
  {
    id: 'issue-5',
    title: 'Fallen tree blocking Elm Street',
    description: 'A large tree has fallen after last night\'s storm and is completely blocking Elm Street. No vehicles or pedestrians can pass through.',
    category: 'fallen_tree',
    department: 'parks_environment',
    status: 'acknowledged',
    urgency: 'high',
    location: {
      type: 'Point',
      coordinates: [77.5860, 12.9790],
      address: 'Elm Street, Sector 15',
    },
    photos: ['/demo/tree1.jpg'],
    reportedBy: 'citizen-2',
    reporterName: 'Priya Sharma',
    upvotes: ['citizen-1', 'citizen-3'],
    upvoteCount: 2,
    createdAt: '2025-09-13T06:15:00Z',
    updatedAt: '2025-09-13T10:00:00Z',
  },
  {
    id: 'issue-6',
    title: 'Traffic signal malfunction at Circle Road',
    description: 'The traffic signal at Circle Road junction has been stuck on red for the north-south direction since morning. Causing major traffic jams.',
    category: 'traffic_signal',
    department: 'transportation',
    status: 'in_progress',
    urgency: 'high',
    location: {
      type: 'Point',
      coordinates: [77.5920, 12.9760],
      address: 'Circle Road Junction, Central Area',
    },
    photos: ['/demo/signal1.jpg'],
    reportedBy: 'citizen-3',
    reporterName: 'Rahul Verma',
    assignedTo: 'worker-6',
    assignedWorkerName: 'Manoj Tiwari',
    upvotes: ['citizen-1', 'citizen-2'],
    upvoteCount: 2,
    createdAt: '2025-09-14T07:45:00Z',
    updatedAt: '2025-09-14T09:30:00Z',
  },
  {
    id: 'issue-7',
    title: 'Drainage blocked near school',
    description: 'The drainage near City Public School is completely blocked causing water stagnation. Mosquito breeding ground forming. Children at risk.',
    category: 'drainage_block',
    department: 'sanitation',
    status: 'assigned',
    urgency: 'medium',
    location: {
      type: 'Point',
      coordinates: [77.6050, 12.9700],
      address: 'Near City Public School, Sector 9',
    },
    photos: ['/demo/drain1.jpg'],
    reportedBy: 'citizen-1',
    reporterName: 'Arjun Mehta',
    assignedTo: 'worker-2',
    assignedWorkerName: 'Deepak Kumar',
    upvotes: ['citizen-2'],
    upvoteCount: 1,
    createdAt: '2025-09-12T14:30:00Z',
    updatedAt: '2025-09-13T11:00:00Z',
  },
  {
    id: 'issue-8',
    title: 'Road cracks on Highway Service Road',
    description: 'Multiple large cracks have appeared on the highway service road near the toll plaza. Risk of accidents especially for two-wheelers.',
    category: 'road_damage',
    department: 'infrastructure',
    status: 'reported',
    urgency: 'medium',
    location: {
      type: 'Point',
      coordinates: [77.5830, 12.9650],
      address: 'Highway Service Road, near Toll Plaza',
    },
    photos: ['/demo/road1.jpg'],
    reportedBy: 'citizen-2',
    reporterName: 'Priya Sharma',
    upvotes: [],
    upvoteCount: 0,
    createdAt: '2025-09-14T16:00:00Z',
    updatedAt: '2025-09-14T16:00:00Z',
  },
  {
    id: 'issue-9',
    title: 'Illegal dumping behind community center',
    description: 'Someone has been illegally dumping construction debris behind the community center for the past week. The pile is growing daily.',
    category: 'illegal_dumping',
    department: 'sanitation',
    status: 'reported',
    urgency: 'low',
    location: {
      type: 'Point',
      coordinates: [77.5960, 12.9810],
      address: 'Behind Community Center, Sector 20',
    },
    photos: ['/demo/dump1.jpg'],
    reportedBy: 'citizen-3',
    reporterName: 'Rahul Verma',
    upvotes: [],
    upvoteCount: 0,
    createdAt: '2025-09-13T12:00:00Z',
    updatedAt: '2025-09-13T12:00:00Z',
  },
  {
    id: 'issue-10',
    title: 'Park bench vandalized in Central Park',
    description: 'Several benches in Central Park have been vandalized and broken. Broken wood and nails pose a safety hazard for children.',
    category: 'park_damage',
    department: 'parks_environment',
    status: 'resolved',
    urgency: 'low',
    location: {
      type: 'Point',
      coordinates: [77.5900, 12.9770],
      address: 'Central Park, Sector 4',
    },
    photos: ['/demo/park1.jpg'],
    reportedBy: 'citizen-1',
    reporterName: 'Arjun Mehta',
    assignedTo: 'worker-5',
    assignedWorkerName: 'Rajesh Nair',
    upvotes: ['citizen-2'],
    upvoteCount: 1,
    resolutionPhoto: '/demo/park_resolved.jpg',
    resolutionNotes: 'All damaged benches replaced with new ones. Area cleaned up.',
    resolvedAt: '2025-09-11T15:00:00Z',
    createdAt: '2025-09-08T09:00:00Z',
    updatedAt: '2025-09-11T15:00:00Z',
  },
];

// --- Seed Notifications ---

const seedNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'citizen-1',
    title: 'Issue Update',
    message: 'Your report "Large pothole on MG Road" is now In Progress',
    type: 'status_update',
    issueId: 'issue-1',
    read: false,
    createdAt: '2025-09-12T14:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'worker-1',
    title: 'New Task Assigned',
    message: 'You have been assigned: "Large pothole on MG Road"',
    type: 'new_assignment',
    issueId: 'issue-1',
    read: true,
    createdAt: '2025-09-11T10:00:00Z',
  },
  {
    id: 'notif-3',
    userId: 'citizen-1',
    title: 'Someone upvoted your report',
    message: 'Priya Sharma upvoted "Large pothole on MG Road"',
    type: 'upvote',
    issueId: 'issue-1',
    read: true,
    createdAt: '2025-09-10T15:00:00Z',
  },
  {
    id: 'notif-4',
    userId: 'worker-2',
    title: 'New Task Assigned',
    message: 'You have been assigned: "Drainage blocked near school"',
    type: 'new_assignment',
    issueId: 'issue-7',
    read: false,
    createdAt: '2025-09-13T11:00:00Z',
  },
];

// ============================================
// In-Memory Database Store
// ============================================

class MockDatabase {
  private users: User[] = [...seedCitizens, ...seedWorkers, ...seedAdmins];
  private issues: Issue[] = [...seedIssues];
  private notifications: Notification[] = [...seedNotifications];
  private nextIssueId = 11;
  private nextNotifId = 5;

  // --- Users ---

  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  getUserByFirebaseUid(uid: string): User | undefined {
    return this.users.find((u) => u.firebaseUid === uid);
  }

  getWorkers(filters?: { department?: string; zone?: string; isActive?: boolean }): WorkerUser[] {
    let workers = this.users.filter((u): u is WorkerUser => u.role === 'worker');
    if (filters?.department) {
      workers = workers.filter((w) => w.department === filters.department);
    }
    if (filters?.zone) {
      workers = workers.filter((w) => w.assignedZone === filters.zone);
    }
    if (filters?.isActive !== undefined) {
      workers = workers.filter((w) => w.isActive === filters.isActive);
    }
    return workers;
  }

  addUser(user: User): User {
    this.users.push(user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date().toISOString() } as User;
    return this.users[index];
  }

  // --- Issues ---

  getIssues(filters?: {
    department?: string;
    status?: string;
    urgency?: string;
    zone?: string;
    reportedBy?: string;
    assignedTo?: string;
  }): Issue[] {
    let issues = [...this.issues];
    if (filters?.department) {
      issues = issues.filter((i) => i.department === filters.department);
    }
    if (filters?.status) {
      issues = issues.filter((i) => i.status === filters.status);
    }
    if (filters?.urgency) {
      issues = issues.filter((i) => i.urgency === filters.urgency);
    }
    if (filters?.reportedBy) {
      issues = issues.filter((i) => i.reportedBy === filters.reportedBy);
    }
    if (filters?.assignedTo) {
      issues = issues.filter((i) => i.assignedTo === filters.assignedTo);
    }
    // Sort by creation date (newest first)
    issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return issues;
  }

  getIssueById(id: string): Issue | undefined {
    return this.issues.find((i) => i.id === id);
  }

  addIssue(issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'upvoteCount'>): Issue {
    const issue: Issue = {
      ...issueData,
      id: `issue-${this.nextIssueId++}`,
      upvotes: [],
      upvoteCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.issues.push(issue);
    return issue;
  }

  updateIssue(id: string, updates: Partial<Issue>): Issue | undefined {
    const index = this.issues.findIndex((i) => i.id === id);
    if (index === -1) return undefined;
    this.issues[index] = { ...this.issues[index], ...updates, updatedAt: new Date().toISOString() };
    return this.issues[index];
  }

  toggleUpvote(issueId: string, userId: string): Issue | undefined {
    const issue = this.issues.find((i) => i.id === issueId);
    if (!issue) return undefined;
    const idx = issue.upvotes.indexOf(userId);
    if (idx === -1) {
      issue.upvotes.push(userId);
    } else {
      issue.upvotes.splice(idx, 1);
    }
    issue.upvoteCount = issue.upvotes.length;
    issue.updatedAt = new Date().toISOString();
    return issue;
  }

  deleteIssue(id: string): boolean {
    const index = this.issues.findIndex((i) => i.id === id);
    if (index === -1) return false;
    this.issues.splice(index, 1);
    return true;
  }

  // --- Notifications ---

  getNotifications(userId: string): Notification[] {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addNotification(data: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const notification: Notification = {
      ...data,
      id: `notif-${this.nextNotifId++}`,
      createdAt: new Date().toISOString(),
    };
    this.notifications.push(notification);
    return notification;
  }

  markNotificationRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  }

  // --- Analytics ---

  getAnalytics() {
    const issues = this.issues;
    const resolved = issues.filter((i) => i.status === 'resolved');
    const pending = issues.filter((i) => i.status !== 'resolved');
    const inProgress = issues.filter((i) => i.status === 'in_progress');

    const avgResolutionTime = resolved.length > 0
      ? resolved.reduce((sum, i) => {
          if (i.resolvedAt) {
            const hours = (new Date(i.resolvedAt).getTime() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60);
            return sum + hours;
          }
          return sum;
        }, 0) / resolved.length
      : 0;

    const issuesByDepartment: Record<string, number> = {};
    const issuesByStatus: Record<string, number> = {};
    const issuesByUrgency: Record<string, number> = {};

    issues.forEach((issue) => {
      issuesByDepartment[issue.department] = (issuesByDepartment[issue.department] || 0) + 1;
      issuesByStatus[issue.status] = (issuesByStatus[issue.status] || 0) + 1;
      issuesByUrgency[issue.urgency] = (issuesByUrgency[issue.urgency] || 0) + 1;
    });

    // Generate trend data for last 7 days
    const issuesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      issuesTrend.push({
        date: dateStr,
        count: Math.floor(Math.random() * 5) + 1,
        resolved: Math.floor(Math.random() * 3),
      });
    }

    return {
      totalIssues: issues.length,
      resolvedIssues: resolved.length,
      pendingIssues: pending.length,
      inProgressIssues: inProgress.length,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      issuesByDepartment,
      issuesByStatus,
      issuesByUrgency,
      issuesTrend,
      topZones: [
        { zone: 'Zone A - Downtown', count: 4 },
        { zone: 'Zone B - Midtown', count: 3 },
        { zone: 'Zone C - Uptown', count: 2 },
        { zone: 'Zone D - Westside', count: 1 },
      ],
    };
  }
}

// Singleton instance
const db = new MockDatabase();
export default db;
