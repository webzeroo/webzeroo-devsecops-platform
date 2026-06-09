'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';

export default function LearnerResultsPage() {
  const { userData } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [rSnap, aSnap] = await Promise.all([
        getDocs(query(collection(db, 'results'), where('learnerId', '==', userData.uid))),
        getDocs(collection(db, 'assessments')),
      ]);

      const assessmentMap = {};
      aSnap.docs.forEach(d => { assessmentMap[d.id] = d.data(); });

      const list = rSnap.docs.map(d => {
        const data = d.data();
        const assessment = assessmentMap[data.assessmentId] || {};
        return {
          id: d.id,
          ...data,
          assessmentTitle: assessment.title || 'Unknown',
          percentage: data.totalMarks ? Math.round((data.score / data.totalMarks) * 100) : 0,
          submittedAtStr: data.submittedAt?.toDate?.()?.toLocaleString() || 'N/A',
        };
      });

      setResults(list);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userData?.uid) fetchData(); }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = [
    { key: 'assessmentTitle', label: 'Assessment' },
    { key: 'score', label: 'Score', render: (val, row) => `${val}/${row.totalMarks}` },
    { key: 'percentage', label: '%', render: (val) => <span style={{ fontWeight: 700, color: val >= 50 ? 'var(--success-400)' : 'var(--danger-400)' }}>{val}%</span> },
    {
      key: 'passed', label: 'Result',
      render: (val) => <span className={`badge ${val ? 'badge-pass' : 'badge-fail'}`}>{val ? 'PASS' : 'FAIL'}</span>,
    },
    { key: 'submittedAtStr', label: 'Date' },
  ];

  return (
    <>
      <Header title="My Results" subtitle="Your assessment performance history" />
      <div className="page-content">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: '50vh' }}><div className="spinner"></div></div>
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <DataTable columns={columns} data={results} emptyMessage="No results yet. Complete an assessment to see results." />
          </div>
        )}
      </div>
    </>
  );
}
