import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { 
  History, 
  User, 
  Activity, 
  Calendar, 
  ArrowRight,
  Filter,
  Download,
  Search
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await axios.get('http://localhost:4000/api/audit');
        setLogs(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionStyles = (action) => {
    if (action.includes('created')) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (action.includes('deleted')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-border px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Audit Trail</h2>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="h-10 px-4 rounded-xl border border-border bg-card text-sm font-bold flex items-center gap-2 hover:bg-secondary transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4 rounded-2xl border-dashed">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Filter logs by user or action..." 
                className="pl-10 h-10 w-full rounded-xl bg-secondary/30 text-sm border-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="h-10 px-4 rounded-xl bg-secondary/50 text-sm font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                All Events
              </button>
              <button className="h-10 px-4 rounded-xl bg-secondary/50 text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last 30 Days
              </button>
            </div>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border-border/50">
            {loading ? (
              <div className="p-12 space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-16 w-full animate-pulse bg-secondary/30 rounded-xl" />)}
              </div>
            ) : logs.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-10 h-10 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-xl font-bold">No activity recorded</h3>
                <p className="text-muted-foreground mt-2">Actions in your organization will appear here automatically.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {logs.map((log) => (
                  <div key={log.id} className="p-5 hover:bg-secondary/20 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm">System Actor</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${getActionStyles(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <span className="font-medium text-foreground capitalize">{log.entity_type}</span> 
                          ID: {log.entity_id.split('-')[0]}...
                          {log.diff && <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded italic">Has Details</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      <button className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                        View Details <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditLogs;
