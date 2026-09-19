'use client';

// ============================================
// CivicConnect — Inspector Complaint Details
// ============================================

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Issue } from '@/types';
import { STATUS_CONFIG, URGENCY_CONFIG, CATEGORY_CONFIG } from '@/constants';
import { 
  ArrowLeft, MapPin, Calendar, Camera, 
  CheckCircle2, PlayCircle, ClipboardCheck,
  AlertTriangle, Image as ImageIcon, Upload, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function WorkerComplaintDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Inspection Form State
  const [inspectionObservations, setObservations] = useState('');
  const [inspectionRemarks, setInspRemarks] = useState('');
  const [inspectionPhoto, setInspPhoto] = useState<string | null>(null);
  
  // Work / Resolution Form State
  const [workPerformed, setWorkPerformed] = useState('');
  const [resolutionNotes, setResNotes] = useState('');
  const [resolutionPhoto, setResPhoto] = useState<string | null>(null);

  // ETA State
  const [etaDate, setEtaDate] = useState('');
  const [etaReason, setEtaReason] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/issues/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.issue) {
          setIssue(data.issue);
          setObservations(data.issue.inspectionObservations || '');
          setInspRemarks(data.issue.inspectionRemarks || '');
          setInspPhoto(data.issue.inspectionPhoto || null);
          setWorkPerformed(data.issue.workPerformed || '');
          setResNotes(data.issue.resolutionNotes || '');
          setResPhoto(data.issue.resolutionPhoto || null);
          if (data.issue.etaDate) {
            // format datetime-local
            const d = new Date(data.issue.etaDate);
            setEtaDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16));
          }
          setEtaReason(data.issue.etaUpdateReason || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setter(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateIssue = async (updates: Partial<Issue>, successMsg: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setIssue(data.issue);
        toast.success(successMsg);
      } else {
        toast.error('Failed to update complaint');
      }
    } catch {
      toast.error('An error occurred');
    }
    setSaving(false);
  };

  const startInspection = () => {
    updateIssue({ 
      status: 'inspection', 
      inspectionStartedAt: new Date().toISOString() 
    }, 'Inspection started');
  };

  const saveInspection = () => {
    if (!inspectionObservations || !inspectionRemarks) {
      return toast.error('Observations and remarks are required.');
    }
    updateIssue({
      inspectionObservations,
      inspectionRemarks,
      inspectionPhoto: inspectionPhoto || undefined
    }, 'Inspection details saved');
  };

  const startWork = () => {
    saveInspection(); // Save inspection data implicitly before moving to work
    updateIssue({
      status: 'in_progress',
      workStartedAt: new Date().toISOString(),
      inspectionObservations,
      inspectionRemarks,
      inspectionPhoto: inspectionPhoto || undefined
    }, 'Work started');
  };

  const submitResolution = () => {
    if (!workPerformed || !resolutionNotes) {
      return toast.error('Work performed and resolution remarks are required.');
    }
    updateIssue({
      status: 'resolved', // This effectively hands it over for Admin Review
      workPerformed,
      resolutionNotes,
      resolutionPhoto: resolutionPhoto || undefined,
      resolvedAt: new Date().toISOString()
    }, 'Resolution submitted for Admin Review');
  };

  if (loading) return <div className="p-8 text-center text-[var(--color-text-muted)]">Loading Complaint...</div>;
  if (!issue) return <div className="p-8 text-center text-red-400">Complaint not found</div>;

  const statusInfo = STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG];
  const urgencyInfo = URGENCY_CONFIG[issue.urgency];
  const categoryInfo = CATEGORY_CONFIG[issue.category];

  // Steps for timeline
  const steps = [
    { key: 'assigned', label: 'Assigned', date: issue.assignedAt },
    { key: 'accepted', label: 'Accepted', date: issue.acceptedAt },
    { key: 'inspection', label: 'Inspection Started', date: issue.inspectionStartedAt },
    { key: 'in_progress', label: 'Work Started', date: issue.workStartedAt },
    { key: 'resolved', label: 'Resolution Submitted', date: issue.resolvedAt },
    { key: 'admin_review', label: 'Admin Review', date: issue.status === 'admin_review' || issue.status === 'closed' ? issue.updatedAt : null },
    ...(issue.status === 'closed' ? [{ key: 'closed', label: 'Closed (Approved)', date: issue.updatedAt }] : []),
    ...(issue.status === 'reopened' || issue.rejectionReason ? [{ key: 'reopened', label: 'Reopened (Rejected)', date: issue.updatedAt }] : [])
  ];

  let currentStepIdx = steps.findIndex(s => s.key === issue.status);
  if (currentStepIdx === -1) currentStepIdx = 0;
  if (['resolved', 'admin_review'].includes(issue.status)) {
     currentStepIdx = steps.findIndex(s => s.key === 'admin_review'); 
     // Show admin review step as current if it's waiting for admin
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-fade-in">
      <Link href="/worker/issues" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to My Complaints
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold font-display">Complaint #{issue.id.slice(0, 8)}</h1>
            <span className="badge" style={{ background: statusInfo?.bgColor, color: statusInfo?.color }}>
              {statusInfo?.label || issue.status}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">{issue.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          
          {/* SECTION 2 - LOCATION */}
          <div className="glass-card-static p-6">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[var(--color-text-muted)]">Location</h3>
            <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] flex flex-col gap-3 min-h-[100px] justify-center border border-[var(--color-border-glass)]">
              <div className="flex items-start gap-3 w-full overflow-hidden">
                <MapPin size={18} className="text-[var(--color-accent-blue)] shrink-0 mt-0.5" />
                <p className="text-sm break-all w-full">{issue.location.address}</p>
              </div>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${issue.location.coordinates[1]},${issue.location.coordinates[0]}`}
                target="_blank" rel="noopener noreferrer"
                className="btn-secondary py-2 w-full text-xs flex justify-center items-center gap-2 mt-2"
              >
                <MapPin size={14} /> Open in Google Maps
              </a>
            </div>
          </div>

          {/* SECTION 3 - ASSIGNMENT & PRIORITY */}
          <div className="glass-card-static p-6">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[var(--color-text-muted)]">Update Priority & ETA</h3>
            <div className="space-y-4">
              {issue.status === 'assigned' && (
                <div className="pb-4 border-b border-[var(--color-border-glass)]">
                  <button 
                    onClick={() => updateIssue({ status: 'accepted', acceptedAt: new Date().toISOString() }, 'Work Accepted')} 
                    className="btn-primary w-full py-3 font-bold bg-purple-600 hover:bg-purple-500"
                    disabled={saving}
                  >
                    Accept Work
                  </button>
                </div>
              )}
              {['accepted', 'inspection', 'in_progress'].includes(issue.status) && (
                <div className="pb-4 border-b border-[var(--color-border-glass)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Estimated Completion Date (ETA)</p>
                  <input type="datetime-local" value={etaDate} onChange={e => setEtaDate(e.target.value)} className="input-field w-full text-sm mb-2" />
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Reason for ETA Change</p>
                  <textarea value={etaReason} onChange={e => setEtaReason(e.target.value)} className="input-field w-full text-sm min-h-[60px] mb-2" placeholder="Required if updating ETA..." />
                  <button 
                    onClick={() => updateIssue({ etaDate: new Date(etaDate).toISOString(), etaUpdateReason: etaReason }, 'ETA Updated')} 
                    className="btn-secondary w-full py-2 text-xs"
                    disabled={saving || !etaDate}
                  >
                    Update ETA
                  </button>
                </div>
              )}
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Priority</p>
                <select 
                  value={issue.urgency}
                  onChange={(e) => updateIssue({ urgency: e.target.value as any }, 'Priority updated')}
                  className="input-field w-full text-sm"
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Assigned Date</p>
                <p className="text-sm">{issue.assignedAt ? new Date(issue.assignedAt).toLocaleString() : 'Unknown'}</p>
              </div>
              
              {issue.rejectionReason && issue.status === 'reopened' && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 font-bold mb-1 flex items-center gap-1"><AlertTriangle size={14}/> Resolution Rejected</p>
                  <p className="text-sm text-red-100">{issue.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* TIMELINE (Moved to right column and made horizontal) */}
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card-static p-6">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[var(--color-text-muted)]">Timeline</h3>
            <div className="relative flex justify-between items-start mt-8 mb-4">
              {/* Horizontal Line Background */}
              <div className="absolute top-[6px] left-[10%] right-[10%] h-[2px] bg-[var(--color-border-subtle)] z-0" />
              
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                
                return (
                  <div key={step.key} className="relative flex flex-col items-center text-center flex-1 z-10">
                    <div className={`w-3.5 h-3.5 rounded-full mb-2 transition-colors z-10 ${
                      isCurrent ? 'bg-[var(--color-accent-blue)] shadow-[0_0_10px_rgba(59,130,246,0.6)]' :
                      isCompleted ? 'bg-[var(--color-accent-green)]' : 'bg-[var(--color-bg-tertiary)] border-2 border-[var(--color-border-subtle)]'
                    }`} />
                    <p className={`text-xs px-1 ${isCurrent ? 'font-bold text-white' : isCompleted ? 'font-medium text-[var(--color-text-secondary)]' : 'text-[var(--color-text-muted)]'}`}>
                      {step.label}
                    </p>
                    {step.date && <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                      {new Date(step.date).toLocaleDateString()}
                    </p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 1 - CITIZEN REPORT */}
          <div className="glass-card-static p-6">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[var(--color-text-muted)]">Citizen Report</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Calendar size={12}/> Reported On</p>
                <p className="text-sm">{new Date(issue.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Category</p>
                <p className="text-sm flex items-center gap-1">{categoryInfo?.icon} {categoryInfo?.label}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Description</p>
              <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] text-sm leading-relaxed border border-[var(--color-border-glass)]">
                {issue.description}
              </div>
            </div>

            {issue.photos?.length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-2 flex items-center gap-1"><ImageIcon size={12}/> Citizen Evidence</p>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {issue.photos.map((url, i) => (
                    <img key={i} src={url} alt="Report evidence" className="h-40 rounded-xl object-cover border border-[var(--color-border-glass)]" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4 - INSPECTION */}
          {(['accepted', 'reopened'].includes(issue.status)) && (
            <div className="glass-card-static p-6 text-center border-2 border-dashed border-[var(--color-border-glass)]">
              <ClipboardCheck size={48} className="mx-auto mb-3 text-[var(--color-accent-blue)] opacity-80" />
              <h3 className="text-lg font-bold mb-2">Ready for Inspection</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
                Review the citizen report and location details, then start your on-site inspection.
              </p>
              <button onClick={startInspection} disabled={saving} className="btn-primary py-3 px-8 text-base">
                <PlayCircle size={18} className="mr-2" /> 
                {issue.status === 'reopened' ? 'Start Re-Inspection' : 'Start Inspection'}
              </button>
            </div>
          )}

          {['inspection', 'in_progress', 'resolved', 'admin_review', 'closed'].includes(issue.status) && (
            <div className="glass-card-static p-6 border-l-4 border-l-[var(--color-accent-blue)]">
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[var(--color-text-muted)]">Inspection Details</h3>
              
              {issue.status === 'inspection' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Observations / Issue Found *</label>
                    <textarea 
                      value={inspectionObservations} onChange={e => setObservations(e.target.value)}
                      placeholder="e.g. Streetlight pole inspected. Bulb is damaged."
                      className="input-field w-full min-h-[80px]" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Inspection Remarks *</label>
                    <textarea 
                      value={inspectionRemarks} onChange={e => setInspRemarks(e.target.value)}
                      placeholder="e.g. Bulb replacement required."
                      className="input-field w-full min-h-[60px]" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-2 flex items-center gap-1"><Camera size={14}/> Inspection Photo</label>
                    {inspectionPhoto ? (
                      <div className="relative inline-block">
                        <img src={inspectionPhoto} className="h-32 rounded-xl object-cover" alt="Inspection" />
                        <button onClick={() => setInspPhoto(null)} className="absolute top-2 right-2 bg-black/60 p-1 rounded-lg text-white">✕</button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer hover:border-[var(--color-accent-blue)] transition-colors" style={{ borderColor: 'var(--color-border-glass)', background: 'var(--color-bg-tertiary)' }}>
                        <Upload size={18} className="text-[var(--color-text-muted)]" />
                        <span className="text-sm text-[var(--color-text-secondary)]">Upload inspection evidence (Before photo)</span>
                        <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, setInspPhoto)} className="hidden" />
                      </label>
                    )}
                  </div>
                  
                  <div className="flex gap-4 pt-4 border-t border-[var(--color-border-glass)]">
                    <button onClick={saveInspection} disabled={saving} className="btn-secondary py-3 flex-1 text-sm">Save Draft</button>
                    <button onClick={startWork} disabled={saving} className="btn-primary py-3 flex-1 text-sm bg-[var(--color-accent-amber)] hover:bg-amber-500 text-amber-950 font-bold border-none">
                      <PlayCircle size={18} className="mr-2" /> Start Work
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">Observations</p>
                      <p className="text-sm font-medium">{issue.inspectionObservations || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">Remarks</p>
                      <p className="text-sm font-medium">{issue.inspectionRemarks || 'N/A'}</p>
                    </div>
                  </div>
                  {issue.inspectionPhoto && (
                    <div className="mt-3">
                      <p className="text-xs text-[var(--color-text-muted)] mb-2">Inspection Photo</p>
                      <img src={issue.inspectionPhoto} className="h-32 rounded-xl object-cover" alt="Inspection" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION 5 - RESOLUTION */}
          {['in_progress', 'resolved', 'admin_review', 'closed'].includes(issue.status) && (
            <div className="glass-card-static p-6 border-l-4 border-l-[var(--color-accent-green)]">
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[var(--color-text-muted)]">Work & Resolution</h3>
              
              {issue.status === 'in_progress' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Work Performed *</label>
                    <textarea 
                      value={workPerformed} onChange={e => setWorkPerformed(e.target.value)}
                      placeholder="e.g. Replaced damaged bulb and tested the streetlight."
                      className="input-field w-full min-h-[80px]" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Resolution Remarks *</label>
                    <textarea 
                      value={resolutionNotes} onChange={e => setResNotes(e.target.value)}
                      placeholder="e.g. Streetlight is functioning normally."
                      className="input-field w-full min-h-[60px]" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-2 flex items-center gap-1"><Camera size={14}/> Resolution Photo (After)</label>
                    {resolutionPhoto ? (
                      <div className="relative inline-block">
                        <img src={resolutionPhoto} className="h-32 rounded-xl object-cover" alt="Resolution" />
                        <button onClick={() => setResPhoto(null)} className="absolute top-2 right-2 bg-black/60 p-1 rounded-lg text-white">✕</button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer hover:border-[var(--color-accent-green)] transition-colors" style={{ borderColor: 'var(--color-border-glass)', background: 'var(--color-bg-tertiary)' }}>
                        <Upload size={18} className="text-[var(--color-text-muted)]" />
                        <span className="text-sm text-[var(--color-text-secondary)]">Upload resolution evidence (After photo)</span>
                        <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, setResPhoto)} className="hidden" />
                      </label>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-[var(--color-border-glass)]">
                    <button onClick={submitResolution} disabled={saving} className="btn-primary w-full py-4 text-base bg-emerald-600 hover:bg-emerald-500 font-bold">
                      <CheckCircle2 size={20} className="mr-2" /> Mark as Resolved & Submit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">Work Performed</p>
                      <p className="text-sm font-medium">{issue.workPerformed || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">Resolution Remarks</p>
                      <p className="text-sm font-medium">{issue.resolutionNotes || 'N/A'}</p>
                    </div>
                  </div>
                  {issue.resolutionPhoto && (
                    <div className="mt-3">
                      <p className="text-xs text-[var(--color-text-muted)] mb-2">Resolution Proof</p>
                      <img src={issue.resolutionPhoto} className="h-40 rounded-xl object-cover border border-[var(--color-border-glass)]" alt="Resolution" />
                    </div>
                  )}
                  {issue.status === 'resolved' || issue.status === 'admin_review' ? (
                     <div className="mt-4 p-4 rounded-xl bg-[var(--color-accent-blue)]/10 border border-[var(--color-accent-blue)]/20 text-center">
                       <p className="text-sm text-[var(--color-accent-blue)] font-medium flex items-center justify-center gap-2">
                         <Clock size={16}/> Resolution submitted. Pending Admin Review.
                       </p>
                     </div>
                  ) : issue.status === 'closed' ? (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <p className="text-sm text-emerald-400 font-medium flex items-center justify-center gap-2">
                        <CheckCircle2 size={16}/> Resolution Approved and Closed.
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
