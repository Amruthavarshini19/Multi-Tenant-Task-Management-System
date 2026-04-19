import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2, CheckCircle2, Type, FileText, Calendar, Tag, UserPlus } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: ''
  });

  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:4000/api/users').then(({data}) => setMembers(data || []));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/api/tasks', formData);
      onTaskCreated();
      onClose();
      setFormData({ title: '', description: '', status: 'todo', dueDate: new Date().toISOString().split('T')[0], assignedTo: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-primary/20 animate-in zoom-in-95 duration-300">
        <div className="premium-gradient p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6" />
            <h3 className="text-xl font-bold">Create New Task</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-card/50">
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" /> Task Title
            </label>
            <input 
              required
              className="h-12 bg-secondary/50 rounded-xl px-4 border-none text-base font-medium placeholder:font-normal"
              placeholder="e.g. Design the system architecture"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" /> Description
            </label>
            <textarea 
              rows={3}
              className="bg-secondary/50 rounded-xl p-4 border-none text-sm leading-relaxed"
              placeholder="Provide context and details..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> Status
              </label>
              <select 
                className="h-12 bg-secondary/50 rounded-xl px-4 border-none text-sm font-semibold cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="todo" className="bg-background text-foreground">To Do</option>
                <option value="in_progress" className="bg-background text-foreground">In Progress</option>
                <option value="done" className="bg-background text-foreground">Done</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" /> Assign To
              </label>
              <select 
                className="h-12 w-full bg-secondary/50 rounded-xl px-4 border-none text-sm font-semibold cursor-pointer"
                value={formData.assignedTo}
                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
              >
                <option value="" className="bg-background text-foreground">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id} className="bg-background text-foreground">{m.email.split('@')[0]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Due Date
              </label>
              <input 
                type="date"
                className="h-12 bg-secondary/50 rounded-xl px-4 border-none text-sm font-semibold cursor-pointer"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={loading}
              className="flex-1 h-12 rounded-xl font-bold text-sm premium-gradient text-white flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
