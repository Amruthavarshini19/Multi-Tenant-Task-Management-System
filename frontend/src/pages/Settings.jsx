import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useNavigate, Link } from 'react-router-dom';
import { Settings as SettingsIcon, User, Shield, Moon, Building, Users, AlertTriangle, CheckCircle2, Lock, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [passwordConfig, setPasswordConfig] = useState({ loading: false, success: false, error: '' });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordConfig({ loading: true, success: false, error: '' });
    try {
      await axios.put('http://localhost:4000/api/users/password', passwordData);
      setPasswordConfig({ loading: false, success: true, error: '' });
      setPasswordData({ currentPassword: '', newPassword: '' });
      setTimeout(() => setPasswordConfig(prev => ({ ...prev, success: false })), 3000);
    } catch (err) {
      setPasswordConfig({ loading: false, success: false, error: err.response?.data?.error || 'Failed to update password' });
    }
  };

  const SectionHeader = ({ icon: Icon, title, description }) => (
    <div className="mb-6">
      <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3">
        <div className="bg-primary/10 p-2 rounded-xl text-primary"><Icon className="w-5 h-5" /></div>
        {title}
      </h3>
      {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
    </div>
  );

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">
        <header className="h-16 border-b border-border shadow-sm shadow-foreground/5 px-8 flex items-center justify-between sticky top-0 bg-surface/95 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">Configuration Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto space-y-10">
          
          {/* Profile Settings */}
          <section className="bg-card border border-border shadow-sm rounded-3xl p-8">
            <SectionHeader icon={User} title="Profile Settings" description="Manage your basic account details." />
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-bold text-muted-foreground">Email Address</label>
                <div className="w-full h-12 bg-secondary/50 rounded-xl px-4 flex items-center text-sm font-semibold mt-1">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-muted-foreground">Assigned Role</label>
                <div className="w-full h-12 bg-secondary/50 rounded-xl px-4 flex items-center text-sm font-bold uppercase tracking-wider text-primary mt-1">
                  {user?.role}
                </div>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="bg-card border border-border shadow-sm rounded-3xl p-8">
            <SectionHeader icon={Moon} title="Appearance Settings" description="Customize how the dashboard looks on your device." />
            <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-2xl">
              <div>
                <p className="font-bold text-sm">Color Mode Focus</p>
                <p className="text-xs text-muted-foreground">Toggle between Light and Dark application themes.</p>
              </div>
              <ThemeToggle />
            </div>
          </section>

          {/* Security & Password */}
          <section className="bg-card border border-border shadow-sm rounded-3xl p-8">
            <SectionHeader icon={Shield} title="Security Parameters" description="Update your password ensuring the account stays robustly protected." />
            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-bold text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3"/> Current Password</label>
                <input 
                  type="password" required 
                  className="w-full h-12 bg-secondary/50 rounded-xl px-4 border-none text-sm font-medium mt-1"
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3"/> New Password</label>
                <input 
                  type="password" required minLength={8}
                  className="w-full h-12 bg-secondary/50 rounded-xl px-4 border-none text-sm font-medium mt-1"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
              {passwordConfig.error && <p className="text-xs text-destructive font-bold">{passwordConfig.error}</p>}
              {passwordConfig.success && <p className="text-xs text-green-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Validated and saved securely</p>}
              <button 
                disabled={passwordConfig.loading}
                className="w-full h-12 rounded-xl text-white font-bold bg-primary hover:opacity-90 active:scale-95 transition-all mt-2"
              >
                {passwordConfig.loading ? 'Encrypting...' : 'Update Password'}
              </button>
            </form>
          </section>

          {/* Admin Context */}
          {user?.role === 'admin' && (
            <>
              <section className="bg-card border border-border shadow-sm rounded-3xl p-8">
                <SectionHeader icon={Building} title="Organization Metadata" description="Top-level tenant isolation parameters." />
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-bold text-muted-foreground">Workspace Alias</label>
                    <div className="w-full h-12 bg-secondary/50 rounded-xl px-4 flex items-center text-sm font-bold tracking-tight mt-1">
                      {user?.orgName || 'Enterprise Workspace'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-muted-foreground">Immutable Tenant ID</label>
                    <div className="w-full h-12 bg-secondary/50 rounded-xl px-4 flex items-center text-xs font-mono text-muted-foreground mt-1 cursor-not-allowed">
                      {user?.orgId}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-card border border-border shadow-sm rounded-3xl p-8">
                <SectionHeader icon={Users} title="Team Management Gateway" description="Navigate to the isolated directory to invite or modify roles." />
                <Link to="/members" className="inline-flex h-12 items-center justify-center px-6 rounded-xl bg-secondary hover:bg-secondary/80 font-bold text-sm transition-colors border border-border border-b-2 active:translate-y-[1px] active:border-b">
                  Open Members Directory
                </Link>
              </section>

              {/* Danger Zone */}
              <section className="border-2 border-destructive/20 bg-destructive/5 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <SectionHeader icon={AlertTriangle} title="Danger Zone" description="Irreversible organizational modifications." />
                <p className="text-sm font-medium text-destructive mb-4">Deleting this organization will securely strip all underlying tasks, members, and audit routes.</p>
                <button className="h-12 px-6 rounded-xl font-bold text-sm text-destructive border-2 border-destructive hover:bg-destructive hover:text-white transition-all">
                  Delete Workspace Repository
                </button>
              </section>
            </>
          )}

          {/* Global Footer Actions */}
          <div className="flex justify-center pt-8 pb-12">
            <button 
              onClick={() => { logout(); navigate('/auth'); }}
              className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-xl hover:bg-secondary"
            >
              <LogOut className="w-4 h-4" /> End Active Session
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Settings;
