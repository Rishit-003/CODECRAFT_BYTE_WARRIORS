'use client';

// ============================================
// CivicConnect — Admin Profile
// ============================================

import { useAuth } from '@/lib/auth-context';
import { AdminUser } from '@/types';
import { Shield, ShieldCheck, Mail, Hash, Layers } from 'lucide-react';
import { DEPARTMENTS } from '@/constants';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const admin = user as AdminUser | null;

  if (!admin) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* AVATAR & BASIC INFO */}
        <div className="glass-card-static p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--color-accent-blue)]/20 border-2 border-[var(--color-accent-blue)] flex items-center justify-center text-3xl font-bold text-[var(--color-accent-blue)] mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            {admin.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold">{admin.name}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 capitalize">{admin.role}</p>
          
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium capitalize">
            <Shield size={12} /> {admin.accessLevel?.replace('_', ' ') || 'Admin'}
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
                <Hash size={14} /> Admin ID
              </p>
              <p className="text-sm font-medium pl-5">{admin.adminId || 'N/A'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <ShieldCheck size={14} /> Access Level
              </p>
              <p className="text-sm font-medium pl-5 capitalize">{admin.accessLevel?.replace('_', ' ') || 'Admin'}</p>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mb-2">
              <Layers size={14} /> Department Oversight
            </p>
            <div className="pl-5 flex flex-wrap gap-2">
              {admin.departmentOversight && admin.departmentOversight.length > 0 ? (
                admin.departmentOversight.map(dept => (
                  <span key={dept} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-medium">
                    {DEPARTMENTS[dept]?.label || dept}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--color-text-muted)]">No specific departments assigned (Super Admin)</span>
              )}
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
              <p className="text-sm font-medium pl-5">{admin.email}</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
            <strong>Note:</strong> To modify your sensitive administrative information or contact details, please contact the system super-administrator.
          </div>
        </div>
      </div>
    </div>
  );
}
