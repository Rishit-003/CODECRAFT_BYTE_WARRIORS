'use client';

// ============================================
// CivicConnect — Citizen Notifications
// ============================================

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Notification } from '@/types';
import { Bell, CheckCircle2, Clock, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CitizenNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  const fetchNotifications = () => {
    setLoading(true);
    fetch(`/api/notifications?userId=${user?.id}`)
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH', body: JSON.stringify({ read: true }) });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      // Ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => fetch(`/api/notifications/${n.id}`, { method: 'PATCH', body: JSON.stringify({ read: true }) })));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'status_update': return <CheckCircle2 className="text-blue-400" size={20} />;
      case 'new_assignment': return <MapPin className="text-amber-400" size={20} />;
      case 'upvote': return <Star className="text-yellow-400" size={20} />;
      default: return <Bell className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Notifications</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Stay updated on your reported issues</p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button onClick={markAllAsRead} className="text-sm text-[var(--color-accent-blue)] hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--color-bg-tertiary)' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 glass-card-static">
          <Bell size={48} className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">When there are updates to your issues, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Link 
              href={notif.type === 'status_update' ? '/citizen/track' : '#'}
              key={notif.id} 
              onClick={() => !notif.read && markAsRead(notif.id)}
              className={`block glass-card-static rounded-2xl p-4 transition-colors hover:bg-white/[0.03] ${!notif.read ? 'border-l-4' : ''}`}
              style={{ borderLeftColor: !notif.read ? 'var(--color-accent-blue)' : 'transparent' }}
            >
              <div className="flex gap-4">
                <div className="mt-1 p-2 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`font-medium ${!notif.read ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">{notif.message}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
