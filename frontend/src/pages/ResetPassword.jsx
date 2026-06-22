import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Invalid link guard
  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Invalid reset link</h2>
          <p className="text-muted-foreground text-sm">This link is missing required parameters. Please request a new one.</p>
          <button onClick={() => navigate('/auth')} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 premium-gradient text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold tracking-tight">TaskFlow</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Secure your<br />account.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Create a strong new password to keep your workspace safe.
          </p>
        </div>
        <div className="relative z-10 bg-white/10 p-6 rounded-2xl backdrop-blur-lg border border-white/20">
          <p className="text-white/80 text-sm">🔒 Your password is hashed with <strong>bcrypt</strong> — it's never stored in plain text.</p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-24 relative">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[400px] space-y-8">
          {success ? (
            /* ── Success Screen ───────────────────────────────────────── */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Password updated!</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
              </div>
              <button
                onClick={() => navigate('/auth')}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                Go to Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* ── Reset Form ──────────────────────────────────────────── */
            <>
              <div className="text-center lg:text-left">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Set new password</h2>
                <p className="text-muted-foreground mt-2">
                  Resetting password for <span className="font-semibold text-foreground">{email}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="pl-10 pr-10 h-12 rounded-xl bg-secondary/30"
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="pl-10 h-12 rounded-xl bg-secondary/30"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {/* Password strength bar */}
                  {newPassword && (
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          newPassword.length >= i * 3
                            ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-yellow-500' : i <= 3 ? 'bg-blue-500' : 'bg-green-500'
                            : 'bg-secondary'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Reset Password <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Remember it?{' '}
                <button onClick={() => navigate('/auth')} className="text-primary font-semibold hover:underline">
                  Back to Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
