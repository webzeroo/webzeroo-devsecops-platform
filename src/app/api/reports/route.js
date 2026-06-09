import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

async function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    return { uid: decoded.uid, ...userDoc.data() };
  } catch { return null; }
}

// GET /api/reports - Get report data (admin only)
export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const [usersSnap, coursesSnap, lessonsSnap, assessmentsSnap, resultsSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('courses').get(),
      adminDb.collection('lessons').get(),
      adminDb.collection('assessments').get(),
      adminDb.collection('results').get(),
    ]);

    const results = resultsSnap.docs.map(d => d.data());
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    const avgScore = results.length > 0
      ? Math.round(results.reduce((s, r) => s + ((r.score / r.totalMarks) * 100), 0) / results.length)
      : 0;

    return NextResponse.json({
      success: true,
      report: {
        totalUsers: usersSnap.size,
        totalCourses: coursesSnap.size,
        totalLessons: lessonsSnap.size,
        totalAssessments: assessmentsSnap.size,
        totalResults: resultsSnap.size,
        passed,
        failed,
        averageScore: avgScore,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report', details: error.message }, { status: 500 });
  }
}
