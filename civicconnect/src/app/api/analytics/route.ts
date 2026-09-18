// ============================================
// CivicConnect — Analytics API
// ============================================

import { NextResponse } from 'next/server';
import db from '@/lib/mock-db';

export async function GET() {
  const analytics = db.getAnalytics();
  return NextResponse.json({ analytics });
}
