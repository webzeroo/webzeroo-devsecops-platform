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

// POST /api/submit - Submit assessment answers (learner only)
export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'learner') return NextResponse.json({ error: 'Only learners can submit assessments' }, { status: 403 });

  try {
    const body = await request.json();
    const { assessmentId, answers } = body;

    if (!assessmentId || !answers) {
      return NextResponse.json({ error: 'assessmentId and answers are required' }, { status: 400 });
    }

    // Fetch assessment
    const assessmentDoc = await adminDb.collection('assessments').doc(assessmentId).get();
    if (!assessmentDoc.exists) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const assessment = assessmentDoc.data();

    // Auto-evaluate
    let score = 0;
    assessment.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        score += q.marks || 1;
      }
    });

    const totalMarks = assessment.totalMarks || assessment.questions.reduce((s, q) => s + (q.marks || 1), 0);
    const passed = score >= (assessment.passingMarks || Math.ceil(totalMarks * 0.5));

    // Store result
    const resultData = {
      assessmentId,
      learnerId: user.uid,
      learnerEmail: user.email,
      score,
      totalMarks,
      passed,
      answers,
      submittedAt: new Date(),
    };

    const docRef = await adminDb.collection('results').add(resultData);

    return NextResponse.json({
      success: true,
      resultId: docRef.id,
      score,
      totalMarks,
      passed,
      percentage: Math.round((score / totalMarks) * 100),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit assessment', details: error.message }, { status: 500 });
  }
}
