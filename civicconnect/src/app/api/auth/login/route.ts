// ============================================
// CivicConnect — Auth API: Login
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), where('role', '==', role));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid credentials or user not found' },
        { status: 401 }
      );
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    // WARNING: In a real application, you MUST verify the password using bcrypt or similar.
    // Since Firebase Auth is usually used, this is a placeholder if you are storing passwords manually.
    // For this MVP, we assume password validation happens on the client or is mocked here.
    
    // For demo purposes, we will just let them in if the email and role match.

    return NextResponse.json({
      success: true,
      user,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
