'use client';

// Admin Map View - Overview of all issues across zones
import { useEffect, useState } from 'react';
import { Issue } from '@/types';
import { CATEGORY_CONFIG, URGENCY_CONFIG, STATUS_CONFIG, DEPARTMENTS } from '@/constants';
import { Filter, MapPin } from 'lucide-react';
import DynamicMap from '@/components/map/DynamicMap';

import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function AdminMapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedIssues = snapshot.docs.map(doc => doc.data() as Issue);
      setIssues(fetchedIssues);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching real-time issues:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = filter === 'all' ? issues : issues.filter((i) => i.department === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          City-Wide <span className="gradient-text">Map View</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">All reported issues across the city</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-[var(--color-text-muted)]" />
        <button onClick={() => setFilter('all')} className="badge cursor-pointer" style={{
          background: filter === 'all' ? 'rgba(59,130,246,0.15)' : 'var(--color-bg-tertiary)',
          color: filter === 'all' ? 'var(--color-accent-blue)' : 'var(--color-text-muted)',
        }}>All</button>
        {Object.entries(DEPARTMENTS).map(([key, dept]) => (
          <button key={key} onClick={() => setFilter(key)} className="badge cursor-pointer" style={{
            background: filter === key ? `${dept.color}20` : 'var(--color-bg-tertiary)',
            color: filter === key ? dept.color : 'var(--color-text-muted)',
          }}>
            {dept.icon} {dept.label}
          </button>
        ))}
      </div>

      <div className="glass-card-static rounded-2xl overflow-hidden relative" style={{ height: '600px' }}>
        {!loading ? (
          <DynamicMap issues={filtered} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-tertiary)]">
            <div className="w-10 h-10 border-3 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Selected issue detail */}
      {selectedIssue && (
        <div className="glass-card-static p-5 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{CATEGORY_CONFIG[selectedIssue.category]?.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold">{selectedIssue.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{selectedIssue.description}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge text-[10px]" style={{ background: STATUS_CONFIG[selectedIssue.status].bgColor, color: STATUS_CONFIG[selectedIssue.status].color }}>{STATUS_CONFIG[selectedIssue.status].label}</span>
                  <span className="badge text-[10px]" style={{ background: URGENCY_CONFIG[selectedIssue.urgency].bgColor, color: URGENCY_CONFIG[selectedIssue.urgency].color }}>{URGENCY_CONFIG[selectedIssue.urgency].icon} {URGENCY_CONFIG[selectedIssue.urgency].label}</span>
                  <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1"><MapPin size={10} />{selectedIssue.location.address}</span>
                </div>
                <a 
                  href={`/admin/issues/${selectedIssue.id}`} 
                  className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap"
                >
                  View Full Details
                </a>
              </div>
            </div>
            <button onClick={() => setSelectedIssue(null)} className="text-xs text-[var(--color-text-muted)] hover:text-white p-1">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
