// ============================================
// CivicConnect — Auth API: Login
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/mock-db';

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = db.getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please sign up first.' },
        { status: 404 }
      );
    }

    if (user.role !== role) {
      return NextResponse.json(
        { error: `This email is registered as a ${user.role}, not a ${role}` },
        { status: 403 }
      );
    }

    // In production, verify password hash here
    // For demo, any password works

    return NextResponse.json({
      success: true,
      user,
      message: 'Login successful',
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
