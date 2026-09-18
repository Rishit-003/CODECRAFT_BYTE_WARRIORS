// ============================================
// CivicConnect — Issues API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/mock-db';
import { CATEGORY_CONFIG } from '@/constants';
import { IssueCategory } from '@/types';

// GET /api/issues — List issues with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get('department') || undefined;
  const status = searchParams.get('status') || undefined;
  const urgency = searchParams.get('urgency') || undefined;
  const reportedBy = searchParams.get('reportedBy') || undefined;
  const assignedTo = searchParams.get('assignedTo') || undefined;

  const issues = db.getIssues({ department, status, urgency, reportedBy, assignedTo });
  return NextResponse.json({ issues });
}

// POST /api/issues — Create new issue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, urgency, location, photos, reportedBy, reporterName } = body;

    if (!title || !description || !category || !urgency || !location || !reportedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Auto-map category to department
    const categoryConfig = CATEGORY_CONFIG[category as IssueCategory];
    if (!categoryConfig) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const issue = db.addIssue({
      title,
      description,
      category,
      department: categoryConfig.department,
      status: 'reported',
      urgency,
      location,
      photos: photos || [],
      reportedBy,
      reporterName: reporterName || 'Anonymous',
    });

    return NextResponse.json({ issue }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
