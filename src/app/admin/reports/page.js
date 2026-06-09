'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import ChartPanel from '@/components/ChartPanel';
import StatsCard from '@/components/StatsCard';

export default function AdminReportsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, passed: 0, failed: 0, avgScore: 0 });
  const [chartData, setChartData] = useState(null);

  async function fetchResults() {
    try {
      const [resultsSnap, assessmentsSnap] = await Promise.all([
        getDocs(collection(db, 'results')),
        getDocs(collection(db, 'assessments')),
      ]);
      const assessments = assessmentsSnap.docs.reduce((acc, d) => {
        acc[d.id] = d.data();
        return acc;
      }, {});

      const list = resultsSnap.docs.map(d => {
        const data = d.data();
        const assessment = assessments[data.assessmentId] || {}
        return {
          id: d.id,
          ...data,
          assessmentTitle: assessment.title || 'Unknown',
          percentage: data.totalMarks ? Math.round((data.score / data.totalMarks) * 100) : 0,
          submittedAtStr: data.submittedAt?.toDate?.()?.toLocaleString() || 'N/A',
        };
      });

      setResults(list);

      const passed = list.filter(r => r.passed).length;
      const failed = list.filter(r => !r.passed).length;
      const avg = list.length > 0 ? Math.round(list.reduce((s, r) => s + r.percentage, 0) / list.length) : 0;
      setStats({ total: list.length, passed, failed, avgScore: avg });

      // Score distribution chart
      const ranges = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
      const distribution = [0, 0, 0, 0, 0];
      list.forEach(r => {
        if (r.percentage <= 20) distribution[0]++;
        else if (r.percentage <= 40) distribution[1]++;
        else if (r.percentage <= 60) distribution[2]++;
        else if (r.percentage <= 80) distribution[3]++;
        else distribution[4]++;
      });

      setChartData({
        labels: ranges,
        datasets: [{
          label: 'Learners',
          data: distribution,
          backgroundColor: [
            'rgba(239, 68, 68, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(234, 179, 8, 0.6)',
            'rgba(34, 211, 238, 0.6)',
            'rgba(16, 185, 129, 0.6)',
          ],
          borderColor: ['#ef4444', '#f59e0b', '#eab308', '#22d3ee', '#10b981'],
          borderWidth: 2,
          borderRadius: 6,
        }],
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResults();
  }, []);

  const columns = [
    { key: 'learnerEmail', label: 'Learner' },
    { key: 'assessmentTitle', label: 'Assessment' },
    { key: 'score', label: 'Score', render: (val, row) => `${val}/${row.totalMarks}` },
    { key: 'percentage', label: '%', render: (val) => `${val}%` },
    {
      key: 'passed', label: 'Result',
      render: (val) => <span className={`badge ${val ? 'badge-pass' : 'badge-fail'}`}>{val ? 'PASS' : 'FAIL'}</span>,
    },
    { key: 'submittedAtStr', label: 'Date' },
  ];

  return (
    <>
      <Header title="Reports" subtitle="Assessment results and analytics" />
      <div className="page-content">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: '50vh' }}><div className="spinner"></div></div>
        ) : (
          <>
            <div className="stats-grid stagger-children">
              <StatsCard icon="📋" label="Total Submissions" value={stats.total} color="primary" />
              <StatsCard icon="✅" label="Passed" value={stats.passed} color="success" />
              <StatsCard icon="❌" label="Failed" value={stats.failed} color="danger" />
              <StatsCard icon="📊" label="Average Score" value={`${stats.avgScore}%`} color="accent" />
            </div>

            {chartData && (
              <div style={{ marginBottom: '2rem', maxWidth: '600px' }}>
                <ChartPanel type="bar" data={chartData} title="Score Distribution" height={250} />
              </div>
            )}

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <DataTable columns={columns} data={results} emptyMessage="No assessment results yet" />
            </div>
          </>
        )}
      </div>
    </>
  );
}
