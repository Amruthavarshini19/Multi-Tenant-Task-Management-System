import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import TaskModal from '../components/TaskModal';
import { Plus, Search, CheckCircle2, Clock, CheckSquare } from 'lucide-react';

const MyTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/tasks');
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update task status (permission denied).');
    }
  };

  const roleFilteredTasks = tasks.filter(task => {
    if (user?.role === 'admin') return true;
    return task.assignedTo === user?.id || task.assigned_to === user?.id;
  });

  const filteredTasks = roleFilteredTasks.filter(t => filter === 'all' ? true : t.status === filter);
  
  const allCount = roleFilteredTasks.length;
  const todoCount = roleFilteredTasks.filter(t=>t.status==='todo').length;
  const progressCount = roleFilteredTasks.filter(t=>t.status==='in_progress').length;
  const doneCount = roleFilteredTasks.filter(t=>t.status==='done').length;

  const KanbanColumn = ({ title, status, color }) => {
    const columnTasks = filteredTasks.filter(t => t.status === status);
    
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

  const FilterButton = ({ label, value, count }) => (
    <button 
      onClick={() => setFilter(value)}
      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === value ? 'bg-primary text-white shadow-md' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
    >
      {label} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === value ? 'bg-white/20' : 'bg-background'}`}>{count}</span>
    </button>
  );

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">
        <header className="h-16 border-b border-border shadow-sm shadow-foreground/5 px-8 flex items-center justify-between sticky top-0 bg-surface/95 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">{user?.role === 'admin' ? 'All Tasks' : 'My Tasks'} - {user?.orgName || 'Workspace'}</h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user?.role === 'admin' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-primary-foreground h-10 px-4 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Task</span>
              </button>
            )}
          </div>
        </header>

        <TaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onTaskCreated={fetchData} 
        />

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <FilterButton label="All Tasks" value="all" count={allCount} />
            <FilterButton label="To Do" value="todo" count={todoCount} />
            <FilterButton label="In Progress" value="in_progress" count={progressCount} />
            <FilterButton label="Done" value="done" count={doneCount} />
          </div>

          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              Sprint Board Execution
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
      </main>
    </div>
  );
};

export default MyTasks;
