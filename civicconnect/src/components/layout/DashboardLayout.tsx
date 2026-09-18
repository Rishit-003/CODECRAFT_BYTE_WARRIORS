'use client';

// ============================================
// CivicConnect — Dashboard Layout (Shared)
// ============================================

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, FileText, MapPin, PlusCircle,
  ClipboardList, Users, BarChart3,
  LogOut, Bell, Menu, X, ChevronRight,
} from 'lucide-react';
import { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  citizen: [
    { label: 'Dashboard', href: '/citizen', icon: <LayoutDashboard size={20} /> },
    { label: 'Report Issue', href: '/citizen/report', icon: <PlusCircle size={20} /> },
    { label: 'My Reports', href: '/citizen/track', icon: <FileText size={20} /> },
    { label: 'Community Map', href: '/citizen/map', icon: <MapPin size={20} /> },
  ],
  worker: [
    { label: 'My Tasks', href: '/worker', icon: <ClipboardList size={20} /> },
    { label: 'Task Map', href: '/worker/map', icon: <MapPin size={20} /> },
  ],
  admin: [
    { label: 'Overview', href: '/admin', icon: <BarChart3 size={20} /> },
    { label: 'Issues', href: '/admin/issues', icon: <FileText size={20} /> },
    { label: 'Workers', href: '/admin/workers', icon: <Users size={20} /> },
    { label: 'Map View', href: '/admin/map', icon: <MapPin size={20} /> },
  ],
};

const ROLE_COLORS: Record<UserRole, string> = {
  citizen: 'var(--color-accent-blue)',
  worker: 'var(--color-accent-amber)',
  admin: 'var(--color-accent-purple)',
};

const ROLE_LABELS: Record<UserRole, string> = {
  citizen: 'Citizen',
  worker: 'Worker',
  admin: 'Administrator',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<number>(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch notification count
  useEffect(() => {
    if (user) {
      fetch(`/api/notifications?userId=${user.id}`)
        .then((r) => r.json())
        .then((data) => {
          const unread = data.notifications?.filter((n: { read: boolean }) => !n.read).length || 0;
          setNotifications(unread);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = NAV_ITEMS[user.role];
  const roleColor = ROLE_COLORS[user.role];

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: '#e4f0eb', color: '#173b36' }}>
              CC
            </div>
            <div>
              <span className="font-bold text-base text-white" style={{ fontFamily: 'var(--font-display)' }}>CivicConnect</span>
              <div className="text-[10px] mt-0.5 uppercase tracking-[0.12em] text-[#b8ccc4]">
                {ROLE_LABELS[user.role]}
              </div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[var(--color-text-muted)]">
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
              {pathname === item.href && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4" style={{ borderTop: '1px solid var(--color-border-glass)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${roleColor}20`, color: roleColor }}>
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{user.name}</p>
              <p className="text-xs text-[#b8ccc4] truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-[#f0bab4] hover:bg-white/10">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-[260px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(247,248,244,0.94)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--color-border-glass)' }}>
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-[var(--color-text-secondary)]">
            <Menu size={24} />
          </button>

          <div className="hidden md:block">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {navItems.find((n) => n.href === pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl transition-all hover:bg-white/5">
              <Bell size={20} className="text-[var(--color-text-secondary)]" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--color-accent-red)', color: 'white' }}>
                  {notifications}
                </span>
              )}
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold md:hidden" style={{ background: `${roleColor}20`, color: roleColor }}>
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-5 md:p-8 max-w-[1440px]">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
