'use client';

// Worker Map Page - Reuses community map concept for worker's assigned area
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Issue, WorkerUser } from '@/types';
import { CATEGORY_CONFIG, URGENCY_CONFIG, STATUS_CONFIG } from '@/constants';
import { MapPin, Navigation } from 'lucide-react';
import Link from 'next/link';

import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import DynamicMap from '@/components/map/DynamicMap';

export default function WorkerMapPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const worker = user as WorkerUser | null;

  useEffect(() => {
    if (!user) return;
    
    // Instead of filtering assignedTo, let's just get all issues for MVP or keep the query
    // Workers see issues assigned to their department, but here we'll just show all so it's visible for the demo
    const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => doc.data() as Issue);
      // For demo purposes, we'll show all tasks that are not resolved so the worker can see the newly reported issue
      setTasks(fetchedTasks.filter(t => t.status !== 'resolved'));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching real-time tasks:', error);
      setLoading(false);
    });

    return () => unsubscribe();
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
        {!loading && (
          <DynamicMap issues={tasks} />
        )}
        {loading && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
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
