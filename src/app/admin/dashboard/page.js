'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import ChartPanel from '@/components/ChartPanel';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    averageScore: 0,
  });
  const [chartData, setChartData] = useState({
    usersByMonth: null,
    assessmentResults: null,
    courseProgress: null,
  });
  const [loading, setLoading] = useState(true);

  async function fetchDashboardData() {
    try {
      // Fetch all collections
      const [usersSnap, coursesSnap, lessonsSnap, assessmentsSnap, resultsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'lessons')),
        getDocs(collection(db, 'assessments')),
        getDocs(collection(db, 'results')),
      ]);

      const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const results = resultsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Calculate stats
      const totalUsers = usersSnap.size;
      const totalCourses = coursesSnap.size;
      const totalLessons = lessonsSnap.size;
      const totalAssessments = assessmentsSnap.size;
      const completedAssessments = resultsSnap.size;
      const averageScore = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + ((r.score / r.totalMarks) * 100), 0) / results.length)
        : 0;

      setStats({ totalUsers, totalCourses, totalLessons, totalAssessments, completedAssessments, averageScore });

      // Users by Month chart
      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const usersByMonth = new Array(12).fill(0);
      users.forEach(u => {
        if (u.createdAt?.toDate) {
          const month = u.createdAt.toDate().getMonth();
          usersByMonth[month]++;
        }
      });

      setChartData({
        usersByMonth: {
          labels: monthLabels,
          datasets: [{
            label: 'New Users',
            data: usersByMonth,
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
            borderColor: '#6366f1',
            borderWidth: 2,
            borderRadius: 6,
          }],
        },
        assessmentResults: {
          labels: ['Passed', 'Failed'],
          datasets: [{
            data: [
              results.filter(r => r.passed).length || 0,
              results.filter(r => !r.passed).length || 0,
            ],
            backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)'],
            borderColor: ['#10b981', '#ef4444'],
            borderWidth: 2,
          }],
        },
        courseProgress: {
          labels: monthLabels,
          datasets: [{
            label: 'Assessments Completed',
            data: (() => {
              const byMonth = new Array(12).fill(0);
              results.forEach(r => {
                if (r.submittedAt?.toDate) {
                  byMonth[r.submittedAt.toDate().getMonth()]++;
                }
              });
              return byMonth;
            })(),
            borderColor: '#22d3ee',
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          }],
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  

  return (
    <>
      <Header title="Admin Dashboard" subtitle="Overview of your LMS platform" />
      <div className="page-content">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: '50vh' }}>
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="stats-grid stagger-children">
              <StatsCard icon="👥" label="Total Users" value={stats.totalUsers} color="primary" />
              <StatsCard icon="📚" label="Total Courses" value={stats.totalCourses} color="accent" />
              <StatsCard icon="📝" label="Total Lessons" value={stats.totalLessons} color="success" />
              <StatsCard icon="📋" label="Total Assessments" value={stats.totalAssessments} color="warning" />
              <StatsCard icon="✅" label="Completed" value={stats.completedAssessments} color="success" />
              <StatsCard icon="📊" label="Avg Score" value={`${stats.averageScore}%`} color="primary" />
            </div>

            <div className="charts-grid">
              {chartData.usersByMonth && (
                <ChartPanel
                  type="bar"
                  data={chartData.usersByMonth}
                  title="Users by Month"
                  height={280}
                />
              )}
              {chartData.assessmentResults && (
                <ChartPanel
                  type="doughnut"
                  data={chartData.assessmentResults}
                  title="Assessment Results"
                  height={280}
                />
              )}
              {chartData.courseProgress && (
                <ChartPanel
                  type="line"
                  data={chartData.courseProgress}
                  title="Monthly Assessment Activity"
                  height={280}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
