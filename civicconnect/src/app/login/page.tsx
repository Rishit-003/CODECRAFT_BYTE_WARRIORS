'use client';

// ============================================
// CivicConnect — Login Page
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import { LogIn, Mail, Lock, User, Wrench, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const ROLE_TABS: { role: UserRole; label: string; icon: React.ReactNode; color: string; description: string }[] = [
  { role: 'citizen', label: 'Citizen', icon: <User size={20} />, color: 'var(--color-accent-blue)', description: 'Report & track civic issues' },
  { role: 'worker', label: 'Worker', icon: <Wrench size={20} />, color: 'var(--color-accent-amber)', description: 'Manage assigned tasks' },
  { role: 'admin', label: 'Admin', icon: <ShieldCheck size={20} />, color: 'var(--color-accent-purple)', description: 'Oversee & manage operations' },
];

// Demo credentials
const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string }> = {
  citizen: { email: 'arjun@example.com', password: 'demo123' },
  worker: { email: 'vikram@civic.gov', password: 'demo123' },
  admin: { email: 'kavita@civic.gov', password: 'demo123' },
};

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, selectedRole);
      toast.success('Welcome back!');
      const routes = { citizen: '/citizen', worker: '/worker', admin: '/admin' };
      router.push(routes[selectedRole]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    const demo = DEMO_ACCOUNTS[role];
    setEmail(demo.email);
    setPassword(demo.password);
    setSelectedRole(role);
    try {
      await login(demo.email, demo.password, role);
      toast.success(`Logged in as demo ${role}`);
      const routes = { citizen: '/citizen', worker: '/worker', admin: '/admin' };
      router.push(routes[role]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-10 animate-float" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5), transparent)' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-10 animate-float" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent)', animationDelay: '3s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="glass-card-static p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-2xl">🏙️</span>
              <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>CivicConnect</span>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Welcome Back</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Sign in to your account</p>
          </div>

          {/* Role Tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--color-bg-primary)' }}>
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.role}
                onClick={() => setSelectedRole(tab.role)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: selectedRole === tab.role ? 'var(--color-bg-tertiary)' : 'transparent',
                  color: selectedRole === tab.role ? tab.color : 'var(--color-text-muted)',
                  border: selectedRole === tab.role ? `1px solid ${tab.color}30` : '1px solid transparent',
                }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Role description */}
          <div className="text-center mb-6">
            <p className="text-xs text-[var(--color-text-muted)]">
              {ROLE_TABS.find((t) => t.role === selectedRole)?.description}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <button type="button" className="text-sm text-[var(--color-accent-blue)] hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={18} /> Sign In
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border-glass)' }} />
            <span className="text-xs text-[var(--color-text-muted)]">Quick Demo</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border-glass)' }} />
          </div>

          {/* Demo Login Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.role}
                onClick={() => handleDemoLogin(tab.role)}
                className="btn-secondary text-xs py-2 px-3 flex flex-col items-center gap-1"
                style={{ fontSize: '11px' }}
              >
                {tab.icon}
                Demo {tab.label}
              </button>
            ))}
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[var(--color-accent-blue)] hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
