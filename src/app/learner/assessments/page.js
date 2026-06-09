'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import Header from '@/components/Header';
import QuizPlayer from '@/components/QuizPlayer';

export default function LearnerAssessmentsPage() {
  const { userData } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());

  const fetchData = async () => {
    try {
      const [aSnap, rSnap, eSnap, cSnap] = await Promise.all([
        getDocs(query(collection(db, 'assessments'), where('status', '==', 'published'))),
        getDocs(query(collection(db, 'results'), where('learnerId', '==', userData.uid))),
        getDocs(query(collection(db, 'enrollments'), where('learnerId', '==', userData.uid))),
        getDocs(collection(db, 'courses')),
      ]);

      const enrolledCourseIds = new Set(eSnap.docs.map(d => d.data().courseId));
      const completedAssessmentIds = new Set(rSnap.docs.map(d => d.data().assessmentId));
      setCompletedIds(completedAssessmentIds);

      const courseMap = {};
      cSnap.docs.forEach(d => { courseMap[d.id] = d.data(); });

      const available = aSnap.docs
        .filter(d => enrolledCourseIds.has(d.data().courseId))
        .map(d => ({
          id: d.id,
          ...d.data(),
          courseName: courseMap[d.data().courseId]?.name || 'N/A',
          completed: completedAssessmentIds.has(d.id),
        }));

      setAssessments(available);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userData?.uid) fetchData(); }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (result) => {
    try {
      await addDoc(collection(db, 'results'), {
        assessmentId: activeAssessment.id,
        learnerId: userData.uid,
        learnerEmail: userData.email,
        score: result.score,
        totalMarks: result.totalMarks,
        passed: result.passed,
        answers: result.answers,
        submittedAt: serverTimestamp(),
      });
      setCompletedIds(prev => new Set([...prev, activeAssessment.id]));
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  if (activeAssessment) {
    return (
      <>
        <Header title={activeAssessment.title} subtitle={activeAssessment.courseName} />
        <div className="page-content">
          <button className="btn btn-secondary" onClick={() => { setActiveAssessment(null); fetchData(); }} style={{ marginBottom: '1.5rem' }}>
            ← Back to Assessments
          </button>
          <QuizPlayer assessment={activeAssessment} onSubmit={handleSubmit} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Assessments" subtitle="Test your knowledge" />
      <div className="page-content">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: '50vh' }}><div className="spinner"></div></div>
        ) : assessments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No assessments available</h3>
            <p style={{ color: 'var(--text-tertiary)' }}>Enroll in a course to access assessments</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assessments.map(a => (
              <div key={a.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{a.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{a.courseName}</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <span>📝 {a.questions?.length || 0} Questions</span>
                    <span>🎯 {a.totalMarks} Marks</span>
                    <span>✅ Pass: {a.passingMarks}</span>
                  </div>
                </div>
                <div>
                  {a.completed ? (
                    <span className="badge badge-pass">✓ Completed</span>
                  ) : (
                    <button className="btn btn-primary" onClick={() => setActiveAssessment(a)} id={`take-assessment-${a.id}`}>
                      Take Assessment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
