'use client';

// ============================================
// CivicConnect — Worker Notifications
// ============================================

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Bell, CheckCircle2, AlertTriangle, MessageSquare, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  createdAt: string;
  read: boolean;
}

export default function WorkerNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/notifications?userId=${user.id}`)
        .then(r => r.json())
        .then(data => {
          setNotifications(data.notifications || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'status_update': return <CheckCircle2 size={16} className="text-blue-400" />;
      case 'new_assignment': return <AlertTriangle size={16} className="text-amber-400" />;
      case 'system': return <ShieldAlert size={16} className="text-purple-400" />;
      default: return <MessageSquare size={16} className="text-slate-400" />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--color-text-muted)]">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          System <span className="gradient-text">Notifications</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Recent activity, alerts, and system updates.
        </p>
      </div>

      <div className="glass-card-static overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-text-muted)]">
            <Bell size={32} className="mx-auto mb-3 opacity-20" />
            <p>You have no notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-glass)]">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 transition-colors hover:bg-white/5 flex gap-4 ${notif.read ? 'opacity-70' : 'bg-white/[0.02]'}`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <div className="mt-1 flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm ${notif.read ? 'font-medium text-[var(--color-text-secondary)]' : 'font-bold text-white'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">{notif.message}</p>
                  <p className="text-xs text-[var(--color-text-muted)] opacity-50 mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {notif.link && (
                  <div className="flex-shrink-0">
                    <Link href={notif.link} className="btn-ghost text-xs py-1.5 px-3">
                      View
                    </Link>
                  </div>
                )}
                {!notif.read && (
                  <div className="flex-shrink-0 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent-blue)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
