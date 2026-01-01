
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string;
  avatarUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  tenantId: string;
  memberCount: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedToId: string;
  assignedToName?: string;
  teamId: string;
  tenantId: string;
  createdByUserId: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  tenantId: string;
  timestamp: string;
  details: string;
}

export interface DashboardStats {
  completedTasks: number;
  pendingTasks: number;
  activeUsers: number;
  tasksByStatus: { name: string; value: number }[];
  weeklyCompletion: { day: string; completed: number }[];
}
