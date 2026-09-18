'use client';

// ============================================
// CivicConnect — Admin Complaints Management
// ============================================

import { useEffect, useState, useMemo } from 'react';
import { Issue, IssueStatus, UrgencyLevel, IssueCategory } from '@/types';
import { STATUS_CONFIG, URGENCY_CONFIG, CATEGORY_CONFIG } from '@/constants';
import { Search, Filter, MapPin, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<UrgencyLevel | 'all'>('all');
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  useEffect(() => {
    fetch('/api/issues')
      .then((r) => r.json())
      .then((data) => {
        setIssues(data.issues || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return issues.filter(issue => {
      // Search
      if (search) {
        const query = search.toLowerCase();
        const matchesId = issue.id.toLowerCase().includes(query);
        const matchesTitle = issue.title.toLowerCase().includes(query);
        const matchesLocation = issue.location.address.toLowerCase().includes(query);
        const matchesCitizen = issue.reporterName.toLowerCase().includes(query);
        if (!matchesId && !matchesTitle && !matchesLocation && !matchesCitizen) return false;
      }
      
      // Filters
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && issue.urgency !== priorityFilter) return false;
      
      if (assignedFilter === 'assigned' && !issue.assignedTo) return false;
      if (assignedFilter === 'unassigned' && issue.assignedTo) return false;

      return true;
    });
  }, [issues, search, statusFilter, categoryFilter, priorityFilter, assignedFilter]);

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
      <div>
        <h1 className="text-2xl font-bold font-display">
          All <span className="gradient-text">Complaints</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Comprehensive view of all civic complaints across the city.
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
            placeholder="Search by ID, Citizen, Title, Location..." 
            className="input-field pl-10 py-2 w-full text-sm" 
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[var(--color-text-muted)]" />
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)} 
              className="input-field py-2 text-sm min-w-[120px]"
            >
              <option value="all">All Statuses</option>
              {Object.keys(STATUS_CONFIG).map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s as IssueStatus].label}</option>
              ))}
            </select>
            
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value as any)} 
              className="input-field py-2 text-sm min-w-[140px]"
            >
              <option value="all">All Categories</option>
              {Object.keys(CATEGORY_CONFIG).map((c) => (
                <option key={c} value={c}>{CATEGORY_CONFIG[c as IssueCategory].label}</option>
              ))}
            </select>
            
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value as any)} 
              className="input-field py-2 text-sm min-w-[120px]"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            
            <select 
              value={assignedFilter} 
              onChange={(e) => setAssignedFilter(e.target.value as any)} 
              className="input-field py-2 text-sm min-w-[130px]"
            >
              <option value="all">Any Assignment</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-[var(--color-text-muted)]">
        <p>Showing {filtered.length} complaints</p>
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
                <th className="p-4 font-medium">Citizen</th>
                <th className="p-4 font-medium">Date Reported</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Inspector</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-[var(--color-text-muted)] text-sm">Loading complaints...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-[var(--color-text-muted)]">
                    <Filter size={32} className="mx-auto mb-3 opacity-20" />
                    <p>No complaints match your filters.</p>
                    <button 
                      onClick={() => {
                        setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); 
                        setPriorityFilter('all'); setAssignedFilter('all');
                      }}
                      className="mt-4 text-[var(--color-accent-blue)] hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map(issue => (
                  <tr key={issue.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-xs text-[var(--color-text-secondary)]">{issue.id.slice(0, 8)}</td>
                    <td className="p-4">
                      <p className="font-medium">{issue.title}</p>
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
                    <td className="p-4 text-xs">{issue.reporterName}</td>
                    <td className="p-4 text-xs text-[var(--color-text-secondary)]">
                      {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}
                            style={{ background: URGENCY_CONFIG[issue.urgency]?.bgColor, color: URGENCY_CONFIG[issue.urgency]?.color }}>
                        {issue.urgency}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide`}
                            style={{ background: STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.bgColor, color: STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.color }}>
                        {STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.label || issue.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[var(--color-text-secondary)]">
                      {issue.assignedWorkerName ? (
                         <span className="flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-amber)]" />
                           {issue.assignedWorkerName}
                         </span>
                      ) : (
                        <span className="text-[var(--color-text-muted)] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/issues/${issue.id}`} 
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--color-accent-blue)] transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
