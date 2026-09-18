'use client';

// ============================================
// CivicConnect — Citizen Dashboard Layout
// ============================================

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
