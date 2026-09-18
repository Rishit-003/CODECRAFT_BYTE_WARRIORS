'use client';

// ============================================
// CivicConnect — Track My Reports
// ============================================

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Issue, IssueStatus } from '@/types';
import { STATUS_CONFIG, URGENCY_CONFIG, CATEGORY_CONFIG, STATUS_PIPELINE } from '@/constants';
import { CheckCircle2, Clock, Filter, ThumbsUp, MapPin, ChevronDown, ChevronUp, Search, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrackReportsPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<{ id: string; type: 'feedback' | 'reopen' } | null>(null);
  
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: '' });
  const [reopenReason, setReopenReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchIssues();
  }, [user]);

  const fetchIssues = () => {
    setLoading(true);
    fetch(`/api/issues?reportedBy=${user?.id}`)
      .then((r) => r.json())
      .then((data) => { setIssues(data.issues || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const filtered = issues.filter((i) => {
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      i.id.toLowerCase().includes(q) || 
      i.title.toLowerCase().includes(q) || 
      i.description.toLowerCase().includes(q) ||
      i.location.address.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleSubmitFeedback = async (id: string) => {
    if (!feedbackData.comment.trim()) return toast.error('Please enter a comment');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: {
            ...feedbackData,
            createdAt: new Date().toISOString()
          }
        })
      });
      if (!res.ok) throw new Error();
      toast.success('Feedback submitted successfully!');
      setActiveAction(null);
      fetchIssues();
    } catch {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReopen = async (id: string) => {
    if (!reopenReason.trim()) return toast.error('Please provide a reason');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'reopened',
          reopenedReason: reopenReason,
          updatedAt: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error();
      toast.success('Reopen request submitted!');
      setActiveAction(null);
      fetchIssues();
    } catch {
      toast.error('Failed to request reopen');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Track My Reports</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Follow the progress of your submitted issues</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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

        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>
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
            {searchQuery ? "No reports match your search." : (statusFilter === 'all' ? "You haven't submitted any reports yet." : `No reports with status "${STATUS_CONFIG[statusFilter as IssueStatus]?.label}"`)}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((issue) => {
            const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG['reported'];
            const urgencyConfig = URGENCY_CONFIG[issue.urgency];
            const categoryConfig = CATEGORY_CONFIG[issue.category];
            const currentStep = statusConfig.step;
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
                        <div>
                          <h3 className="font-semibold">{issue.title}</h3>
                          <span className="text-xs text-[var(--color-text-muted)]">ID: {issue.id.slice(0,8)}</span>
                        </div>
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
                  <div className="px-5 pb-5 space-y-4 animate-fade-in" style={{ borderTop: '1px solid var(--color-border-glass)' }}>
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <p className="text-xs text-[var(--color-text-muted)] mb-1">Resolution Summary</p>
                          <p className="text-sm p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            ✅ {issue.resolutionNotes}
                          </p>
                        </div>
                      )}
                      
                      {/* Citizen Feedback View if exists */}
                      {issue.feedback && (
                        <div className="sm:col-span-2 p-3 rounded-lg bg-black/20 border border-[var(--color-border-glass)]">
                          <p className="text-xs text-[var(--color-text-muted)] mb-2 flex items-center gap-2">
                            <Star size={14} className="text-yellow-500" /> Your Feedback
                          </p>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} size={16} fill={star <= issue.feedback!.rating ? "#eab308" : "none"} className={star <= issue.feedback!.rating ? "text-yellow-500" : "text-gray-500"} />
                            ))}
                          </div>
                          <p className="text-sm italic">"{issue.feedback.comment}"</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-3 border-t border-[var(--color-border-glass)]">
                      {(issue.status === 'closed' && !issue.feedback) && (
                        <button 
                          onClick={() => setActiveAction({ id: issue.id, type: 'feedback' })}
                          className="btn btn-primary text-sm py-1.5"
                        >
                          <Star size={14} className="mr-1" /> Leave Feedback
                        </button>
                      )}
                      
                      {(issue.status === 'resolved' || issue.status === 'closed') && (
                        <button 
                          onClick={() => setActiveAction({ id: issue.id, type: 'reopen' })}
                          className="btn btn-secondary text-sm py-1.5 text-red-400 hover:text-red-300"
                        >
                          <MessageSquare size={14} className="mr-1" /> Issue Still Exists
                        </button>
                      )}
                    </div>

                    {/* Action Forms */}
                    {activeAction?.id === issue.id && (
                      <div className="mt-4 p-4 rounded-xl bg-black/30 border border-[var(--color-border-glass)] animate-fade-in">
                        
                        {activeAction.type === 'feedback' && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">How was your experience?</h4>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setFeedbackData({ ...feedbackData, rating: star })}>
                                  <Star size={24} fill={star <= feedbackData.rating ? "#eab308" : "none"} className={star <= feedbackData.rating ? "text-yellow-500" : "text-gray-500 hover:text-yellow-400"} />
                                </button>
                              ))}
                            </div>
                            <textarea 
                              placeholder="Leave a comment..."
                              className="input-field w-full text-sm"
                              value={feedbackData.comment}
                              onChange={e => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                            />
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setActiveAction(null)} className="btn btn-secondary py-1 text-sm">Cancel</button>
                              <button onClick={() => handleSubmitFeedback(issue.id)} disabled={submitting} className="btn btn-primary py-1 text-sm">Submit Feedback</button>
                            </div>
                          </div>
                        )}

                        {activeAction.type === 'reopen' && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-red-400">Request Reopen</h4>
                            <p className="text-xs text-[var(--color-text-muted)]">If the problem is not fixed, please provide details and request a reopen.</p>
                            <textarea 
                              placeholder="Why is this still an issue? (e.g. Streetlight still not working)"
                              className="input-field w-full text-sm"
                              value={reopenReason}
                              onChange={e => setReopenReason(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setActiveAction(null)} className="btn btn-secondary py-1 text-sm">Cancel</button>
                              <button onClick={() => handleRequestReopen(issue.id)} disabled={submitting} className="px-4 py-1.5 rounded-lg font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 text-sm">Submit Request</button>
                            </div>
                          </div>
                        )}

                      </div>
                    )}
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

