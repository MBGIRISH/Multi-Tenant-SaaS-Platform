
import { 
  User, Tenant, Team, Task, AuditLog, 
  UserRole, TaskStatus, TaskPriority 
} from '../types';

// Mock DB Initial State
const tenants: Tenant[] = [
  { id: 't1', name: 'Acme Corp', domain: 'acme.com', createdAt: new Date() },
  { id: 't2', name: 'Global Tech', domain: 'global.tech', createdAt: new Date() }
];

const users: (User & { passwordHash: string })[] = [
  { 
    id: 'u1', email: 'admin@acme.com', fullName: 'Alice Admin', 
    role: UserRole.ADMIN, tenantId: 't1', passwordHash: 'hashed_password',
    avatarUrl: 'https://picsum.photos/seed/u1/100/100'
  },
  { 
    id: 'u2', email: 'manager@acme.com', fullName: 'Bob Manager', 
    role: UserRole.MANAGER, tenantId: 't1', passwordHash: 'hashed_password',
    avatarUrl: 'https://picsum.photos/seed/u2/100/100'
  },
  { 
    id: 'u3', email: 'member@acme.com', fullName: 'Charlie Member', 
    role: UserRole.MEMBER, tenantId: 't1', passwordHash: 'hashed_password',
    avatarUrl: 'https://picsum.photos/seed/u3/100/100'
  }
];

const teams: Team[] = [
  { id: 'tm1', name: 'Engineering', tenantId: 't1', memberCount: 5 },
  { id: 'tm2', name: 'Product', tenantId: 't1', memberCount: 3 }
];

let tasks: Task[] = [
  {
    id: 'tk1', title: 'Implement JWT Auth', description: 'Setup secure authentication flow.',
    status: TaskStatus.DONE, priority: TaskPriority.HIGH, dueDate: '2024-05-20',
    assignedToId: 'u1', teamId: 'tm1', tenantId: 't1', createdByUserId: 'u1',
    createdAt: '2024-05-01', assignedToName: 'Alice Admin'
  },
  {
    id: 'tk2', title: 'Design Database Schema', description: 'Finalize Prisma schema with relations.',
    status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, dueDate: '2024-05-25',
    assignedToId: 'u2', teamId: 'tm1', tenantId: 't1', createdByUserId: 'u1',
    createdAt: '2024-05-02', assignedToName: 'Bob Manager'
  },
  {
    id: 'tk3', title: 'UI Review', description: 'Feedback on latest dashboard wireframes.',
    status: TaskStatus.TODO, priority: TaskPriority.LOW, dueDate: '2024-06-01',
    assignedToId: 'u3', teamId: 'tm2', tenantId: 't1', createdByUserId: 'u2',
    createdAt: '2024-05-05', assignedToName: 'Charlie Member'
  }
];

let auditLogs: AuditLog[] = [
  { id: 'a1', action: 'TASK_CREATED', userId: 'u1', userName: 'Alice Admin', tenantId: 't1', timestamp: new Date().toISOString(), details: 'Created task tk1' }
];

// Database Interaction Layer (Simulating Prisma Service)
export const db = {
  users: {
    findMany: (tenantId: string) => users.filter(u => u.tenantId === tenantId),
    findByEmail: (email: string) => users.find(u => u.email === email)
  },
  tenants: {
    findById: (id: string) => tenants.find(t => t.id === id)
  },
  teams: {
    findMany: (tenantId: string) => teams.filter(t => t.tenantId === tenantId)
  },
  tasks: {
    findMany: (tenantId: string) => tasks.filter(t => t.tenantId === tenantId),
    create: (taskData: Omit<Task, 'id' | 'createdAt'>) => {
      const newTask = {
        ...taskData,
        id: `tk${Date.now()}`,
        createdAt: new Date().toISOString(),
        assignedToName: users.find(u => u.id === taskData.assignedToId)?.fullName
      };
      tasks.push(newTask);
      db.auditLogs.create({
        action: 'TASK_CREATED',
        userId: taskData.createdByUserId,
        userName: users.find(u => u.id === taskData.createdByUserId)?.fullName || 'System',
        tenantId: taskData.tenantId,
        details: `Created task: ${newTask.title}`
      });
      return newTask;
    },
    update: (id: string, updates: Partial<Task>, userId: string) => {
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
        db.auditLogs.create({
          action: 'TASK_UPDATED',
          userId,
          userName: users.find(u => u.id === userId)?.fullName || 'System',
          tenantId: tasks[index].tenantId,
          details: `Updated task: ${tasks[index].title}`
        });
        return tasks[index];
      }
      return null;
    },
    delete: (id: string, userId: string) => {
      const task = tasks.find(t => t.id === id);
      if (task) {
        tasks = tasks.filter(t => t.id !== id);
        db.auditLogs.create({
          action: 'TASK_DELETED',
          userId,
          userName: users.find(u => u.id === userId)?.fullName || 'System',
          tenantId: task.tenantId,
          details: `Deleted task: ${task.title}`
        });
      }
    }
  },
  auditLogs: {
    findMany: (tenantId: string) => auditLogs.filter(a => a.tenantId === tenantId).sort((a,b) => b.timestamp.localeCompare(a.timestamp)),
    create: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
      auditLogs.push({ ...log, id: `a${Date.now()}`, timestamp: new Date().toISOString() });
    }
  }
};
