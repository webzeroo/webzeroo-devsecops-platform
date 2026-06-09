import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

// Helper: verify auth header
async function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    return { uid: decoded.uid, ...userDoc.data() };
  } catch {
    return null;
  }
}

// GET /api/courses - List all courses
export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let coursesRef = adminDb.collection('courses');

    // Learners only see published courses
    if (user.role === 'learner') {
      coursesRef = coursesRef.where('status', '==', 'published');
    }

    const snapshot = await coursesRef.get();
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses', details: error.message }, { status: 500 });
  }
}

// POST /api/courses - Create a new course (admin only)
export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description, category, thumbnail, status } = body;

    if (!name) {
      return NextResponse.json({ error: 'Course name is required' }, { status: 400 });
    }

    const courseData = {
      name,
      description: description || '',
      category: category || 'General',
      thumbnail: thumbnail || '',
      status: status || 'draft',
      createdBy: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      lessonCount: 0,
      enrolledCount: 0,
    };

    const docRef = await adminDb.collection('courses').add(courseData);

    return NextResponse.json({ success: true, courseId: docRef.id, course: courseData }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create course', details: error.message }, { status: 500 });
  }
}
