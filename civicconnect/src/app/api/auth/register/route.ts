// ============================================
// CivicConnect — Auth API: Register
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/mock-db';
import { User, UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, name, email, phone } = body;

    if (!role || !name || !email) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const baseId = `${role}-${Date.now()}`;
    const baseUser = {
      id: baseId,
      firebaseUid: `fb-${baseId}`,
      name,
      email,
      phone: phone || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let newUser: User;

    switch (role as UserRole) {
      case 'citizen':
        newUser = {
          ...baseUser,
          role: 'citizen' as const,
          address: body.address || undefined,
          area: body.area || undefined,
        };
        break;

      case 'worker':
        if (!body.department || !body.designation || !body.employeeId || !body.assignedZone) {
          return NextResponse.json(
            { error: 'Department, designation, employee ID, and zone are required for workers' },
            { status: 400 }
          );
        }
        newUser = {
          ...baseUser,
          role: 'worker' as const,
          department: body.department,
          designation: body.designation,
          employeeId: body.employeeId,
          assignedZone: body.assignedZone,
          contactNumber: body.contactNumber || phone || '',
          isActive: true,
          tasksCompleted: 0,
          avgResolutionTime: 0,
        };
        break;

      case 'admin':
        if (!body.adminId) {
          return NextResponse.json(
            { error: 'Admin ID is required for administrators' },
            { status: 400 }
          );
        }
        newUser = {
          ...baseUser,
          role: 'admin' as const,
          adminId: body.adminId,
          departmentOversight: body.departmentOversight || [],
          accessLevel: body.accessLevel || 'department_admin',
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        );
    }

    db.addUser(newUser);

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Account created successfully',
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
