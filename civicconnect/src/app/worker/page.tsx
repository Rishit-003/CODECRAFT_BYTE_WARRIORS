'use client';

// ============================================
// CivicConnect — Inspector Dashboard
// ============================================

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Issue, WorkerUser } from '@/types';
import { STATUS_CONFIG, URGENCY_CONFIG, CATEGORY_CONFIG } from '@/constants';
import {
  ClipboardList, AlertCircle, PlayCircle, CheckCircle2,
  Clock, MapPin, ArrowRight, Bell, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const worker = user as WorkerUser | null;

  useEffect(() => {
    if (!user) return;
    fetch(`/api/issues?assignedTo=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.issues || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!worker) return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-tertiary)' }} />
          ))}
        </div>
      </div>
    );
  }

  // Stats
  const activeWorks = tasks.filter(t => !['resolved', 'admin_review', 'closed', 'rejected'].includes(t.status));
  const totalAssigned = activeWorks.length;
  const pendingInspection = tasks.filter(t => ['assigned', 'accepted', 'reopened'].includes(t.status)).length;
  const inProgress = tasks.filter(t => ['inspection', 'in_progress'].includes(t.status)).length;
  
  const now = new Date().getTime();
  const overdue = activeWorks.filter(t => {
    if (!t.targetCompletionDate && !t.etaDate) return false;
    return new Date(t.etaDate || t.targetCompletionDate!).getTime() < now;
  }).length;
  const dueSoon = activeWorks.filter(t => {
    if (!t.targetCompletionDate && !t.etaDate) return false;
    const target = new Date(t.etaDate || t.targetCompletionDate!).getTime();
    return target >= now && (target - now) < 24 * 60 * 60 * 1000;
  }).length;

  // Today's Assignments
  const todaysAssignments = tasks
    .filter(t => !['resolved', 'admin_review', 'closed'].includes(t.status))
    .slice(0, 5);

  // Requires Action
  const requiresAction = tasks.filter(t => 
    ['assigned', 'reopened'].includes(t.status) || 
    t.status === 'rejected'
  ).slice(0, 5);

  // Recent Activity (derived from tasks for demo)
  const recentActivity = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        <div className="glass-card-static p-4 flex flex-col justify-between h-[110px]">
           <div className="flex items-center justify-between">
             <span className="text-xs font-medium text-[var(--color-text-secondary)]">Active Works</span>
             <ClipboardList size={18} className="text-blue-400 opacity-80" />
           </div>
           <p className="text-3xl font-bold text-blue-400">{totalAssigned} <span className="text-lg text-[var(--color-text-muted)]">/ 4</span></p>
        </div>
        <div className="glass-card-static p-4 flex flex-col justify-between h-[110px]">
           <div className="flex items-center justify-between">
             <span className="text-xs font-medium text-[var(--color-text-secondary)]">Pending Inspection</span>
             <AlertCircle size={18} className="text-[var(--color-accent-blue)] opacity-80" />
           </div>
           <p className="text-3xl font-bold text-[var(--color-accent-blue)]">{pendingInspection}</p>
        </div>
        <div className="glass-card-static p-4 flex flex-col justify-between h-[110px]">
           <div className="flex items-center justify-between">
             <span className="text-xs font-medium text-[var(--color-text-secondary)]">In Progress</span>
             <PlayCircle size={18} className="text-purple-400 opacity-80" />
           </div>
           <p className="text-3xl font-bold text-purple-400">{inProgress}</p>
        </div>
        <div className="glass-card-static p-4 flex flex-col justify-between h-[110px]">
           <div className="flex items-center justify-between">
             <span className="text-xs font-medium text-[var(--color-text-secondary)]">Due Soon</span>
             <AlertCircle size={18} className="text-amber-400 opacity-80" />
           </div>
           <p className="text-3xl font-bold text-amber-400">{dueSoon}</p>
        </div>
        <div className="glass-card-static p-4 flex flex-col justify-between h-[110px]">
           <div className="flex items-center justify-between">
             <span className="text-xs font-medium text-[var(--color-text-secondary)]">Overdue</span>
             <Clock size={18} className="text-red-400 opacity-80" />
           </div>
           <p className="text-3xl font-bold text-red-400">{overdue}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* A. TODAY'S ASSIGNMENTS */}
        <div className="lg:col-span-2 glass-card-static flex flex-col">
          <div className="p-5 border-b border-[var(--color-border-glass)] flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ClipboardList size={16} className="text-[var(--color-accent-blue)]" />
              Today&apos;s Assignments
            </h3>
            <Link href="/worker/issues" className="text-xs text-[var(--color-accent-blue)] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[var(--color-text-muted)] bg-white/5">
                <tr>
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Location</th>
                  <th className="p-3 font-medium">Priority</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-glass)]">
                {todaysAssignments.map(task => {
                  const urgency = URGENCY_CONFIG[task.urgency];
                  const status = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG];
                  
                  return (
                    <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 font-mono text-xs">{task.id.slice(0, 8)}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1">
                          {CATEGORY_CONFIG[task.category]?.icon} {CATEGORY_CONFIG[task.category]?.label}
                        </span>
                      </td>
                      <td className="p-3 truncate max-w-[150px]">
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]" title={task.location.address}>
                          <MapPin size={10}/> {task.location.address}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}
                              style={{ background: urgency?.bgColor, color: urgency?.color }}>
                          {task.urgency}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide`}
                              style={{ background: status?.bgColor, color: status?.color }}>
                          {status?.label || task.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/worker/issues/${task.id}`} className="text-[var(--color-accent-blue)] text-xs font-medium hover:underline">
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {todaysAssignments.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)]">No assignments for today.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* B & C. SIDEBAR COLUMN */}
        <div className="space-y-6">
          
          {/* REQUIRES ACTION */}
          <div className="glass-card-static p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <ShieldAlert size={16} className="text-[var(--color-accent-amber)]" />
              Requires Action
            </h3>
            
            <div className="space-y-3">
              {requiresAction.map(task => (
                <Link key={task.id} href={`/worker/issues/${task.id}`} className="block p-3 rounded-xl border border-[var(--color-border-glass)] hover:bg-white/5 transition-colors group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-white group-hover:text-[var(--color-accent-blue)] transition-colors">
                      {CATEGORY_CONFIG[task.category]?.label || task.category}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{task.id.slice(0,8)}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1 mb-2">
                    {task.title}
                  </p>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide"
                        style={{ 
                          background: STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]?.bgColor, 
                          color: STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]?.color 
                        }}>
                    {STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]?.label || task.status}
                  </span>
                </Link>
              ))}
              {requiresAction.length === 0 && (
                <p className="text-center text-sm text-[var(--color-text-muted)] py-4">No pending actions!</p>
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="glass-card-static p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Bell size={16} className="text-[var(--color-text-muted)]" />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {recentActivity.map(task => {
                const statusInfo = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG];
                return (
                  <div key={`act-${task.id}`} className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: statusInfo?.color || '#ccc' }} />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="text-[var(--color-text-muted)]">Task</span>{' '}
                        <Link href={`/worker/issues/${task.id}`} className="font-medium hover:underline text-white">
                          #{task.id.slice(0, 8)}
                        </Link>{' '}
                        <span className="text-[var(--color-text-muted)]">updated to</span>{' '}
                        <span style={{ color: statusInfo?.color }}>{statusInfo?.label || task.status}</span>
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {new Date(task.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
