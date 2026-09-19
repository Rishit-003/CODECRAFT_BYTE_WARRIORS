'use client';

// ============================================
// CivicConnect — Admin Dashboard
// ============================================

import { useEffect, useState } from 'react';
import { CATEGORY_CONFIG, STATUS_CONFIG, URGENCY_CONFIG } from '@/constants';
import {
  FileText, Clock, CheckCircle2, AlertTriangle, Users, BarChart3,
  Search, ShieldAlert, ArrowRight, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import Link from 'next/link';
import { DashboardAnalytics, Issue } from '@/types';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [actionIssues, setActionIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, issuesRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/issues')
        ]);
        
        const analyticsData = await analyticsRes.json();
        const issuesData = await issuesRes.json();
        
        setAnalytics(analyticsData.analytics);
        
        const allIssues: Issue[] = issuesData.issues || [];
        setRecentIssues(allIssues.slice(0, 5));
        
        // Complaints requiring action
        setActionIssues(allIssues.filter(i => 
          ['reported', 'reopened', 'admin_review'].includes(i.status) || 
          (i.urgency === 'high' && i.status !== 'closed')
        ).slice(0, 5));
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-tertiary)' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-tertiary)' }} />
          ))}
        </div>
      </div>
    );
  }

  // Charts data
  const statusChartData = Object.entries(analytics.issuesByStatus)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => ({
      name: STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]?.label || key,
      count,
      fill: STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]?.color || '#94a3b8',
    }));

  // Group by category instead of department for the request
  const categoryCount = recentIssues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryChartData = Object.entries(categoryCount).map(([key, count]) => ({
    name: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG]?.label || key,
    count,
    fill: 'var(--color-accent-blue)',
  }));

  const SUMMARY_CARDS = [
    { label: 'Total', value: analytics.totalIssues, icon: <FileText size={20} />, color: '#3b82f6' },
    { label: 'Pending Assign', value: analytics.pendingAssignment, icon: <AlertTriangle size={20} />, color: '#f59e0b' },
    { label: 'Assigned', value: analytics.assigned, icon: <Users size={20} />, color: '#8b5cf6' },
    { label: 'In Progress', value: analytics.inProgress, icon: <Activity size={20} />, color: '#0ea5e9' },
    { label: 'Review', value: analytics.resolutionReview, icon: <Search size={20} />, color: '#ec4899' },
    { label: 'Closed', value: analytics.closed, icon: <CheckCircle2 size={20} />, color: '#10b981' },
    { label: 'Overdue', value: analytics.overdue, icon: <Clock size={20} />, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* 1. SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {SUMMARY_CARDS.map((card) => (
          <div key={card.label} className="glass-card-static p-4 flex flex-col justify-between h-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--color-text-secondary)] leading-tight">{card.label}</span>
              <div className="opacity-80" style={{ color: card.color }}>{card.icon}</div>
            </div>
            <p className="text-3xl font-bold mt-2" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* 2. COMPLAINT OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
            <BarChart3 size={16} className="text-[var(--color-accent-blue)]" />
            Complaints by Status
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusChartData} 
                  cx="50%" cy="50%" 
                  innerRadius={60} outerRadius={90} 
                  paddingAngle={2} dataKey="count"
                >
                  {statusChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111640', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
            <BarChart3 size={16} className="text-[var(--color-accent-purple)]" />
            Complaints by Category (Sample)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} width={120} />
                <Tooltip contentStyle={{ background: '#111640', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="var(--color-accent-blue)" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. LISTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Recent Complaints */}
        <div className="lg:col-span-2 glass-card-static p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText size={16} className="text-[var(--color-text-muted)]" />
              Recent Complaints
            </h3>
            <Link href="/admin/issues" className="text-xs text-[var(--color-accent-blue)] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[var(--color-text-muted)] border-b border-[var(--color-border-glass)]">
                <tr>
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-glass)]">
                {recentIssues.map(issue => (
                  <tr key={issue.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-xs">{issue.id.slice(0,8)}</td>
                    <td className="py-3 flex items-center gap-2">
                      <span>{CATEGORY_CONFIG[issue.category]?.icon}</span>
                      <span className="truncate max-w-[120px]">{CATEGORY_CONFIG[issue.category]?.label}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}
                            style={{ background: URGENCY_CONFIG[issue.urgency]?.bgColor, color: URGENCY_CONFIG[issue.urgency]?.color }}>
                        {issue.urgency}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold`}
                            style={{ background: STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.bgColor, color: STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.color }}>
                        {STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.label || issue.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/admin/issues/${issue.id}`} className="text-[var(--color-accent-blue)] text-xs font-medium hover:underline">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentIssues.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-[var(--color-text-muted)]">No recent complaints.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Complaints Requiring Action */}
        <div className="glass-card-static p-6 flex flex-col">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <ShieldAlert size={16} className="text-[var(--color-accent-amber)]" />
            Requiring Action
          </h3>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {actionIssues.map(issue => (
              <Link key={issue.id} href={`/admin/issues/${issue.id}`} className="block p-3 rounded-xl border border-[var(--color-border-glass)] hover:bg-white/5 transition-colors group">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-white group-hover:text-[var(--color-accent-blue)] transition-colors">
                    {CATEGORY_CONFIG[issue.category]?.label || issue.category}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{issue.id.slice(0,8)}</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1 mb-2">
                  {issue.title}
                </p>
                <div className="flex gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
                        style={{ background: STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.bgColor, color: STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.color }}>
                    {STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.label || issue.status}
                  </span>
                  {issue.urgency === 'high' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-red-500/20 text-red-400">
                      High Priority
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {actionIssues.length === 0 && (
              <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
                <CheckCircle2 size={24} className="mx-auto mb-2 opacity-30" />
                No pending actions!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
