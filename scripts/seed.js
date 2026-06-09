/**
 * Seed Script: Creates admin and learner accounts in Firebase
 * 
 * Usage:
 *   1. Set up your Firebase project first
 *   2. Download the service account key JSON file
 *   3. Set the environment variable: 
 *      set FIREBASE_SERVICE_ACCOUNT_KEY=<path-to-key.json>
 *   4. Run: node scripts/seed.js
 * 
 * This script creates:
 *   - admin@webzeroo.com (password: admin123, role: admin)
 *   - learner@webzeroo.com (password: learner123, role: learner)
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Load service account key
let serviceAccount;
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (keyPath && fs.existsSync(keyPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
} else if (keyPath) {
  try {
    serviceAccount = JSON.parse(keyPath);
  } catch (e) {
    console.error('❌ Could not parse FIREBASE_SERVICE_ACCOUNT_KEY');
    console.error('   Set it to a file path or JSON string of your service account key.');
    process.exit(1);
  }
} else {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.');
  console.error('   Set it to the path of your Firebase service account key JSON file.');
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const auth = getAuth(app);
const db = getFirestore(app);

const users = [
  {
    email: 'admin@webzeroo.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin',
  },
  {
    email: 'learner@webzeroo.com',
    password: 'learner123',
    displayName: 'Learner User',
    role: 'learner',
  },
];

async function seed() {
  console.log('🌱 Seeding WebZero LMS...\n');

  for (const userData of users) {
    try {
      // Check if user exists
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(userData.email);
        console.log(`✓ User already exists: ${userData.email} (${userRecord.uid})`);
      } catch (e) {
        // Create user
        userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
        });
        console.log(`✓ Created user: ${userData.email} (${userRecord.uid})`);
      }

      // Create/update Firestore document
      await db.collection('users').doc(userRecord.uid).set({
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        createdAt: new Date(),
        lastLogin: new Date(),
      }, { merge: true });

      console.log(`  → Firestore doc set with role: ${userData.role}`);
    } catch (error) {
      console.error(`❌ Error creating ${userData.email}:`, error.message);
    }
  }

  // Create a sample course
  try {
    const courseRef = await db.collection('courses').add({
      name: 'Introduction to DevSecOps',
      description: 'Learn the fundamentals of DevSecOps — integrating security practices into the DevOps pipeline.',
      category: 'Security',
      thumbnail: '',
      status: 'published',
      createdBy: 'seed-script',
      createdAt: new Date(),
      updatedAt: new Date(),
      lessonCount: 2,
      enrolledCount: 0,
    });
    console.log(`\n✓ Created sample course: ${courseRef.id}`);

    // Add sample lessons
    await db.collection('lessons').add({
      courseId: courseRef.id,
      title: 'What is DevSecOps?',
      type: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      order: 1,
      createdAt: new Date(),
    });

    await db.collection('lessons').add({
      courseId: courseRef.id,
      title: 'CI/CD Pipeline Security',
      type: 'pdf',
      contentUrl: 'https://example.com/cicd-security.pdf',
      order: 2,
      createdAt: new Date(),
    });
    console.log('✓ Created 2 sample lessons');

    // Add sample assessment
    await db.collection('assessments').add({
      courseId: courseRef.id,
      title: 'DevSecOps Basics Quiz',
      description: 'Test your knowledge of DevSecOps fundamentals',
      passingMarks: 20,
      totalMarks: 30,
      status: 'published',
      questions: [
        {
          question: 'What does DevSecOps stand for?',
          options: ['Development Security Operations', 'Developer Section Operations', 'Device Security Options', 'Development Secure Optimization'],
          correctAnswer: 0,
          marks: 10,
        },
        {
          question: 'Which tool is used for static code analysis?',
          options: ['Docker', 'CodeQL', 'Kubernetes', 'Nginx'],
          correctAnswer: 1,
          marks: 10,
        },
        {
          question: 'What is the purpose of a CI/CD pipeline?',
          options: ['Manual deployment', 'Automated testing and deployment', 'Database management', 'Network monitoring'],
          correctAnswer: 1,
          marks: 10,
        },
      ],
      createdAt: new Date(),
    });
    console.log('✓ Created sample assessment (3 questions)\n');
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  }

  console.log('🎉 Seeding complete!\n');
  console.log('Credentials:');
  console.log('  Admin:   admin@webzeroo.com / admin123');
  console.log('  Learner: learner@webzeroo.com / learner123');
  process.exit(0);
}

seed();
