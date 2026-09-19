// ============================================
// CivicConnect — Issues API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department') || undefined;
    const departments = searchParams.get('departments') || undefined;
    const status = searchParams.get('status') || undefined;
    const reportedBy = searchParams.get('reportedBy') || undefined;

    const issuesRef = collection(db, 'issues');
    const constraints: any[] = [];
    
    if (department) constraints.push(where('department', '==', department));
    if (departments) constraints.push(where('department', 'in', departments.split(',')));
    if (status) constraints.push(where('status', '==', status));
    if (reportedBy) constraints.push(where('reportedBy', '==', reportedBy));
    
    const q = constraints.length > 0 ? query(issuesRef, ...constraints) : query(issuesRef);
    
    const querySnapshot = await getDocs(q);
    const issues = querySnapshot.docs.map(doc => doc.data());
    
    // Sort descending by createdAt manually for MVP to avoid needing a composite index immediately
    issues.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Fetch issues error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      department,
      location,
      urgency,
      reportedBy,
      reporterName,
      photos,
    } = body;

    if (!title || !description || !category || !location || !reportedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const id = `iss-${Date.now()}`;
    const newIssue = {
      id,
      title,
      description,
      category,
      department: department || 'other',
      status: 'reported',
      urgency: urgency || 'low',
      location,
      photos: photos || [],
      reportedBy,
      reporterName: reporterName || 'Anonymous',
      upvotes: [],
      upvoteCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const issuesRef = collection(db, 'issues');
    await setDoc(doc(issuesRef, id), newIssue);

    // Create a notification for the citizen
    const notifId = `notif-${Date.now()}`;
    await setDoc(doc(collection(db, 'notifications'), notifId), {
      id: notifId,
      userId: reportedBy,
      title: 'Issue Reported Successfully',
      message: `Your report "${title}" has been successfully submitted and is under review.`,
      type: 'status_update',
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(
      { issue: newIssue, message: 'Issue reported successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create issue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
