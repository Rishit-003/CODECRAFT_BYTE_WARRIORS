// ============================================
// CivicConnect — Analytics API
// ============================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const issuesRef = collection(db, 'issues');
    const querySnapshot = await getDocs(issuesRef);
    const issues = querySnapshot.docs.map(doc => doc.data());
    
    // Default structure matching DashboardAnalytics interface
    const analytics = {
      totalIssues: issues.length,
      resolvedIssues: issues.filter((i: any) => i.status === 'resolved').length,
      pendingIssues: issues.filter((i: any) => i.status === 'reported').length,
      inProgressIssues: issues.filter((i: any) => i.status === 'in_progress').length,
      avgResolutionTime: 24, // Placeholder for demo
      issuesByDepartment: {} as Record<string, number>,
      issuesByStatus: { reported: 0, acknowledged: 0, assigned: 0, in_progress: 0, resolved: 0 } as Record<string, number>,
      issuesByUrgency: { low: 0, medium: 0, high: 0 } as Record<string, number>,
      issuesTrend: [] as any[],
      topZones: [] as any[]
    };

    // Calculate aggregations locally for simplicity in this demo
    issues.forEach((issue: any) => {
      // By Department
      if (!analytics.issuesByDepartment[issue.department]) {
        analytics.issuesByDepartment[issue.department] = 0;
      }
      analytics.issuesByDepartment[issue.department]++;
      
      // By Status
      if (analytics.issuesByStatus[issue.status] !== undefined) {
        analytics.issuesByStatus[issue.status]++;
      }
      
      // By Urgency
      if (analytics.issuesByUrgency[issue.urgency] !== undefined) {
        analytics.issuesByUrgency[issue.urgency]++;
      }
    });

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
