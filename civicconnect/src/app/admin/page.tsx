'use client';

// ============================================
// CivicConnect — Admin Dashboard
// ============================================

import { useEffect, useState } from 'react';
import { DEPARTMENTS, STATUS_CONFIG, URGENCY_CONFIG } from '@/constants';
import {
  BarChart3, TrendingUp, Clock, CheckCircle2,
  AlertTriangle, Users, FileText,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, Area, AreaChart,
} from 'recharts';
import Link from 'next/link';

interface Analytics {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  avgResolutionTime: number;
  issuesByDepartment: Record<string, number>;
  issuesByStatus: Record<string, number>;
  issuesByUrgency: Record<string, number>;
  issuesTrend: { date: string; count: number; resolved: number }[];
  topZones: { zone: string; count: number }[];
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((data) => { setAnalytics(data.analytics); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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

  // Prepare chart data
  const deptChartData = Object.entries(analytics.issuesByDepartment).map(([key, count]) => ({
    name: DEPARTMENTS[key as keyof typeof DEPARTMENTS]?.label || key,
    count,
    fill: DEPARTMENTS[key as keyof typeof DEPARTMENTS]?.color || '#3b82f6',
  }));

  const statusChartData = Object.entries(analytics.issuesByStatus).map(([key, count]) => ({
    name: STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]?.label || key,
    count,
    fill: STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]?.color || '#94a3b8',
  }));

  const urgencyChartData = Object.entries(analytics.issuesByUrgency).map(([key, count]) => ({
    name: URGENCY_CONFIG[key as keyof typeof URGENCY_CONFIG]?.label || key,
    value: count,
    fill: URGENCY_CONFIG[key as keyof typeof URGENCY_CONFIG]?.color || '#94a3b8',
  }));

  const trendData = analytics.issuesTrend.map((t) => ({
    ...t,
    date: new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Admin <span className="gradient-text">Overview</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          City-wide issue tracking and performance analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          {
            label: 'Total Issues',
            value: analytics.totalIssues,
            icon: <FileText size={22} />,
            color: 'var(--color-accent-blue)',
            bg: 'rgba(59,130,246,0.15)',
          },
          {
            label: 'Resolved',
            value: analytics.resolvedIssues,
            icon: <CheckCircle2 size={22} />,
            color: 'var(--color-accent-green)',
            bg: 'rgba(16,185,129,0.15)',
          },
          {
            label: 'Pending',
            value: analytics.pendingIssues,
            icon: <AlertTriangle size={22} />,
            color: 'var(--color-accent-amber)',
            bg: 'rgba(245,158,11,0.15)',
          },
          {
            label: 'Avg. Resolution',
            value: `${analytics.avgResolutionTime}h`,
            icon: <Clock size={22} />,
            color: 'var(--color-accent-purple)',
            bg: 'rgba(139,92,246,0.15)',
          },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card-static p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="stat-card-icon" style={{ background: kpi.bg, color: kpi.color }}>
                {kpi.icon}
              </div>
              <TrendingUp size={14} className="text-[var(--color-accent-green)]" />
            </div>
            <p className="stat-card-value" style={{ color: kpi.color, fontFamily: 'var(--font-display)' }}>{kpi.value}</p>
            <p className="stat-card-label">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues Trend */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-[var(--color-accent-blue)]" />
            Issues Trend (7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#111640', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorCount)" strokeWidth={2} name="Reported" />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#colorResolved)" strokeWidth={2} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Issues by Department */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Users size={16} className="text-[var(--color-accent-purple)]" />
            Issues by Department
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip
                contentStyle={{ background: '#111640', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {deptChartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgency Distribution */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-4">Urgency Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={urgencyChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {urgencyChartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#111640', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {urgencyChartData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                <span className="text-[var(--color-text-muted)]">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {statusChartData.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[var(--color-text-secondary)]">{item.name}</span>
                  <span className="font-semibold" style={{ color: item.fill }}>{item.count}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(item.count / analytics.totalIssues) * 100}%`, background: item.fill }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Zones */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-4">Top Issue Zones</h3>
          <div className="space-y-3">
            {analytics.topZones.map((zone, idx) => (
              <div key={zone.zone} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: idx === 0 ? 'var(--color-accent-amber)' : idx === 1 ? 'var(--color-text-secondary)' : 'var(--color-bg-primary)', color: idx < 2 ? 'black' : 'var(--color-text-muted)' }}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{zone.zone}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--color-accent-blue)' }}>{zone.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/issues" className="glass-card p-5 flex items-center gap-4">
          <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--color-accent-blue)' }}>
            <FileText size={22} />
          </div>
          <div>
            <p className="font-medium">Manage Issues</p>
            <p className="text-xs text-[var(--color-text-muted)]">View, assign, and track all issues</p>
          </div>
        </Link>
        <Link href="/admin/workers" className="glass-card p-5 flex items-center gap-4">
          <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-accent-amber)' }}>
            <Users size={22} />
          </div>
          <div>
            <p className="font-medium">Manage Workers</p>
            <p className="text-xs text-[var(--color-text-muted)]">View performance and manage staff</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
