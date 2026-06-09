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

// GET /api/lessons - List lessons (optionally filter by courseId)
export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    let lessonsRef = adminDb.collection('lessons');
    if (courseId) {
      lessonsRef = lessonsRef.where('courseId', '==', courseId);
    }

    const snapshot = await lessonsRef.orderBy('order').get();
    const lessons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, lessons });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lessons', details: error.message }, { status: 500 });
  }
}

// POST /api/lessons - Create a lesson (admin only)
export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await request.json();
    const { courseId, title, type, contentUrl, order } = body;

    if (!courseId || !title || !contentUrl) {
      return NextResponse.json({ error: 'courseId, title, and contentUrl are required' }, { status: 400 });
    }

    const lessonData = {
      courseId, title,
      type: type || 'video',
      contentUrl,
      order: order || 1,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('lessons').add(lessonData);
    return NextResponse.json({ success: true, lessonId: docRef.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create lesson', details: error.message }, { status: 500 });
  }
}
