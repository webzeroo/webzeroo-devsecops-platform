'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import Header from '@/components/Header';
import CourseCard from '@/components/CourseCard';

export default function LearnerCoursesPage() {
  const { userData } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const fetchData = async () => {
    try {
      const [coursesSnap, enrollSnap] = await Promise.all([
        getDocs(query(collection(db, 'courses'), where('status', '==', 'published'))),
        getDocs(query(collection(db, 'enrollments'), where('learnerId', '==', userData.uid))),
      ]);
      const enrollList = enrollSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEnrollments(enrollList);
      const enrolledIds = new Set(enrollList.map(e => e.courseId));
      setCourses(coursesSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        enrolled: enrolledIds.has(d.id),
      })));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userData?.uid) fetchData(); }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnroll = async (courseId) => {
    try {
      await addDoc(collection(db, 'enrollments'), {
        courseId,
        learnerId: userData.uid,
        enrolledAt: serverTimestamp(),
        progress: 0,
        completedLessons: [],
      });
      fetchData();
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  const filteredCourses = tab === 'enrolled'
    ? courses.filter(c => c.enrolled)
    : courses;

  return (
    <>
      <Header title="My Courses" subtitle="Browse and enroll in courses" />
      <div className="page-content">
        <div className="tabs">
          <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Courses</button>
          <button className={`tab ${tab === 'enrolled' ? 'active' : ''}`} onClick={() => setTab('enrolled')}>Enrolled</button>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: '50vh' }}><div className="spinner"></div></div>
        ) : filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>{tab === 'enrolled' ? 'Not enrolled in any courses' : 'No courses available'}</h3>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                role="learner"
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
