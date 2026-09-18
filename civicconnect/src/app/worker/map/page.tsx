'use client';

// Worker Map Page - Reuses community map concept for worker's assigned area
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Issue, WorkerUser } from '@/types';
import { CATEGORY_CONFIG, URGENCY_CONFIG, STATUS_CONFIG } from '@/constants';
import { MapPin, Navigation } from 'lucide-react';
import Link from 'next/link';

export default function WorkerMapPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const worker = user as WorkerUser | null;

  useEffect(() => {
    if (!user) return;
    fetch(`/api/issues?assignedTo=${user.id}`)
      .then((r) => r.json())
      .then((data) => { setTasks(data.issues || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Task <span className="gradient-text">Map</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {worker?.assignedZone && `Assigned Zone: ${worker.assignedZone}`}
        </p>
      </div>

      <div className="glass-card-static rounded-2xl overflow-hidden" style={{ height: '500px' }}>
        <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c1230 0%, #0f1a3e 50%, #0a1025 100%)' }}>
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {!loading && tasks.filter(t => t.status !== 'resolved').map((task, idx) => {
            const cat = CATEGORY_CONFIG[task.category];
            const urgency = URGENCY_CONFIG[task.urgency];
            const left = 10 + ((task.location.coordinates[0] - 77.58) / 0.03) * 80;
            const top = 10 + ((12.985 - task.location.coordinates[1]) / 0.02) * 80;

            return (
              <div
                key={task.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${Math.min(Math.max(left, 5), 95)}%`, top: `${Math.min(Math.max(top, 5), 95)}%` }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-lg animate-pulse-glow" style={{
                  background: urgency.bgColor,
                  border: `2px solid ${urgency.color}`,
                  boxShadow: `0 0 20px ${urgency.color}40`,
                }}>
                  {cat?.icon || '📋'}
                </div>
                <div className="absolute top-14 left-1/2 -translate-x-1/2 p-2 rounded-lg whitespace-nowrap text-xs" style={{ background: 'rgba(10,14,39,0.95)', border: '1px solid var(--color-border-glass)' }}>
                  {task.title.substring(0, 25)}...
                </div>
              </div>
            );
          })}

          {/* Center navigation marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-6 h-6 rounded-full border-3 animate-ping" style={{ background: 'rgba(59,130,246,0.3)', borderColor: 'var(--color-accent-blue)' }} />
            <Navigation size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-accent-blue)]" />
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tasks.filter(t => !['resolved', 'closed', 'admin_review'].includes(t.status)).map((task) => (
          <Link href={`/worker/issues/${task.id}`} key={task.id} className="glass-card-static p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors" style={{ borderLeft: `3px solid ${URGENCY_CONFIG[task.urgency]?.color || 'gray'}` }}>
            <span className="text-xl">{CATEGORY_CONFIG[task.category]?.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{task.title}</p>
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 truncate"><MapPin size={10} className="shrink-0"/> {task.location.address}</p>
            </div>
            <span className="badge text-[10px] shrink-0" style={{ background: STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]?.bgColor, color: STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]?.color }}>
              {STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]?.label || task.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
