// ============================================
// CivicConnect — Issue Details API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, setDoc, collection } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const issueRef = doc(db, 'issues', id);
    const docSnap = await getDoc(issueRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ issue: docSnap.data() });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const issueRef = doc(db, 'issues', id);
    const docSnap = await getDoc(issueRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }
    
    const issue = docSnap.data();

    await updateDoc(issueRef, { ...body, updatedAt: new Date().toISOString() });
    
    // If status changed, create notification for reporter
    if (body.status) {
      const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await setDoc(doc(collection(db, 'notifications'), notifId), {
        id: notifId,
        userId: issue.reportedBy,
        title: 'Issue Update',
        message: `Your report "${issue.title}" is now ${body.status.replace('_', ' ')}`,
        type: 'status_update',
        link: `/citizen/track`,
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    // If assigned, create notification for worker
    if (body.assignedTo) {
      const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await setDoc(doc(collection(db, 'notifications'), notifId), {
        id: notifId,
        userId: body.assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned: "${issue.title}"`,
        type: 'new_assignment',
        link: `/worker`,
        createdAt: new Date().toISOString(),
        read: false
      });
    }
    
    const updatedSnap = await getDoc(issueRef);
    return NextResponse.json({ issue: updatedSnap.data() });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const issueRef = doc(db, 'issues', id);
    const docSnap = await getDoc(issueRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    await deleteDoc(issueRef);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
