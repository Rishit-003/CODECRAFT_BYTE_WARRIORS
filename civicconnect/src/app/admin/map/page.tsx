'use client';

// Admin Map View - Overview of all issues across zones
import { useEffect, useState } from 'react';
import { Issue } from '@/types';
import { CATEGORY_CONFIG, URGENCY_CONFIG, STATUS_CONFIG, DEPARTMENTS } from '@/constants';
import { Filter, MapPin } from 'lucide-react';

export default function AdminMapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    fetch('/api/issues')
      .then((r) => r.json())
      .then((data) => { setIssues(data.issues || []); setLoading(false); })
      .catch(() => setLoading(false));
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

      <div className="glass-card-static rounded-2xl overflow-hidden" style={{ height: '600px' }}>
        <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c1230 0%, #0f1a3e 50%, #0a1025 100%)' }}>
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {!loading && filtered.map((issue) => {
            const cat = CATEGORY_CONFIG[issue.category];
            const urgency = URGENCY_CONFIG[issue.urgency];
            const status = STATUS_CONFIG[issue.status];
            const left = 10 + ((issue.location.coordinates[0] - 77.58) / 0.03) * 80;
            const top = 10 + ((12.985 - issue.location.coordinates[1]) / 0.02) * 80;

            return (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 z-10"
                style={{ left: `${Math.min(Math.max(left, 5), 95)}%`, top: `${Math.min(Math.max(top, 5), 95)}%` }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg" style={{
                  background: issue.status === 'resolved' ? 'rgba(16,185,129,0.2)' : urgency.bgColor,
                  border: `2px solid ${issue.status === 'resolved' ? 'var(--color-accent-green)' : urgency.color}`,
                  opacity: issue.status === 'resolved' ? 0.6 : 1,
                }}>
                  {cat?.icon || '📋'}
                </div>
              </button>
            );
          })}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 p-3 rounded-xl text-xs space-y-2" style={{ background: 'rgba(10,14,39,0.9)', border: '1px solid var(--color-border-glass)' }}>
            <p className="font-semibold text-[var(--color-text-secondary)]">Legend</p>
            {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: config.color }} />
                <span className="text-[var(--color-text-muted)]">{config.label} Urgency</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full opacity-60" style={{ background: 'var(--color-accent-green)' }} />
              <span className="text-[var(--color-text-muted)]">Resolved</span>
            </div>
          </div>
        </div>
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
