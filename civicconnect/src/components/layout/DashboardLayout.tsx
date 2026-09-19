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
  LogOut, Bell, Menu, X, ChevronRight, User,
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
    { label: 'Notifications', href: '/citizen/notifications', icon: <Bell size={20} /> },
  ],
  worker: [
    { label: 'Dashboard', href: '/worker', icon: <LayoutDashboard size={20} /> },
    { label: 'My Complaints', href: '/worker/issues', icon: <ClipboardList size={20} /> },
    { label: 'Map', href: '/worker/map', icon: <MapPin size={20} /> },
    { label: 'Notifications', href: '/worker/notifications', icon: <Bell size={20} /> },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Complaints', href: '/admin/issues', icon: <FileText size={20} /> },
    { label: 'Inspectors', href: '/admin/workers', icon: <Users size={20} /> },
    { label: 'Complaint Map', href: '/admin/map', icon: <MapPin size={20} /> },
    { label: 'Reports', href: '/admin/reports', icon: <BarChart3 size={20} /> },
    { label: 'Notifications', href: '/admin/notifications', icon: <Bell size={20} /> },
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

const getPageTitle = (pathname: string) => {
  if (pathname.includes('/issues/')) return { prefix: 'Complaint', suffix: 'Details', desc: 'Review and update complaint details.' };
  
  const map: Record<string, { prefix: string, suffix: string, desc: string }> = {
    '/citizen': { prefix: 'Citizen', suffix: 'Dashboard', desc: 'Monitor community updates and your recent activities.' },
    '/citizen/report': { prefix: 'Report', suffix: 'Issue', desc: 'Submit a new complaint for your community.' },
    '/citizen/track': { prefix: 'My', suffix: 'Reports', desc: 'Track the status of your reported complaints.' },
    '/citizen/map': { prefix: 'Community', suffix: 'Map', desc: 'View reported issues around your area.' },
    '/citizen/notifications': { prefix: 'Your', suffix: 'Notifications', desc: 'View your alerts and updates.' },
    '/citizen/profile': { prefix: 'Citizen', suffix: 'Profile', desc: 'Manage your account information.' },
    
    '/worker': { prefix: 'Inspector', suffix: 'Dashboard', desc: 'Here is your current workload.' },
    '/worker/issues': { prefix: 'My', suffix: 'Complaints', desc: 'View and manage all complaints assigned to you.' },
    '/worker/map': { prefix: 'Inspector', suffix: 'Map', desc: 'View your assigned complaints on the map.' },
    '/worker/notifications': { prefix: 'Your', suffix: 'Notifications', desc: 'View your alerts and updates.' },
    '/worker/profile': { prefix: 'Inspector', suffix: 'Profile', desc: 'View your profile and account information.' },
    
    '/admin': { prefix: 'Admin', suffix: 'Dashboard', desc: 'Monitor complaints, assign inspectors, and track resolutions.' },
    '/admin/issues': { prefix: 'All', suffix: 'Complaints', desc: 'View and manage all system complaints.' },
    '/admin/workers': { prefix: 'Manage', suffix: 'Inspectors', desc: 'Add and manage field workers.' },
    '/admin/map': { prefix: 'Complaint', suffix: 'Map', desc: 'View all complaints on the interactive map.' },
    '/admin/reports': { prefix: 'System', suffix: 'Reports', desc: 'Analytics and insights.' },
    '/admin/notifications': { prefix: 'Your', suffix: 'Notifications', desc: 'View your alerts and updates.' },
  };

  return map[pathname] || { prefix: '', suffix: 'Dashboard', desc: '' };
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

  useEffect(() => {
    if (!user) return;
    
    import('@/lib/firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
        const q = query(collection(db, 'notifications'), where('userId', '==', user.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          let unreadCount = 0;
          snapshot.forEach((doc) => {
            if (!doc.data().read) unreadCount++;
          });
          setNotifications(unreadCount);
        });

        return () => unsubscribe();
      });
    });
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
          <div className="flex flex-col gap-1.5">
            <img src="/logo-white.png" alt="CivicConnect Logo" className="h-9 w-auto max-w-[180px] object-contain" />
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#b8ccc4] font-semibold pl-0.5">
              {ROLE_LABELS[user.role]}
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[var(--color-text-muted)] hover:text-white p-1">
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
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-[var(--color-text-secondary)]">
              <Menu size={24} />
            </button>
            <div className="md:hidden flex items-center">
              <img src="/logo.png" alt="CivicConnect Logo" className="h-7 w-auto" />
            </div>
            
            <div className="hidden md:flex flex-col ml-1">
              <h1 className="text-xl font-bold font-display leading-tight">
                {getPageTitle(pathname).prefix} <span className="gradient-text">{getPageTitle(pathname).suffix}</span>
              </h1>
              <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
                {getPageTitle(pathname).desc}
              </p>
            </div>
          </div>



          <div className="flex items-center gap-4">
            <Link href={`/${user.role}/notifications`} className="relative p-2 rounded-xl transition-all hover:bg-white/5">
              <Bell size={20} className="text-[var(--color-text-secondary)]" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--color-accent-red)', color: 'white' }}>
                  {notifications}
                </span>
              )}
            </Link>
            <Link 
              href={user.role === 'admin' ? '/admin' : `/${user.role}/profile`}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-transform hover:scale-105 cursor-pointer border border-[var(--color-border-glass)]" 
              style={{ background: `${roleColor}20`, color: roleColor }}
              title={user.role === 'admin' ? "Admin Dashboard" : "Go to Profile"}
            >
              {user.name.charAt(0)}
            </Link>
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
