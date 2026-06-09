'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';

export default function LearnerDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ enrolledCourses: 0, completedAssessments: 0, averageScore: 0, totalLessons: 0 });
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [enrollSnap, resultsSnap, coursesSnap] = await Promise.all([
        getDocs(query(collection(db, 'enrollments'), where('learnerId', '==', userData.uid))),
        getDocs(query(collection(db, 'results'), where('learnerId', '==', userData.uid))),
        getDocs(collection(db, 'courses')),
      ]);

      const results = resultsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const avg = results.length > 0
        ? Math.round(results.reduce((s, r) => s + ((r.score / r.totalMarks) * 100), 0) / results.length)
        : 0;

      setStats({
        enrolledCourses: enrollSnap.size,
        completedAssessments: results.length,
        averageScore: avg,
        totalLessons: 0,
      });
      setRecentResults(results.slice(-5).reverse());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.uid) fetchData();
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Header title={`Welcome, ${userData?.displayName || 'Learner'}!`} subtitle="Your learning journey at a glance" />
      <div className="page-content">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: '50vh' }}><div className="spinner"></div></div>
        ) : (
          <>
            <div className="stats-grid stagger-children">
              <StatsCard icon="📚" label="Enrolled Courses" value={stats.enrolledCourses} color="primary" />
              <StatsCard icon="✅" label="Assessments Done" value={stats.completedAssessments} color="success" />
              <StatsCard icon="📊" label="Average Score" value={`${stats.averageScore}%`} color="accent" />
            </div>

            <div className="glass-card" style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Recent Results</h3>
              {recentResults.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🏆</div>
                  <h3>No results yet</h3>
                  <p style={{ color: 'var(--text-tertiary)' }}>Complete an assessment to see your results here</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentResults.map(r => (
                    <div key={r.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                    }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{r.assessmentId?.substring(0, 8)}...</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                          {r.submittedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>
                          {r.score}/{r.totalMarks}
                        </span>
                        <span className={`badge ${r.passed ? 'badge-pass' : 'badge-fail'}`}>
                          {r.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
