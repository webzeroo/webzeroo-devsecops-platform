import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Admin Portal - WebZero LMS',
  description: 'Admin dashboard for managing courses, lessons, assessments, users, and reports.',
};

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="app-layout">
        <Sidebar role="admin" />
        <main className="main-content">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
