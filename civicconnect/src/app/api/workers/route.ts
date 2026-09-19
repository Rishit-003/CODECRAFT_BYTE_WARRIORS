// ============================================
// CivicConnect — Workers API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department') || undefined;
    const departments = searchParams.get('departments') || undefined;
    const zone = searchParams.get('zone') || undefined;
    const isActive = searchParams.get('isActive');

    const usersRef = collection(db, 'users');
    const constraints: any[] = [where('role', '==', 'worker')];
    
    if (department) constraints.push(where('department', '==', department));
    if (departments) constraints.push(where('department', 'in', departments.split(',')));
    if (zone) constraints.push(where('assignedZone', '==', zone));
    if (isActive !== null) constraints.push(where('isActive', '==', isActive === 'true'));

    const q = query(usersRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const workers = querySnapshot.docs.map(doc => doc.data());
    
    workers.sort((a: any, b: any) => a.name.localeCompare(b.name));

    return NextResponse.json({ workers });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Worker ID required' }, { status: 400 });
    }

    const workerRef = doc(db, 'users', id);
    await updateDoc(workerRef, updates);
    
    const updatedSnap = await getDoc(workerRef);
    
    if (!updatedSnap.exists()) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }
    
    return NextResponse.json({ worker: updatedSnap.data() });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
