
import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, UserRole, Task, TaskStatus, TaskPriority, 
  AuditLog, DashboardStats, Team 
} from './types';
import { db } from './services/mockDatabase';
import { authService } from './services/authService';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import AuditLogs from './components/AuditLogs';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ email: 'admin@acme.com', password: 'hashed_password' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Application Data (Sync with DB)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const tenantId = currentUser.tenantId;
      setTasks(db.tasks.findMany(tenantId));
      setUsers(db.users.findMany(tenantId));
      setAuditLogs(db.auditLogs.findMany(tenantId));
      setTeams(db.teams.findMany(tenantId));
    }
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.login(loginForm.email, loginForm.password);
      localStorage.setItem('nexus_auth', JSON.stringify({ user, token }));
      setCurrentUser(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_auth');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const dashboardStats: DashboardStats = useMemo(() => {
    const completed = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const pending = tasks.filter(t => t.status !== TaskStatus.DONE).length;
    
    return {
      completedTasks: completed,
      pendingTasks: pending,
      activeUsers: users.length,
      tasksByStatus: [
        { name: 'To Do', value: tasks.filter(t => t.status === TaskStatus.TODO).length },
        { name: 'In Progress', value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length },
        { name: 'Completed', value: completed }
      ],
      weeklyCompletion: [
        { day: 'Mon', completed: 4 },
        { day: 'Tue', completed: 7 },
        { day: 'Wed', completed: 5 },
        { day: 'Thu', completed: 8 },
        { day: 'Fri', completed: 12 },
        { day: 'Sat', completed: 3 },
        { day: 'Sun', completed: 2 },
      ]
    };
  }, [tasks, users]);

  const refreshData = () => {
    if (currentUser) {
      setTasks(db.tasks.findMany(currentUser.tenantId));
      setAuditLogs(db.auditLogs.findMany(currentUser.tenantId));
    }
  };

  const handleAddTask = (taskData: Partial<Task>) => {
    if (!currentUser) return;
    db.tasks.create({
      ...taskData as any,
      tenantId: currentUser.tenantId,
      createdByUserId: currentUser.id,
      teamId: teams[0]?.id || 'unknown'
    });
    refreshData();
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    if (!currentUser) return;
    db.tasks.update(taskId, { status }, currentUser.id);
    refreshData();
  };

  const handleDeleteTask = (taskId: string) => {
    if (!currentUser) return;
    db.tasks.delete(taskId, currentUser.id);
    refreshData();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-10 border border-slate-100 animate-fadeIn">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-6 font-bold text-white text-3xl">
              TN
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2 font-medium">Multi-tenant Production Productivity Platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-center text-slate-400 text-sm font-medium">
              Demo Credentials:<br/>
              <span className="text-indigo-500">admin@acme.com / hashed_password</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={currentUser} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && <Dashboard stats={dashboardStats} />}
      {activeTab === 'tasks' && (
        <TaskBoard 
          tasks={tasks} 
          users={users} 
          onAddTask={handleAddTask}
          onUpdateStatus={handleUpdateTaskStatus}
          onDelete={handleDeleteTask}
        />
      )}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {teams.map(team => (
            <div key={team.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-xl">🚀</div>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">ID: {team.id}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{team.name} Team</h3>
              <p className="text-sm text-slate-500 mb-6">{team.memberCount} members active in organization.</p>
              <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>)}
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">+2</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'audit' && <AuditLogs logs={auditLogs} />}
    </Layout>
  );
};

export default App;
