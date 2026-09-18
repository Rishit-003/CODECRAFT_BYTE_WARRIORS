'use client';

// ============================================
// CivicConnect — Citizen Profile
// ============================================

import { useAuth } from '@/lib/auth-context';
import { CitizenUser } from '@/types';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { useState } from 'react';

export default function CitizenProfilePage() {
  const { user } = useAuth();
  
  if (!user || user.role !== 'citizen') {
    return null;
  }

  const citizen = user as CitizenUser;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>My Profile</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Role */}
        <div className="glass-card-static rounded-2xl p-6 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-lg" 
               style={{ background: 'var(--color-accent-blue)', color: 'white' }}>
            {citizen.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold">{citizen.name}</h2>
          <div className="flex items-center gap-1 text-sm text-[var(--color-accent-blue)] mt-1 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            <Shield size={14} />
            Verified Citizen
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 glass-card-static rounded-2xl p-6 space-y-6">
          <h3 className="font-semibold text-lg border-b border-[var(--color-border-glass)] pb-2">Personal Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <User size={14} /> Full Name
              </label>
              <div className="p-3 bg-black/20 rounded-xl border border-[var(--color-border-glass)] text-sm">
                {citizen.name}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <Mail size={14} /> Email Address
              </label>
              <div className="p-3 bg-black/20 rounded-xl border border-[var(--color-border-glass)] text-sm">
                {citizen.email}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <Phone size={14} /> Phone Number
              </label>
              <div className="p-3 bg-black/20 rounded-xl border border-[var(--color-border-glass)] text-sm">
                {citizen.phone || <span className="text-[var(--color-text-muted)] italic">Not provided</span>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <MapPin size={14} /> Address/Area
              </label>
              <div className="p-3 bg-black/20 rounded-xl border border-[var(--color-border-glass)] text-sm">
                {citizen.address || citizen.area || <span className="text-[var(--color-text-muted)] italic">Not provided</span>}
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-[var(--color-border-glass)]">
            <p className="text-xs text-[var(--color-text-muted)]">
              Account created on {new Date(citizen.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
