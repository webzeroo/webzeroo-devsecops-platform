// Firebase Admin SDK for Server-Side (API Routes)
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function initAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Parse the service account key from environment variable
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
    serviceAccount = {};
  }

  let credential;
  if (serviceAccount.private_key && serviceAccount.private_key.includes('BEGIN PRIVATE KEY')) {
    credential = cert(serviceAccount);
  } else {
    console.warn('Firebase Admin: No valid private_key found. Using fallback credential.');
    credential = {
      getAccessToken: () => Promise.resolve({ access_token: 'mock', expires_in: 3600 })
    };
  }

  return initializeApp({
    credential,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'test',
  });
}

const adminApp = initAdmin();

let adminAuthObj = null;
let adminDbObj = null;

try {
  adminAuthObj = getAuth(adminApp);
  adminDbObj = getFirestore(adminApp);
} catch (e) {
  console.warn('Firebase Admin services failed to initialize (normal during build with mock keys):', e.message);
}

export const adminAuth = adminAuthObj;
export const adminDb = adminDbObj;
export default adminApp;
