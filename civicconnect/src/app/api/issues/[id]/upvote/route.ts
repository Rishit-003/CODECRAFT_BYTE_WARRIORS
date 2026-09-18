// ============================================
// CivicConnect — Upvote API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/mock-db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const issue = db.toggleUpvote(id, userId);
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({
      issue,
      upvoted: issue.upvotes.includes(userId),
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
