'use client';

// ============================================
// CivicConnect — Inspector Complaints List
// ============================================

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Issue, IssueStatus } from '@/types';
import { STATUS_CONFIG, URGENCY_CONFIG, CATEGORY_CONFIG } from '@/constants';
import { Search, Filter, MapPin, Eye } from 'lucide-react';
import Link from 'next/link';

export default function WorkerIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    fetch(`/api/issues?assignedTo=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setIssues(data.issues || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    return issues.filter(issue => {
      // Search
      if (search) {
        const query = search.toLowerCase();
        const matchesId = issue.id.toLowerCase().includes(query);
        const matchesTitle = issue.title.toLowerCase().includes(query);
        const matchesLocation = issue.location.address.toLowerCase().includes(query);
        const matchesCategory = issue.category.toLowerCase().includes(query);
        if (!matchesId && !matchesTitle && !matchesLocation && !matchesCategory) return false;
      }
      
      // Filters
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending_inspection') {
          if (!['assigned', 'reopened'].includes(issue.status)) return false;
        } else if (issue.status !== statusFilter) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [issues, search, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display">
          My <span className="gradient-text">Complaints</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          View and manage all complaints assigned to you.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="glass-card-static p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by ID, Title, Location, Category..." 
            className="input-field pl-10 py-2 w-full text-sm" 
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--color-text-muted)]" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="input-field py-2 text-sm min-w-[150px]"
          >
            <option value="all">All Statuses</option>
            <option value="pending_inspection">Pending Inspection</option>
            <option value="inspection">Inspection</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="admin_review">Admin Review</option>
            <option value="reopened">Reopened</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-[var(--color-text-muted)]">
        <p>Showing {filtered.length} assigned complaints</p>
      </div>

      {/* Table */}
      <div className="glass-card-static flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[var(--color-text-muted)] border-b border-[var(--color-border-glass)] sticky top-0 bg-[rgba(20,24,54,0.95)] backdrop-blur-md z-10">
              <tr>
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Category & Title</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Assigned Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-[var(--color-text-muted)] text-sm">Loading complaints...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[var(--color-text-muted)]">
                    <Filter size={32} className="mx-auto mb-3 opacity-20" />
                    <p>No complaints match your filters.</p>
                    <button 
                      onClick={() => { setSearch(''); setStatusFilter('all'); }}
                      className="mt-4 text-[var(--color-accent-blue)] hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map(issue => {
                  const urgency = URGENCY_CONFIG[issue.urgency];
                  const status = STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG];
                  
                  return (
                    <tr key={issue.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-xs text-[var(--color-text-secondary)]">{issue.id.slice(0, 8)}</td>
                      <td className="p-4 max-w-[250px] truncate">
                        <p className="font-medium truncate">{issue.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
                          {CATEGORY_CONFIG[issue.category]?.icon} {CATEGORY_CONFIG[issue.category]?.label}
                        </p>
                      </td>
                      <td className="p-4 max-w-[150px] truncate">
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]" title={issue.location.address}>
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate">{issue.location.address}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}
                              style={{ background: urgency?.bgColor, color: urgency?.color }}>
                          {issue.urgency}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-[var(--color-text-secondary)]">
                        {issue.assignedAt ? new Date(issue.assignedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short'
                        }) : 'Unknown'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide`}
                              style={{ background: status?.bgColor, color: status?.color }}>
                          {status?.label || issue.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/worker/issues/${issue.id}`} 
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--color-accent-blue)] transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
