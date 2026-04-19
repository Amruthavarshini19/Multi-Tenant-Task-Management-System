import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import TaskModal from '../components/TaskModal';
import { 
  Plus, 
  Search, 
  Circle, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Calendar,
  User,
  CheckSquare,
  LayoutDashboard
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [tasksRes, auditRes] = await Promise.all([
        axios.get('http://localhost:4000/api/tasks'),
        user?.role === 'admin' ? axios.get('http://localhost:4000/api/audit') : Promise.resolve({ data: [] })
      ]);
      
      const tasksData = tasksRes.data || [];
      setTasks(tasksData);
      setActivities(auditRes.data || []);
      
      const total = tasksData.length || 0;
      const pending = tasksData.filter(t => t.status !== 'done').length || 0;
      const completed = tasksData.filter(t => t.status === 'done').length || 0;
      setStats({ total, pending, completed });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="premium-card p-6 rounded-2xl relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500`} style={{ backgroundColor: color }} />
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl`} style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">{trend}</span>
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
      </div>
    </div>
  );

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`http://localhost:4000/api/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update task status (permission denied).');
    }
  };

  const KanbanColumn = ({ title, status, color }) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className="flex-1 min-w-[300px] column-card rounded-3xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="font-bold flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            {title}
          </h4>
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-bold">
            {columnTasks.length}
          </span>
        </div>
        
        <div className="flex flex-col gap-3">
          {columnTasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
              No tasks here
            </div>
          ) : (
            columnTasks.map(task => (
              <div key={task.id} className="task-card p-4 rounded-xl border-l-4 border-l-transparent hover:border-l-primary group">
                <h5 className="font-bold text-sm mb-1">{task.title}</h5>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-[10px] font-bold uppercase text-primary/70">{new Date(task.due_date).toLocaleDateString()}</span>
                  <select 
                    className="text-[10px] uppercase font-bold bg-secondary/50 border-none rounded cursor-pointer px-1 py-0.5"
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  >
                    <option value="todo" className="bg-background text-foreground">To Do</option>
                    <option value="in_progress" className="bg-background text-foreground">In Progress</option>
                    <option value="done" className="bg-background text-foreground">Done</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">
        <header className="h-16 border-b border-border shadow-sm shadow-foreground/5 px-8 flex items-center justify-between sticky top-0 bg-surface/95 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">Project Overview - {user?.orgName || 'Enterprise Workspace'}</h2>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="text-primary">{user?.orgName || 'Enterprise'}</span>
              <span>/</span>
              <span>Workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 h-10 w-64 rounded-xl bg-secondary/50 text-sm focus:w-80 transition-all border-none"
              />
            </div>
            <ThemeToggle />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-primary-foreground h-10 px-4 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </header>

        <TaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onTaskCreated={fetchData} 
        />

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Workload" value={stats.total} icon={CheckSquare} color="#9d4edd" trend="+12%" trendColor="green" />
            <StatCard title="Active Sprints" value={stats.pending} icon={Clock} color="#ff9f1c" trend="+2" />
            <StatCard title="Success Rate" value="98%" icon={CheckCircle2} color="#2ec4b6" trend="High" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Kanban Board Container */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  Sprint Board
                </h3>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-3 gap-6 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-96 glass-card rounded-3xl" />)}
                </div>
              ) : (
                <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                  <KanbanColumn title="To Do" status="todo" color="bg-secondary/80" />
                  <KanbanColumn title="In Progress" status="in_progress" color="bg-orange-500" />
                  <KanbanColumn title="Done" status="done" color="bg-green-500" />
                </div>
              )}
            </div>

            {/* Side Panel: Activity & Info */}
            <div className="space-y-8">
              <div className="glass-card p-6 rounded-3xl bg-primary/5 border-primary/10">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                   Team Activity
                </h3>
                <div className="space-y-6">
                  {user?.role === 'admin' ? activities.slice(0, 5).map(act => (
                    <div key={act.id} className="flex gap-4 relative">
                      <div className="absolute left-4 top-8 bottom-[-24px] w-[1px] bg-border last:hidden" />
                      <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center relative z-10 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-xs tracking-wider uppercase text-primary/80">{act.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(act.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">Admin-only tracking feature.</p>
                  )}
                </div>
                <button className="w-full mt-8 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-secondary transition-colors">
                  Full Activity Log
                </button>
              </div>

              <div className="premium-gradient p-6 rounded-3xl text-white shadow-xl shadow-primary/20">
                <CheckSquare className="w-10 h-10 mb-4 opacity-80" />
                <h4 className="text-xl font-bold mb-2">Upgrade to Pro</h4>
                <p className="text-white/80 text-sm mb-6">Unlock advanced analytics, unlimited members, and custom workflows.</p>
                <button className="w-full py-3 bg-white text-primary rounded-xl font-bold text-sm hover:bg-white/90 active:scale-95 transition-all">
                  Get Unlimited Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};


export default Dashboard;
