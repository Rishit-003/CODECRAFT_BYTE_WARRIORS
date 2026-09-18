'use client';

// ============================================
// CivicConnect — Admin Issue Management
// ============================================

import { useEffect, useState } from 'react';
import { Issue, WorkerUser, IssueStatus, Department } from '@/types';
import { STATUS_CONFIG, URGENCY_CONFIG, CATEGORY_CONFIG, DEPARTMENTS, STATUS_PIPELINE } from '@/constants';
import {
  Search, Filter, UserPlus, ChevronDown,
  MapPin, X, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [workers, setWorkers] = useState<WorkerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [deptFilter, setDeptFilter] = useState<Department | 'all'>('all');
  const [assignModalIssue, setAssignModalIssue] = useState<Issue | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/issues').then((r) => r.json()),
      fetch('/api/workers').then((r) => r.json()),
    ]).then(([issueData, workerData]) => {
      setIssues(issueData.issues || []);
      setWorkers(workerData.workers || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAssign = async (issueId: string, workerId: string, workerName: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: workerId, assignedWorkerName: workerName, status: 'assigned' }),
      });
      if (res.ok) {
        const data = await res.json();
        setIssues((prev) => prev.map((i) => i.id === issueId ? data.issue : i));
        setAssignModalIssue(null);
        toast.success(`Assigned to ${workerName}`);
      }
    } catch { toast.error('Failed to assign'); }
  };

  const handleStatusChange = async (issueId: string, status: IssueStatus) => {
    try {
      const body: Record<string, unknown> = { status };
      if (status === 'resolved') body.resolvedAt = new Date().toISOString();

      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setIssues((prev) => prev.map((i) => i.id === issueId ? data.issue : i));
        toast.success(`Status updated to ${status.replace('_', ' ')}`);
      }
    } catch { toast.error('Failed to update status'); }
  };

  // Filter
  let filtered = issues;
  if (statusFilter !== 'all') filtered = filtered.filter((i) => i.status === statusFilter);
  if (deptFilter !== 'all') filtered = filtered.filter((i) => i.department === deptFilter);
  if (search) filtered = filtered.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()) || i.location.address.toLowerCase().includes(search.toLowerCase()));

  const availableWorkers = assignModalIssue
    ? workers.filter((w) => w.department === assignModalIssue.department && w.isActive)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Issue <span className="gradient-text">Management</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">View, assign, and manage all reported issues</p>
      </div>

      {/* Filters */}
      <div className="glass-card-static p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search issues..." className="input-field pl-10 py-2" style={{ paddingLeft: '40px' }} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--color-text-muted)]" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'all')} className="input-field py-2 text-sm min-w-[130px]">
            <option value="all">All Status</option>
            {STATUS_PIPELINE.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </select>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value as Department | 'all')} className="input-field py-2 text-sm min-w-[150px]">
            <option value="all">All Departments</option>
            {Object.entries(DEPARTMENTS).map(([key, dept]) => <option key={key} value={key}>{dept.icon} {dept.label}</option>)}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-[var(--color-text-muted)]">{filtered.length} issues found</p>

      {/* Issues Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-tertiary)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((issue) => {
            const status = STATUS_CONFIG[issue.status];
            const urgency = URGENCY_CONFIG[issue.urgency];
            const category = CATEGORY_CONFIG[issue.category];
            const dept = DEPARTMENTS[issue.department];

            return (
              <div key={issue.id} className="glass-card-static p-4 rounded-xl" style={{ borderLeft: `3px solid ${urgency.color}` }}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{category?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{issue.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {issue.location.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="badge text-[10px]" style={{ background: status.bgColor, color: status.color }}>{status.label}</span>
                      <span className="badge text-[10px]" style={{ background: urgency.bgColor, color: urgency.color }}>{urgency.icon} {urgency.label}</span>
                      <span className="badge text-[10px]" style={{ background: `${dept?.color}20`, color: dept?.color }}>{dept?.icon} {dept?.label}</span>
                      {issue.assignedWorkerName && (
                        <span className="text-xs text-[var(--color-text-muted)]">🔧 {issue.assignedWorkerName}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status dropdown */}
                    <div className="relative">
                      <select
                        value={issue.status}
                        onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                        className="input-field py-1.5 px-3 text-xs min-w-[120px]"
                        style={{ background: status.bgColor, color: status.color, borderColor: `${status.color}30` }}
                      >
                        {STATUS_PIPELINE.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                      </select>
                    </div>
                    {/* Assign button */}
                    <button
                      onClick={() => setAssignModalIssue(issue)}
                      className="btn-ghost text-xs py-1.5 px-3"
                      title="Assign worker"
                    >
                      <UserPlus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Modal */}
      {assignModalIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="glass-card-static p-6 w-full max-w-md animate-fade-in" style={{ borderRadius: '20px' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Assign Worker</h3>
              <button onClick={() => setAssignModalIssue(null)} className="p-1 hover:bg-white/5 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Assign a <strong>{DEPARTMENTS[assignModalIssue.department]?.label}</strong> worker to: <em>{assignModalIssue.title}</em>
            </p>

            {availableWorkers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-[var(--color-text-muted)]">No active workers in this department</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableWorkers.map((worker) => (
                  <button
                    key={worker.id}
                    onClick={() => handleAssign(assignModalIssue.id, worker.id, worker.name)}
                    className="w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all hover:bg-white/[0.05]"
                    style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)' }}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-accent-amber)' }}>
                      {worker.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{worker.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{worker.designation} • {worker.assignedZone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--color-accent-green)]">{worker.tasksCompleted} completed</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{worker.avgResolutionTime}h avg</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
