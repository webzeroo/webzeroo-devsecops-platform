'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import Header from '@/components/Header';

export default function LearnerLessonsPage() {
  const { userData } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const enrollSnap = await getDocs(query(collection(db, 'enrollments'), where('learnerId', '==', userData.uid)));
      const courseIds = enrollSnap.docs.map(d => d.data().courseId);
      setEnrolledCourseIds(courseIds);

      if (courseIds.length === 0) { setLoading(false); return; }

      const [lessonsSnap, coursesSnap] = await Promise.all([
        getDocs(collection(db, 'lessons')),
        getDocs(collection(db, 'courses')),
      ]);

      const courseMap = {};
      coursesSnap.docs.forEach(d => { courseMap[d.id] = d.data(); });
      setCourses(courseIds.map(id => ({ id, name: courseMap[id]?.name || 'Unknown' })));

      const enrolled = lessonsSnap.docs
        .filter(d => courseIds.includes(d.data().courseId))
        .map(d => ({ id: d.id, ...d.data(), courseName: courseMap[d.data().courseId]?.name || '' }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      setLessons(enrolled);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userData?.uid) fetchData(); }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  const typeIcons = { video: '🎥', pdf: '📄', ppt: '📊', docx: '📝' };

  const filtered = selectedCourse === 'all' ? lessons : lessons.filter(l => l.courseId === selectedCourse);

  return (
    <>
      <Header title="Lessons" subtitle="Access your course materials" />
      <div className="page-content">
        {courses.length > 0 && (
          <div className="toolbar" style={{ marginBottom: '1.5rem' }}>
            <select className="form-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={{ maxWidth: '300px' }} id="lesson-filter-select">
              <option value="all">All Enrolled Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="loading-screen" style={{ minHeight: '50vh' }}><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No lessons available</h3>
            <p style={{ color: 'var(--text-tertiary)' }}>Enroll in a course to access its lessons</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((lesson, i) => (
              <div key={lesson.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                    background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
                  }}>
                    {typeIcons[lesson.type] || '📎'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{lesson.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                      {lesson.courseName} · {lesson.type?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <a
                  href={lesson.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  id={`open-lesson-${lesson.id}`}
                >
                  {lesson.type === 'video' ? '▶ Watch' : '📥 Open'}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
