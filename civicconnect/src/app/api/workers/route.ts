// ============================================
// CivicConnect — Workers API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/mock-db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get('department') || undefined;
  const zone = searchParams.get('zone') || undefined;
  const isActive = searchParams.get('isActive');

  const workers = db.getWorkers({
    department,
    zone,
    isActive: isActive !== null ? isActive === 'true' : undefined,
  });

  return NextResponse.json({ workers });
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Worker ID required' }, { status: 400 });
    }
    const user = db.updateUser(id, updates);
    if (!user) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }
    return NextResponse.json({ worker: user });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
