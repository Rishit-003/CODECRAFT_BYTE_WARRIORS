// ============================================
// CivicConnect — Notifications API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const notifsRef = collection(db, 'notifications');
    // Using simple query without orderby first to avoid needing composite index in Firebase
    const q = query(notifsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const notifications = querySnapshot.docs.map(doc => doc.data());
    
    // Sort descending by createdAt
    notifications.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    const notifRef = doc(db, 'notifications', id);
    await updateDoc(notifRef, { read: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
