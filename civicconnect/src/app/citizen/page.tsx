'use client';

// ============================================
// CivicConnect — Citizen Dashboard
// ============================================

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Issue } from '@/types';
import { STATUS_CONFIG, URGENCY_CONFIG, CATEGORY_CONFIG } from '@/constants';
import Link from 'next/link';
import {
  PlusCircle, FileText, MapPin, TrendingUp,
  CheckCircle2, Clock, AlertTriangle, ThumbsUp,
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/issues?reportedBy=${user.id}`).then((r) => r.json()),
      fetch('/api/issues').then((r) => r.json()),
    ]).then(([myData, allData]) => {
      setIssues(myData.issues || []);
      setAllIssues(allData.issues || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const myResolved = issues.filter((i) => i.status === 'resolved').length;
  const myPending = issues.filter((i) => i.status !== 'resolved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Welcome back, <span className="gradient-text">{user.name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Here&apos;s what&apos;s happening in your community
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Link href="/citizen/report" className="glass-card p-5 flex items-center gap-4 group">
          <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--color-accent-blue)' }}>
            <PlusCircle size={22} />
          </div>
          <div>
            <p className="text-sm font-medium">Report Issue</p>
            <p className="text-xs text-[var(--color-text-muted)]">Submit a new report</p>
          </div>
        </Link>

        <div className="glass-card-static p-5 flex items-center gap-4">
          <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-accent-amber)' }}>
            <Clock size={22} />
          </div>
          <div>
            <p className="stat-card-value text-2xl">{loading ? '...' : myPending}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Pending Reports</p>
          </div>
        </div>

        <div className="glass-card-static p-5 flex items-center gap-4">
          <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-accent-green)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="stat-card-value text-2xl">{loading ? '...' : myResolved}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Resolved</p>
          </div>
        </div>

        <div className="glass-card-static p-5 flex items-center gap-4">
          <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--color-accent-purple)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="stat-card-value text-2xl">{loading ? '...' : allIssues.length}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Community Issues</p>
          </div>
        </div>
      </div>

      {/* My Recent Reports */}
      <div className="glass-card-static p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>My Recent Reports</h2>
          <Link href="/citizen/track" className="text-sm text-[var(--color-accent-blue)] hover:underline flex items-center gap-1">
            View all <FileText size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-tertiary)' }} />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-10">
            <AlertTriangle size={40} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
            <p className="text-[var(--color-text-secondary)]">No reports yet</p>
            <Link href="/citizen/report" className="btn-primary mt-4 inline-flex">
              <PlusCircle size={16} /> Report Your First Issue
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.slice(0, 5).map((issue) => {
              const statusConfig = STATUS_CONFIG[issue.status];
              const urgencyConfig = URGENCY_CONFIG[issue.urgency];
              const categoryConfig = CATEGORY_CONFIG[issue.category];

              return (
                <div key={issue.id} className="p-4 rounded-xl flex items-center gap-4 transition-all hover:bg-white/[0.02]" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)' }}>
                  <div className="text-2xl">{categoryConfig?.icon || '📋'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{issue.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge text-[10px]" style={{ background: statusConfig.bgColor, color: statusConfig.color }}>
                        {statusConfig.label}
                      </span>
                      <span className="badge text-[10px]" style={{ background: urgencyConfig.bgColor, color: urgencyConfig.color }}>
                        {urgencyConfig.icon} {urgencyConfig.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <ThumbsUp size={12} /> {issue.upvoteCount}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Community Activity */}
      <div className="glass-card-static p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Community Activity</h2>
          <Link href="/citizen/map" className="text-sm text-[var(--color-accent-blue)] hover:underline flex items-center gap-1">
            View Map <MapPin size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allIssues.slice(0, 4).map((issue) => {
            const statusConfig = STATUS_CONFIG[issue.status];
            const categoryConfig = CATEGORY_CONFIG[issue.category];

            return (
              <div key={issue.id} className="p-3 rounded-xl" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-lg">{categoryConfig?.icon || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{issue.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                      <MapPin size={10} className="inline mr-1" />
                      {issue.location.address}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="badge text-[10px]" style={{ background: statusConfig.bgColor, color: statusConfig.color }}>
                        {statusConfig.label}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">by {issue.reporterName}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
