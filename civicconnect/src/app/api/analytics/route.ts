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
      pendingAssignment: issues.filter((i) => i.status === 'reported' || i.status === 'reopened').length,
      assigned: issues.filter((i) => i.status === 'assigned' || i.status === 'inspection').length,
      inProgress: issues.filter((i) => i.status === 'in_progress').length,
      resolutionReview: issues.filter((i) => i.status === 'admin_review' || i.status === 'resolved').length,
      closed: issues.filter((i) => i.status === 'closed').length,
      overdue: 0, // In a real system, calculate based on createdAt and SLA
      resolvedIssues: issues.filter((i) => i.status === 'closed' || i.status === 'resolved').length,
      pendingIssues: issues.filter((i) => ['reported', 'reopened', 'acknowledged'].includes(i.status)).length,
      inProgressIssues: issues.filter((i) => ['assigned', 'inspection', 'in_progress'].includes(i.status)).length,
      avgResolutionTime: 24, // Placeholder for demo
      issuesByDepartment: {} as Record<string, number>,
      issuesByStatus: { 
        reported: 0, acknowledged: 0, assigned: 0, inspection: 0, 
        in_progress: 0, resolved: 0, admin_review: 0, closed: 0,
        reopened: 0, rejected: 0, referred: 0
      } as Record<string, number>,
      issuesByUrgency: { low: 0, medium: 0, high: 0 } as Record<string, number>,
      issuesTrend: [] as { date: string; count: number; resolved: number }[],
      topZones: [] as { zone: string; count: number }[]
    };

    // Calculate aggregations locally for simplicity in this demo
    issues.forEach((issue) => {
      // By Department
      if (!analytics.issuesByDepartment[issue.department]) {
        analytics.issuesByDepartment[issue.department] = 0;
      }
      analytics.issuesByDepartment[issue.department]++;
      
      // By Status
      if (analytics.issuesByStatus[issue.status] !== undefined) {
        analytics.issuesByStatus[issue.status]++;
      } else {
        analytics.issuesByStatus[issue.status] = 1;
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
