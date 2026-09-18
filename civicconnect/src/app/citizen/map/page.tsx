'use client';

// ============================================
// CivicConnect — Community Map View
// ============================================

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Issue } from '@/types';
import { CATEGORY_CONFIG, STATUS_CONFIG, URGENCY_CONFIG, DEPARTMENTS } from '@/constants';
import { ThumbsUp, MapPin, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommunityMapPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/issues')
      .then((r) => r.json())
      .then((data) => { setIssues(data.issues || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleUpvote = async (issueId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIssues((prev) => prev.map((i) => i.id === issueId ? data.issue : i));
        if (selectedIssue?.id === issueId) setSelectedIssue(data.issue);
        toast.success(data.upvoted ? 'Upvoted!' : 'Upvote removed');
      }
    } catch { toast.error('Failed to upvote'); }
  };

  const filtered = filter === 'all' ? issues : issues.filter((i) => i.department === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Community <span className="gradient-text">Map</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">All reported issues in your area</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-[var(--color-text-muted)]" />
        <button onClick={() => setFilter('all')} className="badge cursor-pointer transition-all" style={{
          background: filter === 'all' ? 'rgba(59,130,246,0.15)' : 'var(--color-bg-tertiary)',
          color: filter === 'all' ? 'var(--color-accent-blue)' : 'var(--color-text-muted)',
          border: `1px solid ${filter === 'all' ? 'rgba(59,130,246,0.3)' : 'var(--color-border-glass)'}`,
        }}>All ({issues.length})</button>
        {Object.entries(DEPARTMENTS).map(([key, dept]) => {
          const count = issues.filter((i) => i.department === key).length;
          return (
            <button key={key} onClick={() => setFilter(key)} className="badge cursor-pointer transition-all" style={{
              background: filter === key ? `${dept.color}20` : 'var(--color-bg-tertiary)',
              color: filter === key ? dept.color : 'var(--color-text-muted)',
              border: `1px solid ${filter === key ? `${dept.color}40` : 'var(--color-border-glass)'}`,
            }}>
              {dept.icon} {dept.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Map View (CSS-based visual map) */}
      <div className="glass-card-static rounded-2xl overflow-hidden" style={{ height: '500px' }}>
        <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c1230 0%, #0f1a3e 50%, #0a1025 100%)' }}>
          {/* Grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {/* Map markers */}
          {!loading && filtered.map((issue, idx) => {
            const cat = CATEGORY_CONFIG[issue.category];
            const urgency = URGENCY_CONFIG[issue.urgency];
            // Distribute markers visually across the map area
            const left = 10 + ((issue.location.coordinates[0] - 77.58) / 0.03) * 80;
            const top = 10 + ((12.985 - issue.location.coordinates[1]) / 0.02) * 80;

            return (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 z-10 group"
                style={{
                  left: `${Math.min(Math.max(left, 5), 95)}%`,
                  top: `${Math.min(Math.max(top, 5), 95)}%`,
                  animationDelay: `${idx * 0.05}s`,
                }}
                title={issue.title}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg" style={{
                    background: urgency.bgColor,
                    border: `2px solid ${urgency.color}`,
                    boxShadow: `0 0 15px ${urgency.color}40`,
                  }}>
                    {cat?.icon || '📋'}
                  </div>
                  {issue.upvoteCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: 'var(--color-accent-blue)', color: 'white' }}>
                      {issue.upvoteCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 p-3 rounded-xl text-xs" style={{ background: 'rgba(10,14,39,0.9)', border: '1px solid var(--color-border-glass)' }}>
            <p className="font-semibold mb-2 text-[var(--color-text-secondary)]">Urgency</p>
            <div className="space-y-1">
              {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: config.color }} />
                  <span className="text-[var(--color-text-muted)]">{config.label}</span>
                </div>
              ))}
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Issue Detail Panel */}
      {selectedIssue && (
        <div className="glass-card-static p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{CATEGORY_CONFIG[selectedIssue.category]?.icon}</span>
              <div>
                <h3 className="font-semibold text-lg">{selectedIssue.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{selectedIssue.description}</p>
              </div>
            </div>
            <button onClick={() => setSelectedIssue(null)} className="p-1 hover:bg-white/5 rounded-lg">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Status</p>
              <span className="badge mt-1" style={{ background: STATUS_CONFIG[selectedIssue.status].bgColor, color: STATUS_CONFIG[selectedIssue.status].color }}>
                {STATUS_CONFIG[selectedIssue.status].label}
              </span>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Urgency</p>
              <span className="badge mt-1" style={{ background: URGENCY_CONFIG[selectedIssue.urgency].bgColor, color: URGENCY_CONFIG[selectedIssue.urgency].color }}>
                {URGENCY_CONFIG[selectedIssue.urgency].icon} {URGENCY_CONFIG[selectedIssue.urgency].label}
              </span>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Location</p>
              <p className="text-sm mt-1 flex items-center gap-1"><MapPin size={12} /> {selectedIssue.location.address}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Reported by</p>
              <p className="text-sm mt-1">{selectedIssue.reporterName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border-glass)' }}>
            <button
              onClick={() => handleUpvote(selectedIssue.id)}
              className="btn-secondary text-sm"
              style={{
                background: user && selectedIssue.upvotes.includes(user.id) ? 'rgba(59,130,246,0.15)' : undefined,
                borderColor: user && selectedIssue.upvotes.includes(user.id) ? 'rgba(59,130,246,0.3)' : undefined,
              }}
            >
              <ThumbsUp size={16} /> {selectedIssue.upvoteCount} Upvote{selectedIssue.upvoteCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Issues List */}
      <div className="glass-card-static p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          All Issues ({filtered.length})
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map((issue) => (
            <button
              key={issue.id}
              onClick={() => setSelectedIssue(issue)}
              className="w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all hover:bg-white/[0.03]"
              style={{ background: selectedIssue?.id === issue.id ? 'rgba(59,130,246,0.08)' : 'var(--color-bg-tertiary)', border: `1px solid ${selectedIssue?.id === issue.id ? 'rgba(59,130,246,0.2)' : 'var(--color-border-subtle)'}` }}
            >
              <span className="text-xl">{CATEGORY_CONFIG[issue.category]?.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{issue.title}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{issue.location.address}</p>
              </div>
              <span className="badge text-[10px]" style={{ background: STATUS_CONFIG[issue.status].bgColor, color: STATUS_CONFIG[issue.status].color }}>
                {STATUS_CONFIG[issue.status].label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
