// ============================================
// CivicConnect — Single Issue API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/mock-db';

// GET /api/issues/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const issue = db.getIssueById(id);
  if (!issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  }
  return NextResponse.json({ issue });
}

// PATCH /api/issues/[id] — Update issue
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const issue = db.updateIssue(id, updates);
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // If status changed, create notification for reporter
    if (updates.status) {
      db.addNotification({
        userId: issue.reportedBy,
        title: 'Issue Update',
        message: `Your report "${issue.title}" is now ${updates.status.replace('_', ' ')}`,
        type: 'status_update',
        issueId: issue.id,
        read: false,
      });
    }

    // If assigned, create notification for worker
    if (updates.assignedTo) {
      db.addNotification({
        userId: updates.assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned: "${issue.title}"`,
        type: 'new_assignment',
        issueId: issue.id,
        read: false,
      });
    }

    return NextResponse.json({ issue });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/issues/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = db.deleteIssue(id);
  if (!success) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
