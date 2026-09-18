// ============================================
// CivicConnect — Auth API: Register
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { UserRole } from '@/types';

// Helper to remove undefined fields because Firestore throws an error on undefined
function cleanData(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
}

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
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
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
      phone: phone || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let newUser: any;

    switch (role as UserRole) {
      case 'citizen':
        newUser = {
          ...baseUser,
          role: 'citizen',
          address: body.address || null,
          area: body.area || null,
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
          role: 'worker',
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
          role: 'admin',
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

    // Save to Firestore DB (cleaned of any stray undefineds)
    await setDoc(doc(usersRef, newUser.id), cleanData(newUser));

    return NextResponse.json({
      success: true,
      user: newUser, // Return full interface for frontend state
      message: 'Account created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
