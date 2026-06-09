'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

const adminMenu = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Courses', path: '/admin/courses', icon: '📚' },
  { label: 'Lessons', path: '/admin/lessons', icon: '📝' },
  { label: 'Assessments', path: '/admin/assessments', icon: '📋' },
  { label: 'Reports', path: '/admin/reports', icon: '📈' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
];

const learnerMenu = [
  { label: 'Dashboard', path: '/learner/dashboard', icon: '🏠' },
  { label: 'My Courses', path: '/learner/courses', icon: '📚' },
  { label: 'Lessons', path: '/learner/lessons', icon: '📝' },
  { label: 'Assessments', path: '/learner/assessments', icon: '📋' },
  { label: 'My Results', path: '/learner/results', icon: '🏆' },
  { label: 'Profile', path: '/learner/profile', icon: '👤' },
];

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const menu = role === 'admin' ? adminMenu : learnerMenu;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <span className="logo-icon">🎓</span>
          <div className="logo-text">
            <span className="logo-title">WebZero</span>
            <span className="logo-subtitle">LMS Platform</span>
          </div>
        </div>
      </div>

      <div className="sidebar-role">
        <span className={`badge ${role === 'admin' ? 'badge-admin' : 'badge-learner'}`}>
          {role === 'admin' ? '🛡️ Admin' : '🎓 Learner'}
        </span>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => (
          <button
            key={item.path}
            className={`sidebar-link ${pathname === item.path || pathname?.startsWith(item.path + '/') ? 'active' : ''}`}
            onClick={() => router.push(item.path)}
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link logout-btn" onClick={handleLogout} id="nav-logout">
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Logout</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--sidebar-width);
          height: 100vh;
          background: rgba(10, 14, 26, 0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--bg-glass-border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          animation: slideInLeft 0.3s ease-out;
        }

        .sidebar-brand {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-light);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          font-size: 2rem;
          filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 1.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary-400), var(--accent-400));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .logo-subtitle {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .sidebar-role {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-light);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          transition: all var(--transition-base);
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .sidebar-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: linear-gradient(180deg, var(--primary-400), var(--accent-400));
          border-radius: var(--radius-full);
          transition: height var(--transition-base);
        }

        .sidebar-link:hover {
          background: rgba(99, 102, 241, 0.08);
          color: var(--text-primary);
        }

        .sidebar-link.active {
          background: rgba(99, 102, 241, 0.12);
          color: var(--primary-400);
          font-weight: 600;
        }

        .sidebar-link.active::before {
          height: 60%;
        }

        .sidebar-icon {
          font-size: 1.25rem;
          width: 28px;
          text-align: center;
          flex-shrink: 0;
        }

        .sidebar-label {
          white-space: nowrap;
        }

        .sidebar-footer {
          padding: 0.75rem;
          border-top: 1px solid var(--border-light);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1) !important;
          color: var(--danger-400) !important;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}
