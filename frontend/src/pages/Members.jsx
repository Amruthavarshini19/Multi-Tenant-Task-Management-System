import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { UserPlus, Mail, Shield, User, Copy, CheckCircle2 } from 'lucide-react';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMembers = async () => {
    try {
      const { data } = await axios.get('/api/users');
      setMembers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">
        <header className="h-16 border-b border-border px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">Members Directory</h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-primary-foreground h-10 px-4 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto space-y-6">
          <div className="glass-card rounded-3xl overflow-hidden border-border/50">
            {loading ? (
              <div className="p-12 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 w-full animate-pulse bg-secondary/30 rounded-xl" />)}
              </div>
            ) : members.length === 0 ? (
              <div className="p-20 text-center">
                <h3 className="text-xl font-bold">No members found</h3>
                <p className="text-muted-foreground mt-2">Invite your team to collaborate.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {members.map((member) => (
                  <div key={member.id} className="p-5 hover:bg-secondary/20 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full premium-gradient flex items-center justify-center shrink-0 border-2 border-background shadow-md">
                        <span className="text-white font-bold text-lg">{member.email.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{member.email.split('@')[0]}</span>
                          {member.id === user.id && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">You</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> {member.email}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        member.role === 'admin' 
                          ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
                          : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {member.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <InviteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onInviteSuccess={fetchMembers} 
      />
    </div>
  );
};

const InviteModal = ({ isOpen, onClose, onInviteSuccess }) => {
  const [formData, setFormData] = useState({ email: '', role: 'member', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    for(let i=0; i<12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData({ ...formData, password: pwd });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!formData.password) {
        setError('Please auto-generate or type a temporary password.');
        setLoading(false);
        return;
      }
      await axios.post('/api/users/invite', formData);
      setSuccessData({ email: formData.email, password: formData.password });
      onInviteSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Email: ${successData.email}\nPassword: ${successData.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    setSuccessData(null);
    setFormData({ email: '', role: 'member', password: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-primary/20 animate-in zoom-in-95 duration-300">
        <div className={`${successData ? 'bg-green-500' : 'premium-gradient'} p-6 text-white flex justify-between items-center transition-colors`}>
          <div className="flex items-center gap-3">
            {successData ? <CheckCircle2 className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            <h3 className="text-xl font-bold">{successData ? 'Invite Successful' : 'Invite Team Member'}</h3>
          </div>
        </div>

        {successData ? (
          <div className="p-8 space-y-6 bg-card/50 text-center">
            <p className="text-sm text-muted-foreground">User has been successfully added to your organization. Securely share these details with them so they can log in.</p>
            
            <div className="bg-secondary/50 rounded-2xl p-4 text-left relative">
              <p className="text-xs text-muted-foreground mb-1 font-bold uppercase">Email</p>
              <p className="font-semibold mb-3">{successData.email}</p>
              <p className="text-xs text-muted-foreground mb-1 font-bold uppercase">Temporary Password</p>
              <p className="font-mono text-lg">{successData.password}</p>
              
              <button 
                onClick={handleCopy}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background rounded-lg border border-border hover:bg-secondary transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
              </button>
            </div>

            <button 
              onClick={handleFinish}
              className="w-full h-12 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-card/50">
            <div className="space-y-2">
              <label className="text-sm font-bold">Email Address</label>
              <input 
                type="email" required
                className="w-full h-12 bg-secondary/50 rounded-xl px-4 border-none text-sm"
                placeholder="colleague@company.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">Role</label>
              <select 
                className="w-full h-12 bg-secondary/50 rounded-xl px-4 border-none text-sm cursor-pointer"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="member">Member - Can only view/update assigned tasks</option>
                <option value="admin">Admin - Full access to organization</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold">Temporary Password</label>
                <button type="button" onClick={generatePassword} className="text-xs text-primary font-bold hover:underline">
                  Auto-generate
                </button>
              </div>
              <input 
                type="text" required
                className="w-full h-12 bg-secondary/50 rounded-xl px-4 border-none text-sm font-mono"
                placeholder="Type or generate one..."
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {error && <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg">{error}</div>}

            <div className="flex gap-3 pt-3">
              <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/80">Cancel</button>
              <button disabled={loading} className="flex-1 h-12 rounded-xl font-bold text-sm premium-gradient text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Members;
