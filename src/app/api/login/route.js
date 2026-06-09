import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

// POST /api/login - Verify Firebase token and return user data
export async function POST(request) {
  try {
    const body = await request.json();
    const idToken = body?.idToken;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing ID token' }, { status: 400 });
    }

    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch user data from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
      },
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Authentication failed', details: error.message }, { status: 401 });
  }
}
