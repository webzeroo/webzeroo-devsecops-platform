'use client';

import { useAuth } from '@/lib/authContext';

export default function Header({ title, subtitle }) {
  const { userData } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div className="header-right">
        <div className="header-user">
          <div className="user-avatar">
            {userData?.displayName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="user-info">
            <span className="user-name">{userData?.displayName || 'User'}</span>
            <span className="user-email">{userData?.email}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border-light);
          background: rgba(10, 14, 26, 0.5);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-left {
          display: flex;
          flex-direction: column;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          color: white;
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .user-email {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        @media (max-width: 768px) {
          .app-header {
            padding: 1rem;
          }
          .user-info {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
