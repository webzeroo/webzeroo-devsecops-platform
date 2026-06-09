import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Learner Portal - WebZero LMS',
  description: 'Learner dashboard for browsing courses, taking lessons, and completing assessments.',
};

export default function LearnerLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="learner">
      <div className="app-layout">
        <Sidebar role="learner" />
        <main className="main-content">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
