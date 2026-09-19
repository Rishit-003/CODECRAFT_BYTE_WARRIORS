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

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--color-bg-tertiary)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card-static p-12 text-center text-[var(--color-text-muted)] flex flex-col items-center justify-center flex-1">
          <Filter size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium text-white mb-2">No complaints found</p>
          <p>No complaints match your current filters.</p>
          <button 
            onClick={() => {
              setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); 
              setPriorityFilter('all'); setAssignedFilter('all');
            }}
            className="mt-6 btn-primary py-2 px-6"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
          {filtered.map(issue => {
            const urgency = URGENCY_CONFIG[issue.urgency];
            const status = STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG];
            const category = CATEGORY_CONFIG[issue.category];

            return (
              <div key={issue.id} className="glass-card-static rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-[var(--color-border-glass)] group">
                <div className="p-5 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="badge font-bold tracking-wider" style={{ background: status?.bgColor, color: status?.color }}>
                      {status?.label || issue.status}
                    </span>
                    <span className="text-xs font-mono text-[var(--color-text-muted)]">#{issue.id.slice(0, 8)}</span>
                  </div>

                  {/* Title & Category */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-2xl mt-1 shrink-0">{category?.icon || '📋'}</div>
                    <div>
                      <h3 className="font-bold text-base leading-tight group-hover:text-[var(--color-accent-blue)] transition-colors line-clamp-2">{issue.title}</h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">{category?.label}</p>
                    </div>
                  </div>

                  {/* Meta Details */}
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--color-accent-blue)]" />
                      <span className="line-clamp-2">{issue.location.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-text-muted)]">By:</span>
                      <span className="font-medium text-white">{issue.reporterName}</span>
                      <span className="text-[var(--color-text-muted)] px-1">•</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-4 border-t border-[var(--color-border-glass)] flex items-center justify-between mt-auto">
                    <div className="flex flex-col gap-1">
                      <span className="badge text-[10px]" style={{ background: urgency?.bgColor, color: urgency?.color }}>
                        {urgency?.icon} {urgency?.label} Priority
                      </span>
                      {issue.assignedWorkerName ? (
                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-amber)]" />
                          {issue.assignedWorkerName}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)] italic mt-1">Unassigned</span>
                      )}
                    </div>
                    <Link 
                      href={`/admin/issues/${issue.id}`} 
                      className="inline-flex items-center justify-center p-3 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-accent-blue)] text-[var(--color-text-secondary)] hover:text-white transition-all group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
