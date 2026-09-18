'use client';

// ============================================
// CivicConnect — Worker Dashboard
// ============================================

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Issue, WorkerUser } from '@/types';
import { STATUS_CONFIG, URGENCY_CONFIG, CATEGORY_CONFIG } from '@/constants';
import {
  CheckCircle2, Clock, PlayCircle, MapPin,
  Camera, Upload, AlertTriangle, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Issue | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState<string | null>(null);

  const worker = user as WorkerUser | null;

  useEffect(() => {
    if (!user) return;
    // Fetch tasks assigned to this worker, and unassigned tasks in their department
    fetch(`/api/issues?assignedTo=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.issues || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleStatusUpdate = async (issueId: string, newStatus: string) => {
    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'resolved') {
        body.resolutionNotes = resolutionNotes || 'Issue resolved';
        body.resolvedAt = new Date().toISOString();
        if (resolutionPhoto) body.resolutionPhoto = resolutionPhoto;
      }

      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => t.id === issueId ? data.issue : t));
        if (selectedTask?.id === issueId) setSelectedTask(data.issue);
        toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
        setResolutionNotes('');
        setResolutionPhoto(null);
      }
    } catch { toast.error('Failed to update status'); }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setResolutionPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const activeTasks = tasks.filter((t) => t.status !== 'resolved');
  const completedToday = tasks.filter((t) => t.status === 'resolved' && t.resolvedAt && new Date(t.resolvedAt).toDateString() === new Date().toDateString());

  if (!worker) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          My Tasks <span className="gradient-text">Queue</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {worker.department && `${worker.designation} • ${worker.assignedZone}`}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="glass-card-static p-4 flex items-center gap-3">
          <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-accent-amber)' }}>
            <Zap size={20} />
          </div>
          <div>
            <p className="stat-card-value text-xl">{activeTasks.length}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Active Tasks</p>
          </div>
        </div>
        <div className="glass-card-static p-4 flex items-center gap-3">
          <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-accent-green)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="stat-card-value text-xl">{completedToday.length}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Completed Today</p>
          </div>
        </div>
        <div className="glass-card-static p-4 flex items-center gap-3">
          <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--color-accent-blue)' }}>
            <Clock size={20} />
          </div>
          <div>
            <p className="stat-card-value text-xl">{worker.avgResolutionTime || 0}h</p>
            <p className="text-xs text-[var(--color-text-muted)]">Avg. Resolution</p>
          </div>
        </div>
        <div className="glass-card-static p-4 flex items-center gap-3">
          <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--color-accent-purple)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="stat-card-value text-xl">{worker.tasksCompleted || 0}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Total Completed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">
            ASSIGNED TASKS ({activeTasks.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-tertiary)' }} />
              ))}
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="glass-card-static p-8 text-center">
              <CheckCircle2 size={40} className="mx-auto mb-3 text-[var(--color-accent-green)]" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-[var(--color-text-muted)]">No pending tasks</p>
            </div>
          ) : (
            activeTasks
              .sort((a, b) => {
                const urgencyOrder = { high: 0, medium: 1, low: 2 };
                return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
              })
              .map((task) => {
                const urgency = URGENCY_CONFIG[task.urgency];
                const category = CATEGORY_CONFIG[task.category];
                const status = STATUS_CONFIG[task.status];

                return (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="w-full p-4 rounded-xl text-left transition-all hover:bg-white/[0.03]"
                    style={{
                      background: selectedTask?.id === task.id ? 'rgba(59,130,246,0.08)' : 'var(--color-bg-tertiary)',
                      border: `1px solid ${selectedTask?.id === task.id ? 'rgba(59,130,246,0.3)' : 'var(--color-border-subtle)'}`,
                      borderLeft: `3px solid ${urgency.color}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{category?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center gap-1">
                          <MapPin size={10} /> {task.location.address}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="badge text-[10px]" style={{ background: urgency.bgColor, color: urgency.color }}>
                            {urgency.icon} {urgency.label}
                          </span>
                          <span className="badge text-[10px]" style={{ background: status.bgColor, color: status.color }}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
          )}
        </div>

        {/* Task Detail Panel */}
        <div className="lg:col-span-3">
          {selectedTask ? (
            <div className="glass-card-static p-6 space-y-5 animate-fade-in">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{CATEGORY_CONFIG[selectedTask.category]?.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">{selectedTask.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
                    <p className="text-xs text-[var(--color-text-muted)]">Location</p>
                    <p className="text-sm mt-1 flex items-center gap-1"><MapPin size={14} className="text-[var(--color-accent-green)]" /> {selectedTask.location.address}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
                    <p className="text-xs text-[var(--color-text-muted)]">Reported by</p>
                    <p className="text-sm mt-1">👤 {selectedTask.reporterName}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
                    <p className="text-xs text-[var(--color-text-muted)]">Urgency</p>
                    <span className="badge mt-1" style={{ background: URGENCY_CONFIG[selectedTask.urgency].bgColor, color: URGENCY_CONFIG[selectedTask.urgency].color }}>
                      {URGENCY_CONFIG[selectedTask.urgency].icon} {URGENCY_CONFIG[selectedTask.urgency].label}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
                    <p className="text-xs text-[var(--color-text-muted)]">Reported</p>
                    <p className="text-sm mt-1">{new Date(selectedTask.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--color-border-glass)' }}>
                {selectedTask.status === 'assigned' && (
                  <button onClick={() => handleStatusUpdate(selectedTask.id, 'in_progress')} className="btn-primary w-full py-3">
                    <PlayCircle size={18} /> Start Working on This Task
                  </button>
                )}

                {selectedTask.status === 'in_progress' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Camera size={16} /> Proof of Resolution
                    </h3>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Describe how the issue was resolved..."
                      className="input-field"
                      rows={3}
                    />
                    <div>
                      {resolutionPhoto ? (
                        <div className="relative rounded-xl overflow-hidden">
                          <img src={resolutionPhoto} alt="Resolution" className="w-full h-32 object-cover rounded-xl" />
                          <button onClick={() => setResolutionPhoto(null)} className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-white text-xs">✕</button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer hover:border-[var(--color-accent-blue)] transition-colors" style={{ borderColor: 'var(--color-border-glass)', background: 'var(--color-bg-tertiary)' }}>
                          <Upload size={18} className="text-[var(--color-text-muted)]" />
                          <span className="text-sm text-[var(--color-text-secondary)]">Upload resolution photo</span>
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                    <button onClick={() => handleStatusUpdate(selectedTask.id, 'resolved')} className="w-full py-3" style={{ background: 'linear-gradient(135deg, var(--color-accent-green), #059669)', color: 'white', borderRadius: '12px', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}>
                      <CheckCircle2 size={18} /> Mark as Resolved
                    </button>
                  </div>
                )}

                {selectedTask.status === 'resolved' && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <p className="text-sm font-medium text-[var(--color-accent-green)] flex items-center gap-2">
                      <CheckCircle2 size={16} /> This task has been resolved
                    </p>
                    {selectedTask.resolutionNotes && (
                      <p className="text-sm text-[var(--color-text-secondary)] mt-2">{selectedTask.resolutionNotes}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card-static p-12 text-center">
              <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--color-text-muted)]" />
              <p className="text-lg font-medium">Select a task</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Click on a task from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
