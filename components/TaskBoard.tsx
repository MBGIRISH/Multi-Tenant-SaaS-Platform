
import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, User } from '../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../constants';

interface TaskBoardProps {
  tasks: Task[];
  users: User[];
  onAddTask: (task: Partial<Task>) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, users, onAddTask, onUpdateStatus, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    assignedToId: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const columns: { status: TaskStatus; label: string }[] = [
    { status: TaskStatus.TODO, label: 'To Do' },
    { status: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { status: TaskStatus.DONE, label: 'Completed' }
  ];

  const handleCreate = () => {
    if (!newTask.title || !newTask.assignedToId) return;
    onAddTask({
      ...newTask,
      status: TaskStatus.TODO,
    });
    setShowModal(false);
    setNewTask({ title: '', description: '', priority: TaskPriority.MEDIUM, assignedToId: '', dueDate: '' });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex -space-x-2">
          {users.map(u => (
            <img key={u.id} src={u.avatarUrl} title={u.fullName} className="w-8 h-8 rounded-full border-2 border-white" />
          ))}
          <button className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 border-2 border-white">+</button>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span>New Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {columns.map(col => (
          <div key={col.status} className="bg-slate-100/50 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">{col.label}</h3>
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {tasks.filter(t => t.status === col.status).length}
              </span>
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto">
              {tasks.filter(t => t.status === col.status).map(task => (
                <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${STATUS_COLORS[task.status]}`}>
                      {task.priority}
                    </span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onDelete(task.id)} className="text-slate-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">{task.title}</h4>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>{task.dueDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                       {col.status !== TaskStatus.DONE && (
                         <button 
                           onClick={() => onUpdateStatus(task.id, col.status === TaskStatus.TODO ? TaskStatus.IN_PROGRESS : TaskStatus.DONE)}
                           className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                         >
                           {col.status === TaskStatus.TODO ? 'Start →' : 'Done ✓'}
                         </button>
                       )}
                       <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200" title={task.assignedToName}>
                         {task.assignedToName?.charAt(0)}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Create Task</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Title</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="E.g. Setup Redis Cache"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Description</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-24 resize-none"
                    placeholder="Provide some context..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Priority</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
                    >
                      <option value={TaskPriority.LOW}>Low</option>
                      <option value={TaskPriority.MEDIUM}>Medium</option>
                      <option value={TaskPriority.HIGH}>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Assignee</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                      value={newTask.assignedToId}
                      onChange={(e) => setNewTask({...newTask, assignedToId: e.target.value})}
                    >
                      <option value="">Select Member</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Due Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
