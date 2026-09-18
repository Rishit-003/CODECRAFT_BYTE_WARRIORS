// ============================================
// CivicConnect — Upvote API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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

    const issueRef = doc(db, 'issues', id);
    const docSnap = await getDoc(issueRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const issue = docSnap.data();
    const hasUpvoted = issue.upvotes?.includes(userId) || false;
    let updatedUpvotes = issue.upvotes ? [...issue.upvotes] : [];

    if (hasUpvoted) {
      updatedUpvotes = updatedUpvotes.filter((u: string) => u !== userId);
    } else {
      updatedUpvotes.push(userId);
    }

    await updateDoc(issueRef, { 
      upvotes: updatedUpvotes,
      upvoteCount: updatedUpvotes.length
    });

    const updatedSnap = await getDoc(issueRef);

    return NextResponse.json({
      issue: updatedSnap.data(),
      upvoted: !hasUpvoted,
    });
  } catch (error) {
    console.error('Upvote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
