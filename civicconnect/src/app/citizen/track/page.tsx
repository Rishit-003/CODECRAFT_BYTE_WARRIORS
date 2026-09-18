'use client';

// ============================================
// CivicConnect — Track My Reports
// ============================================

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Issue, IssueStatus } from '@/types';
import { STATUS_CONFIG, URGENCY_CONFIG, CATEGORY_CONFIG, STATUS_PIPELINE } from '@/constants';
import { CheckCircle2, Clock, Filter, ThumbsUp, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export default function TrackReportsPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/issues?reportedBy=${user.id}`)
      .then((r) => r.json())
      .then((data) => { setIssues(data.issues || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const filtered = statusFilter === 'all' ? issues : issues.filter((i) => i.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Track My Reports</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Follow the progress of your submitted issues</p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-[var(--color-text-muted)]" />
        {['all', ...STATUS_PIPELINE].map((status) => {
          const config = status === 'all' ? null : STATUS_CONFIG[status as IssueStatus];
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status as IssueStatus | 'all')}
              className="badge transition-all cursor-pointer"
              style={{
                background: statusFilter === status ? (config?.bgColor || 'rgba(59,130,246,0.15)') : 'var(--color-bg-tertiary)',
                color: statusFilter === status ? (config?.color || 'var(--color-accent-blue)') : 'var(--color-text-muted)',
                border: `1px solid ${statusFilter === status ? (config?.color || 'var(--color-accent-blue)') + '40' : 'var(--color-border-glass)'}`,
              }}
            >
              {status === 'all' ? 'All' : config?.label}
            </button>
          );
        })}
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--color-bg-tertiary)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass-card-static">
          <Clock size={48} className="mx-auto mb-4 text-[var(--color-text-muted)]" />
          <p className="text-lg font-medium">No reports found</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {statusFilter === 'all' ? "You haven't submitted any reports yet." : `No reports with status "${STATUS_CONFIG[statusFilter as IssueStatus]?.label}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((issue) => {
            const statusConfig = STATUS_CONFIG[issue.status];
            const urgencyConfig = URGENCY_CONFIG[issue.urgency];
            const categoryConfig = CATEGORY_CONFIG[issue.category];
            const currentStep = STATUS_CONFIG[issue.status].step;
            const isExpanded = expandedId === issue.id;

            return (
              <div key={issue.id} className="glass-card-static rounded-2xl overflow-hidden">
                {/* Main Card */}
                <div
                  className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{categoryConfig?.icon || '📋'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{issue.title}</h3>
                        {isExpanded ? <ChevronUp size={18} className="flex-shrink-0 text-[var(--color-text-muted)]" /> : <ChevronDown size={18} className="flex-shrink-0 text-[var(--color-text-muted)]" />}
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="badge" style={{ background: statusConfig.bgColor, color: statusConfig.color }}>
                          {statusConfig.label}
                        </span>
                        <span className="badge" style={{ background: urgencyConfig.bgColor, color: urgencyConfig.color }}>
                          {urgencyConfig.icon} {urgencyConfig.label}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                          <ThumbsUp size={12} /> {issue.upvoteCount} upvotes
                        </span>
                      </div>

                      {/* Status Pipeline */}
                      <div className="mt-4 status-pipeline">
                        {STATUS_PIPELINE.map((status, idx) => {
                          const stepConfig = STATUS_CONFIG[status];
                          const isCompleted = stepConfig.step < currentStep;
                          const isActive = stepConfig.step === currentStep;

                          return (
                            <div key={status} className="status-step">
                              {idx < STATUS_PIPELINE.length - 1 && (
                                <div className={`status-step-connector ${isCompleted ? 'completed' : ''}`} />
                              )}
                              <div className={`status-step-dot ${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}`}>
                                {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                              </div>
                              <span className={`status-step-label ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                                {stepConfig.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-3 animate-fade-in" style={{ borderTop: '1px solid var(--color-border-glass)' }}>
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">Description</p>
                        <p className="text-sm">{issue.description}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">Location</p>
                        <p className="text-sm flex items-center gap-1">
                          <MapPin size={14} className="text-[var(--color-accent-green)]" />
                          {issue.location.address}
                        </p>
                      </div>
                      {issue.assignedWorkerName && (
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)] mb-1">Assigned Worker</p>
                          <p className="text-sm">🔧 {issue.assignedWorkerName}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">Reported</p>
                        <p className="text-sm">{new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {issue.resolutionNotes && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-[var(--color-text-muted)] mb-1">Resolution Notes</p>
                          <p className="text-sm p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            ✅ {issue.resolutionNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
