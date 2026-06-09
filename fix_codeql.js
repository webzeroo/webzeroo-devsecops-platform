const fs = require('fs');

function replace(file, search, replace) {
  const content = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, content.replace(search, replace));
}

// 1. scripts/seed.js: Unused variable path
replace('scripts/seed.js', "const path = require('path');\n", "");

// 2. src/app/admin/dashboard/page.js: Unused imports orderBy, query, where
replace('src/app/admin/dashboard/page.js', "import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';", "import { collection, getDocs } from 'firebase/firestore';");

// 3. src/app/learner/assessments/page.js: Unused variable completedIds
replace('src/app/learner/assessments/page.js', "const completedIds = new Set(resultsSnap.docs.map(d => d.data().assessmentId));\n", "");

// 4. src/app/learner/courses/page.js: Unused variable enrollments
replace('src/app/learner/courses/page.js', "const enrollments = new Set(enrollSnap.docs.map(d => d.data().courseId));\n", "");

// 5. src/app/learner/dashboard/page.js: Unused variable coursesSnap
replace('src/app/learner/dashboard/page.js', "const [enrollmentsSnap, coursesSnap] = await Promise.all([\n        getDocs(query(collection(db, 'enrollments'), where('userId', '==', user.uid))),\n        getDocs(collection(db, 'courses')),\n      ]);", "const [enrollmentsSnap] = await Promise.all([\n        getDocs(query(collection(db, 'enrollments'), where('userId', '==', user.uid)))\n      ]);");

// 6. src/app/learner/lessons/page.js: Unused variable enrolledCourseIds
replace('src/app/learner/lessons/page.js', "const enrolledCourseIds = new Set(enrollmentsSnap.docs.map(d => d.data().courseId));\n", "");
