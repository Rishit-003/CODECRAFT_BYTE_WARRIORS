'use client';

// ============================================
// CivicConnect — Admin Reports
// ============================================

import { useEffect, useState } from 'react';
import { DashboardAnalytics, Issue, WorkerUser } from '@/types';
import { CATEGORY_CONFIG, STATUS_CONFIG, URGENCY_CONFIG } from '@/constants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { FileText, Clock, AlertTriangle, Users } from 'lucide-react';

export default function AdminReportsPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [workers, setWorkers] = useState<WorkerUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((r) => r.json()),
      fetch('/api/issues').then((r) => r.json()),
      fetch('/api/workers').then((r) => r.json()),
    ]).then(([analyticsData, issuesData, workersData]) => {
      setAnalytics(analyticsData.analytics);
      setIssues(issuesData.issues || []);
      setWorkers(workersData.workers || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return <div className="p-8 text-center text-[var(--color-text-muted)]">Loading Reports...</div>;
  }

  // --- Process Data for Charts ---

  // 1. Complaints by Category
  const categoryCount = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryData = Object.entries(categoryCount).map(([key, count]) => ({
    name: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG]?.label || key,
    count,
    fill: 'var(--color-accent-blue)'
  })).sort((a, b) => b.count - a.count);

  // 2. Complaints by Status
  const statusData = Object.entries(analytics.issuesByStatus)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => ({
      name: STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]?.label || key,
      value: count,
      fill: STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]?.color || '#94a3b8'
    }));

  // 3. Complaints by Priority
  const priorityData = Object.entries(analytics.issuesByUrgency).map(([key, count]) => ({
    name: URGENCY_CONFIG[key as keyof typeof URGENCY_CONFIG]?.label || key,
    value: count,
    fill: URGENCY_CONFIG[key as keyof typeof URGENCY_CONFIG]?.color || '#94a3b8'
  }));

  // 4. Inspector Workload
  const workloadData = workers.map(w => {
    const activeAssignments = issues.filter(i => i.assignedTo === w.id && !['closed', 'resolved'].includes(i.status)).length;
    return {
      name: w.name,
      completed: w.tasksCompleted,
      active: activeAssignments
    };
  }).sort((a, b) => (b.completed + b.active) - (a.completed + a.active)).slice(0, 10);

  // 5. Resolution Time (Simulated using createdAt vs resolvedAt if available)
  const resolvedIssues = issues.filter(i => ['closed', 'resolved'].includes(i.status) && i.resolvedAt);
  let avgResTime = 24; // Default fallback
  if (resolvedIssues.length > 0) {
    const totalMs = resolvedIssues.reduce((acc, issue) => {
      const start = new Date(issue.createdAt).getTime();
      const end = new Date(issue.resolvedAt!).getTime();
      return acc + (end - start);
    }, 0);
    avgResTime = Math.round(totalMs / resolvedIssues.length / (1000 * 60 * 60));
  }

  // Common tooltip style
  const tooltipStyle = {
    background: '#111640',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#fff'
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display">
          Analytics & <span className="gradient-text">Reports</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Detailed metrics and performance data across the city.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card-static p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Total Complaints</p>
            <p className="text-xl font-bold">{analytics.totalIssues}</p>
          </div>
        </div>
        <div className="glass-card-static p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Avg Resolution Time</p>
            <p className="text-xl font-bold">{avgResTime}h</p>
          </div>
        </div>
        <div className="glass-card-static p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Pending / Overdue</p>
            <p className="text-xl font-bold">{analytics.pendingIssues} / {analytics.overdue}</p>
          </div>
        </div>
        <div className="glass-card-static p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Active Inspectors</p>
            <p className="text-xl font-bold">{workers.filter(w => w.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Chart */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-secondary)]">Complaints by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} width={110} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="var(--color-accent-blue)" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Chart */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-secondary)]">Inspector Workload (Top 10)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} angle={-45} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                <Bar dataKey="active" name="Active Assignments" stackId="a" fill="var(--color-accent-amber)" radius={[0, 0, 0, 0]} barSize={30} />
                <Bar dataKey="completed" name="Completed Tasks" stackId="a" fill="var(--color-accent-green)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-secondary)]">Status Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusData} 
                  cx="50%" cy="50%" 
                  innerRadius={60} outerRadius={90} 
                  paddingAngle={2} dataKey="value"
                >
                  {statusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-secondary)]">Priority Breakdown</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={priorityData} 
                  cx="50%" cy="50%" 
                  outerRadius={90} 
                  paddingAngle={1} dataKey="value"
                >
                  {priorityData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
