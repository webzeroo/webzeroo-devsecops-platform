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

// GET /api/assessments - List assessments
export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let ref = adminDb.collection('assessments');
    if (user.role === 'learner') {
      ref = ref.where('status', '==', 'published');
    }

    const snapshot = await ref.get();
    const assessments = snapshot.docs.map(doc => {
      const data = doc.data();
      // Don't send correct answers to learners
      if (user.role === 'learner' && data.questions) {
        data.questions = data.questions.map(q => ({
          question: q.question,
          options: q.options,
          marks: q.marks,
        }));
      }
      return { id: doc.id, ...data };
    });

    return NextResponse.json({ success: true, assessments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assessments', details: error.message }, { status: 500 });
  }
}

// POST /api/assessments - Create assessment (admin only)
export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await request.json();
    const { courseId, title, description, passingMarks, questions, status } = body;

    if (!courseId || !title || !questions?.length) {
      return NextResponse.json({ error: 'courseId, title, and questions are required' }, { status: 400 });
    }

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const assessmentData = {
      courseId, title,
      description: description || '',
      passingMarks: passingMarks || Math.ceil(totalMarks * 0.5),
      totalMarks,
      status: status || 'draft',
      questions,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('assessments').add(assessmentData);
    return NextResponse.json({ success: true, assessmentId: docRef.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create assessment', details: error.message }, { status: 500 });
  }
}
