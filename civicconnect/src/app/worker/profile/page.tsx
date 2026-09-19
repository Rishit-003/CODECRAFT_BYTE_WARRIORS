'use client';

// ============================================
// CivicConnect — Worker Profile
// ============================================

import { useAuth } from '@/lib/auth-context';
import { WorkerUser } from '@/types';
import { User, Building, MapPin, Phone, Mail, Hash, ShieldCheck, Activity } from 'lucide-react';
import { DEPARTMENTS } from '@/constants';

export default function WorkerProfilePage() {
  const { user } = useAuth();
  const worker = user as WorkerUser | null;

  if (!worker) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* AVATAR & BASIC INFO */}
        <div className="glass-card-static p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--color-accent-amber)]/20 border-2 border-[var(--color-accent-amber)] flex items-center justify-center text-3xl font-bold text-[var(--color-accent-amber)] mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            {worker.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold">{worker.name}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{worker.designation}</p>
          
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Activity size={12} /> {worker.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* DETAILS */}
        <div className="md:col-span-2 glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-6 uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border-glass)] pb-2">
            Professional Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <Hash size={14} /> Employee ID
              </p>
              <p className="text-sm font-medium pl-5">{worker.employeeId}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <Building size={14} /> Department
              </p>
              <p className="text-sm font-medium pl-5">
                {DEPARTMENTS[worker.department]?.label || worker.department}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <MapPin size={14} /> Assigned Zone
              </p>
              <p className="text-sm font-medium pl-5">{worker.assignedZone}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <ShieldCheck size={14} /> Role
              </p>
              <p className="text-sm font-medium pl-5 capitalize">{worker.role}</p>
            </div>
          </div>

          <h3 className="text-sm font-semibold mt-8 mb-6 uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border-glass)] pb-2">
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <Mail size={14} /> Email Address
              </p>
              <p className="text-sm font-medium pl-5">{worker.email}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <Phone size={14} /> Phone Number
              </p>
              <p className="text-sm font-medium pl-5">{worker.phone || worker.contactNumber || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            <strong>Note:</strong> To modify your sensitive administrative information or contact details, please contact your department administrator.
          </div>
        </div>
      </div>
    </div>
  );
}
