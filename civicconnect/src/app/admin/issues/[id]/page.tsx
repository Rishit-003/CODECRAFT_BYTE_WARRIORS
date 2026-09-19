'use client';

// ============================================
// CivicConnect — Complaint Details
// ============================================

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Issue, WorkerUser, IssueStatus, UrgencyLevel } from '@/types';
import { STATUS_CONFIG, URGENCY_CONFIG, CATEGORY_CONFIG, DEPARTMENTS } from '@/constants';
import { 
  ArrowLeft, MapPin, Calendar, User, Tag, 
  CheckCircle2, XCircle, Clock, AlertTriangle, Image as ImageIcon 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ComplaintDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [workers, setWorkers] = useState<WorkerUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Assignment state
  const [assigning, setAssigning] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [targetCompletionDate, setTargetCompletionDate] = useState('');
  
  // Rejection/Reopen state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const [allIssues, setAllIssues] = useState<Issue[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/issues/${id}`).then(r => r.json()),
      fetch('/api/workers').then(r => r.json()),
      fetch('/api/issues').then(r => r.json())
    ]).then(([issueData, workersData, allIssuesData]) => {
      if (issueData.issue) {
        setIssue(issueData.issue);
      }
      if (workersData.workers) {
        setWorkers(workersData.workers);
      }
      if (allIssuesData.issues) {
        setAllIssues(allIssuesData.issues);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  // Auto-calculate Target Completion Date when urgency changes (only before assignment)
  useEffect(() => {
    if (issue && ['reported', 'reopened'].includes(issue.status)) {
      const now = new Date();
      let addDays = 3;
      if (issue.urgency === 'high') addDays = 1;
      else if (issue.urgency === 'medium') addDays = 2;
      
      now.setDate(now.getDate() + addDays);
      const tzOffset = now.getTimezoneOffset() * 60000;
      setTargetCompletionDate(new Date(now.getTime() - tzOffset).toISOString().slice(0, 16));
    } else if (issue?.targetCompletionDate && !targetCompletionDate) {
      // Show existing target date if already assigned
      const d = new Date(issue.targetCompletionDate);
      const tzOffset = d.getTimezoneOffset() * 60000;
      setTargetCompletionDate(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
    }
  }, [issue?.urgency, issue?.status, issue?.targetCompletionDate, issue?.id]);

  const updateIssue = async (updates: Partial<Issue>, successMessage: string) => {
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setIssue(data.issue);
        
        // Also update in allIssues so local active task counts refresh
        setAllIssues(prev => prev.map(i => i.id === data.issue.id ? data.issue : i));
        
        toast.success(successMessage);
        return true;
      } else {
        toast.error('Failed to update complaint');
        return false;
      }
    } catch {
      toast.error('An error occurred');
      return false;
    }
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUrgency = e.target.value as UrgencyLevel;
    updateIssue({ urgency: newUrgency }, `Priority updated to ${newUrgency}`);
  };

  const handleAssign = async () => {
    if (!selectedWorkerId) return toast.error('Please select an inspector');
    const worker = workers.find(w => w.id === selectedWorkerId);
    if (!worker) return;
    
    setAssigning(true);
    await updateIssue({
      assignedTo: worker.id,
      assignedWorkerName: worker.name,
      assignedAt: new Date().toISOString(),
      targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate).toISOString() : undefined,
      status: 'assigned'
    }, `Assigned to ${worker.name}`);
    setAssigning(false);
  };

  const handleApprove = () => {
    updateIssue({ status: 'closed' }, 'Resolution approved and complaint closed');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error('Rejection reason required');
    await updateIssue({ 
      status: 'reopened', 
      rejectionReason: rejectReason 
    }, 'Resolution rejected and sent back');
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleReopen = async () => {
    if (!reopenReason.trim()) return toast.error('Reopen reason required');
    await updateIssue({ 
      status: 'reopened', 
      reopenedReason: reopenReason 
    }, 'Complaint reopened successfully');
    setShowReopenModal(false);
    setReopenReason('');
  };

  if (loading) {
    return <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />Loading Details...</div>;
  }

  if (!issue) {
    return <div className="p-8 text-center text-red-400">Complaint not found</div>;
  }

  const statusInfo = STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG];
  const urgencyInfo = URGENCY_CONFIG[issue.urgency];
  const categoryInfo = CATEGORY_CONFIG[issue.category];
  const effectiveDepartment = (issue.department === 'other' || !issue.department || !DEPARTMENTS[issue.department as Department]) 
    ? categoryInfo?.department 
    : issue.department;
  const deptInfo = DEPARTMENTS[effectiveDepartment as Department];
  
  // Available inspectors (filter by the issue's department, city AND apply priority limits)
  const inspectorsWithWorkload = workers
    .filter(w => w.department === effectiveDepartment)
    .map(w => {
      const activeTasksList = allIssues.filter(i => 
        i.assignedTo === w.id && 
        !['resolved', 'admin_review', 'closed', 'rejected'].includes(i.status)
      );
      
      const highPriorityActive = activeTasksList.filter(i => i.urgency === 'high').length;
      const medLowPriorityActive = activeTasksList.filter(i => i.urgency !== 'high').length;
      
      return { ...w, highPriorityActive, medLowPriorityActive, totalActive: activeTasksList.length };
    });
    
  const availableInspectors = inspectorsWithWorkload.filter(w => {
    if (issue.urgency === 'high') {
      return w.highPriorityActive < 2;
    } else {
      return w.medLowPriorityActive < 2;
    }
  });

  // Timeline steps
  const steps = [
    { key: 'reported', label: 'Reported', date: issue.createdAt },
    { key: 'assigned', label: 'Assigned', date: issue.assignedAt },
    { key: 'accepted', label: 'Accepted', date: issue.acceptedAt },
    { key: 'inspection', label: 'Inspection', date: issue.inspectionStartedAt },
    { key: 'in_progress', label: 'Work Started', date: issue.workStartedAt },
    { key: 'resolved', label: 'Completed', date: issue.resolvedAt },
    { key: 'admin_review', label: 'Admin Review', date: issue.status === 'admin_review' ? issue.updatedAt : null },
    { key: 'closed', label: 'Closed', date: issue.status === 'closed' ? issue.updatedAt : null },
  ];
  
  let currentStepIdx = steps.findIndex(s => s.key === issue.status);
  if (currentStepIdx === -1) currentStepIdx = 0; // Fallback

  // Status Calculation
  let workloadStatus: { label: string, color: string } | null = null;
  if (issue.targetCompletionDate && !['resolved', 'admin_review', 'closed'].includes(issue.status)) {
    const target = new Date(issue.etaDate || issue.targetCompletionDate).getTime();
    const now = new Date().getTime();
    const hoursLeft = (target - now) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) workloadStatus = { label: 'Overdue', color: '#ef4444' };
    else if (hoursLeft < 24) workloadStatus = { label: 'Due Soon', color: '#f59e0b' };
    else workloadStatus = { label: 'On Track', color: '#10b981' };
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Link href="/admin/issues" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Complaints
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold font-display">{issue.title}</h1>
            <span className="badge" style={{ background: statusInfo?.bgColor, color: statusInfo?.color }}>
              {statusInfo?.label || issue.status}
            </span>
            {workloadStatus && (
              <span className="badge" style={{ background: `${workloadStatus.color}20`, color: workloadStatus.color, border: `1px solid ${workloadStatus.color}40` }}>
                <Clock size={12} className="inline mr-1" /> {workloadStatus.label}
              </span>
            )}
          </div>
          <p className="text-sm font-mono text-[var(--color-text-muted)]">ID: {issue.id}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm text-[var(--color-text-secondary)]">Priority:</label>
          <select 
            value={issue.urgency} 
            onChange={handlePriorityChange}
            className="input-field py-1.5 px-3 text-sm font-semibold uppercase tracking-wide"
            style={{ color: urgencyInfo?.color, borderColor: urgencyInfo?.color }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {issue.status !== 'closed' && (
            <button 
              onClick={() => updateIssue({ status: 'closed', resolutionNotes: 'Closed by Admin' }, 'Complaint forcefully closed by admin')}
              className="btn-ghost py-1.5 px-3 text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-1 font-semibold"
            >
              <XCircle size={16}/> Close Complaint
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COL: Status Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card-static p-6 h-full">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[var(--color-text-muted)]">Status Timeline</h3>
            <div className="border-l-2 border-[var(--color-border-subtle)] ml-2 space-y-6 relative">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                
                return (
                  <div key={step.key} className="relative pl-6">
                    <div className={`absolute -left-[6px] top-1 w-3 h-3 rounded-full transition-colors ${
                      isCurrent ? 'border-2 border-yellow-400 bg-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.6)]' :
                      isCompleted ? 'bg-[var(--color-accent-green)] border border-[var(--color-accent-green)]' : 'bg-transparent border-2 border-[var(--color-border-subtle)]'
                    }`} />
                    <p className={`text-sm ${isCurrent ? 'font-bold text-white' : isCompleted ? 'font-medium text-[var(--color-text-secondary)]' : 'text-[var(--color-text-muted)]'}`}>
                      {step.label}
                    </p>
                    {step.date && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {new Date(step.date).toLocaleDateString()}
                    </p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COL: Main Info & Processing */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card-static p-6">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[var(--color-text-muted)]">Report Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><User size={12}/> Citizen</p>
                <p className="text-sm font-medium">{issue.reporterName}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Calendar size={12}/> Date Reported</p>
                <p className="text-sm">{new Date(issue.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Tag size={12}/> Category</p>
                <p className="text-sm">{categoryInfo?.icon} {categoryInfo?.label}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><MapPin size={12}/> Location</p>
                <p className="text-sm">{issue.location.address}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Description</p>
              <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] text-sm leading-relaxed border border-[var(--color-border-glass)]">
                {issue.description}
              </div>
            </div>

            {issue.photos?.length > 0 && (
              <div className="mt-6">
                <p className="text-xs text-[var(--color-text-muted)] mb-2 flex items-center gap-1"><ImageIcon size={12}/> Attached Photos</p>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {issue.photos.map((url, i) => (
                    <img key={i} src={url} alt="Issue" className="h-32 rounded-xl object-cover border border-[var(--color-border-glass)]" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resolution Information & Admin Review Actions */}
          {['resolved', 'admin_review', 'closed', 'reopened'].includes(issue.status) && (
            <div className="glass-card-static p-6 border-l-4 border-l-[var(--color-accent-green)]">
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[var(--color-text-muted)]">Resolution Details</h3>
              
              <div className="p-4 rounded-xl bg-white/5 border border-[var(--color-border-glass)] mb-6">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Inspector Remarks</p>
                <p className="text-sm mb-4">{issue.resolutionNotes || 'No remarks provided.'}</p>
                
                {issue.resolutionPhoto && (
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">Resolution Proof</p>
                    <img src={issue.resolutionPhoto} alt="Resolution" className="h-40 rounded-xl object-cover" />
                  </div>
                )}
              </div>

              {/* Admin Review Actions */}
              {['resolved', 'admin_review'].includes(issue.status) && (
                <div className="flex gap-4 pt-4 border-t border-[var(--color-border-glass)]">
                  <button onClick={handleApprove} className="flex-1 btn-primary bg-emerald-600 hover:bg-emerald-500 py-3 flex items-center justify-center gap-2 font-bold">
                    <CheckCircle2 size={18}/> Approve Resolution
                  </button>
                  <button onClick={() => setShowRejectModal(true)} className="flex-1 btn-ghost py-3 flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold">
                    <XCircle size={18}/> Reject / Send Back
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Closed / Reopened Info */}
          {issue.status === 'closed' && (
            <div className="flex justify-end">
               <button onClick={() => setShowReopenModal(true)} className="text-xs text-[var(--color-accent-amber)] hover:underline flex items-center gap-1">
                 <AlertTriangle size={14}/> Reopen this complaint
               </button>
            </div>
          )}
          {issue.reopenedReason && issue.status === 'reopened' && (
             <div className="glass-card-static p-4 border-l-4 border-l-[var(--color-accent-amber)] bg-amber-500/10">
               <p className="text-xs text-[var(--color-accent-amber)] mb-1 font-bold">Reopen Reason:</p>
               <p className="text-sm">{issue.reopenedReason}</p>
             </div>
          )}
          {issue.rejectionReason && (
             <div className="glass-card-static p-4 border-l-4 border-l-red-500 bg-red-500/10">
               <p className="text-xs text-red-400 mb-1 font-bold">Previous Rejection Reason:</p>
               <p className="text-sm">{issue.rejectionReason}</p>
             </div>
          )}

          {/* Processing & Assignment */}
          <div className="glass-card-static p-6">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[var(--color-text-muted)]">Processing & Assignment</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Department</p>
                <p className="text-sm flex items-center gap-2">
                  <span style={{ color: deptInfo?.color }}>{deptInfo?.icon}</span> {deptInfo?.label}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Assigned Inspector</p>
                {issue.assignedTo ? (
                  <div className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-[var(--color-border-glass)]">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-accent-amber)]/20 text-[var(--color-accent-amber)] flex items-center justify-center font-bold text-xs">
                      {issue.assignedWorkerName?.[0]}
                    </div>
                    <span className="font-medium text-[var(--color-accent-blue)]">{issue.assignedWorkerName}</span>
                  </div>
                ) : (
                  <span className="text-sm text-red-400 flex items-center gap-1"><AlertTriangle size={14}/> Unassigned</span>
                )}
              </div>

              {/* Assignment Form */}
              {['reported', 'reopened'].includes(issue.status) ? (
                <div className="pt-4 mt-2 border-t border-[var(--color-border-glass)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">
                    {issue.assignedTo ? 'Reassign Inspector:' : 'Assign Inspector:'}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mb-2 mt-4">
                    Target Completion:
                  </p>
                  <input type="datetime-local" className="input-field py-2 text-sm w-full mb-4" value={targetCompletionDate} onChange={(e) => setTargetCompletionDate(e.target.value)} />
                  <div className="flex gap-2">
                    <select 
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      className="input-field py-2 text-sm flex-1"
                    >
                      <option value="">Select inspector...</option>
                      {availableInspectors.length === 0 && <option disabled>No available inspectors</option>}
                      {availableInspectors.map(w => (
                        <option key={w.id} value={w.id}>{w.name} - {w.assignedZone} (High: {w.highPriorityActive}/2, Med/Low: {w.medLowPriorityActive}/2)</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAssign}
                      disabled={!selectedWorkerId || assigning}
                      className="btn-primary py-2 px-4 text-sm whitespace-nowrap"
                    >
                      Assign
                    </button>
                  </div>
                  {availableInspectors.length === 0 && (
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
                      *Inspectors from this department have reached their capacity for {issue.urgency} priority tasks.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-static p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Reject Resolution</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">Provide a reason for rejecting the inspector's resolution. This will be sent back to them.</p>
            <textarea 
              value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              className="w-full input-field p-3 min-h-[100px] mb-4 text-sm"
              placeholder="e.g. Streetlight is still flickering. Please check wiring..."
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 btn-ghost py-2 text-sm">Cancel</button>
              <button onClick={handleReject} className="flex-1 btn-primary bg-red-600 hover:bg-red-500 py-2 text-sm">Submit Rejection</button>
            </div>
          </div>
        </div>
      )}

      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-static p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2 text-[var(--color-accent-amber)]">Reopen Complaint</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">Why does this complaint need to be reopened?</p>
            <textarea 
              value={reopenReason} onChange={e => setReopenReason(e.target.value)}
              className="w-full input-field p-3 min-h-[100px] mb-4 text-sm"
              placeholder="e.g. The issue has resurfaced after a few days..."
            />
            <div className="flex gap-3">
              <button onClick={() => setShowReopenModal(false)} className="flex-1 btn-ghost py-2 text-sm">Cancel</button>
              <button onClick={handleReopen} className="flex-1 btn-primary py-2 text-sm">Confirm Reopen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
