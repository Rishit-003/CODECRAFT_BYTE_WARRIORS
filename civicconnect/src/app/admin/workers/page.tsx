'use client';

// ============================================
// CivicConnect — Admin Worker Management
// ============================================

import { useEffect, useState } from 'react';
import { WorkerUser, Department } from '@/types';
import { DEPARTMENTS } from '@/constants';
import {
  Search, Filter, CheckCircle2, XCircle,
  Clock, Award, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<WorkerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<Department | 'all'>('all');

  useEffect(() => {
    fetch('/api/workers')
      .then((r) => r.json())
      .then((data) => { setWorkers(data.workers || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleToggleActive = async (worker: WorkerUser) => {
    try {
      const res = await fetch('/api/workers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: worker.id, isActive: !worker.isActive }),
      });
      if (res.ok) {
        setWorkers((prev) => prev.map((w) => w.id === worker.id ? { ...w, isActive: !w.isActive } : w));
        toast.success(`${worker.name} is now ${!worker.isActive ? 'active' : 'inactive'}`);
      }
    } catch { toast.error('Failed to update worker status'); }
  };

  let filtered = workers;
  if (deptFilter !== 'all') filtered = filtered.filter((w) => w.department === deptFilter);
  if (search) filtered = filtered.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()) || w.employeeId.toLowerCase().includes(search.toLowerCase()));

  const activeCount = workers.filter((w) => w.isActive).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Worker <span className="gradient-text">Management</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {workers.length} total workers • {activeCount} active
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {Object.entries(DEPARTMENTS).map(([key, dept]) => {
          const count = workers.filter((w) => w.department === key).length;
          const active = workers.filter((w) => w.department === key && w.isActive).length;
          return (
            <div key={key} className="glass-card-static p-4 cursor-pointer transition-all hover:bg-white/[0.02]" onClick={() => setDeptFilter(key as Department)}>
              <div className="flex items-center gap-2 mb-2">
                <span>{dept.icon}</span>
                <span className="text-sm font-medium">{dept.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold" style={{ color: dept.color, fontFamily: 'var(--font-display)' }}>{count}</span>
                <span className="badge text-[10px]" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-accent-green)' }}>
                  {active} active
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID..." className="input-field pl-10 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--color-text-muted)]" />
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value as Department | 'all')} className="input-field py-2 text-sm min-w-[150px]">
            <option value="all">All Departments</option>
            {Object.entries(DEPARTMENTS).map(([key, dept]) => <option key={key} value={key}>{dept.icon} {dept.label}</option>)}
          </select>
        </div>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-tertiary)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((worker) => {
            const dept = DEPARTMENTS[worker.department];
            return (
              <div key={worker.id} className="glass-card-static p-5 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: `${dept?.color}20`, color: dept?.color }}>
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{worker.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{worker.employeeId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(worker)}
                    className="p-1"
                    title={worker.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {worker.isActive ? (
                      <CheckCircle2 size={20} className="text-[var(--color-accent-green)]" />
                    ) : (
                      <XCircle size={20} className="text-[var(--color-accent-red)]" />
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="badge text-[10px]" style={{ background: `${dept?.color}20`, color: dept?.color }}>
                      {dept?.icon} {dept?.label}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">{worker.designation}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">📍 {worker.assignedZone}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border-glass)' }}>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: 'var(--color-accent-blue)', fontFamily: 'var(--font-display)' }}>{worker.tasksCompleted}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: 'var(--color-accent-amber)', fontFamily: 'var(--font-display)' }}>{worker.avgResolutionTime}h</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Avg. Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: worker.isActive ? 'var(--color-accent-green)' : 'var(--color-accent-red)', fontFamily: 'var(--font-display)' }}>
                      {worker.isActive ? '🟢' : '🔴'}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{worker.isActive ? 'Active' : 'Inactive'}</p>
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
