import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, CheckSquare, History, User, LogOut, Settings, ChevronRight } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    ...(isAdmin ? [{ icon: CheckSquare, label: 'All Tasks', path: '/my-tasks' }] : [{ icon: CheckSquare, label: 'My Tasks', path: '/my-tasks' }]),
    ...(isAdmin ? [{ icon: User, label: 'Members', path: '/members' }] : []),
    ...(isAdmin ? [{ icon: History, label: 'Audit Logs', path: '/audit' }] : []),
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen sidebar-nav flex flex-col p-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
          <CheckSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight uppercase tracking-wider italic">TaskFlow</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest bg-secondary/50 px-1 rounded">SaaS Enterprise</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4 pt-4 border-t border-border">
        <div className="px-3 py-3 rounded-2xl bg-foreground/[0.03] border border-border/50 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full premium-gradient flex items-center justify-center text-white text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role} Mode</p>
            </div>
          </div>
          <div className="text-[10px] text-primary font-bold uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded inline-block">
             {user?.orgName || 'Workspace'}
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
