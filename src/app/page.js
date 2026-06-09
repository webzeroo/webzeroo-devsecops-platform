'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, userRole, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && userRole) {
      router.push(userRole === 'admin' ? '/admin/dashboard' : '/learner/dashboard');
    }
  }, [user, userRole, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
    }
    // Redirect handled by useEffect above
  };

  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@webzeroo.com');
      setPassword('admin123');
    } else {
      setEmail('learner@webzeroo.com');
      setPassword('learner123');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading WebZero LMS...</p>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <div className="login-container">
        {/* Left side — branding */}
        <div className="login-brand">
          <div className="brand-content">
            <span className="brand-icon">🎓</span>
            <h1 className="brand-title">WebZero</h1>
            <p className="brand-tagline">Learning Management System</p>
            <div className="brand-features">
              <div className="feature-item">
                <span>📚</span>
                <span>Comprehensive Courses</span>
              </div>
              <div className="feature-item">
                <span>📋</span>
                <span>Interactive Assessments</span>
              </div>
              <div className="feature-item">
                <span>📊</span>
                <span>Detailed Analytics</span>
              </div>
              <div className="feature-item">
                <span>🏆</span>
                <span>Track Your Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side — login form */}
        <div className="login-form-section">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Sign in to your account</p>

            {error && (
              <div className="error-banner" id="login-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg login-btn"
              disabled={isLoading}
              id="login-submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="quick-access">
              <p className="quick-label">Quick Access (Demo)</p>
              <div className="quick-btns">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fillCredentials('admin')}
                  id="quick-admin-btn"
                >
                  🛡️ Admin Login
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fillCredentials('learner')}
                  id="quick-learner-btn"
                >
                  🎓 Learner Login
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .login-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          animation: float 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(99, 102, 241, 0.15);
          top: -10%;
          left: -5%;
        }

        .orb-2 {
          width: 350px;
          height: 350px;
          background: rgba(34, 211, 238, 0.1);
          bottom: -10%;
          right: -5%;
          animation-delay: -3s;
        }

        .orb-3 {
          width: 250px;
          height: 250px;
          background: rgba(16, 185, 129, 0.08);
          top: 50%;
          left: 50%;
          animation-delay: -5s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        .login-container {
          display: flex;
          width: 100%;
          max-width: 900px;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--bg-glass-border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          position: relative;
          z-index: 1;
          animation: scaleIn 0.5s ease-out;
        }

        .login-brand {
          flex: 1;
          padding: 3rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(34, 211, 238, 0.08));
          display: flex;
          align-items: center;
          border-right: 1px solid var(--bg-glass-border);
        }

        .brand-content {
          text-align: center;
          width: 100%;
        }

        .brand-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.4));
        }

        .brand-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary-400), var(--accent-400));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.25rem;
        }

        .brand-tagline {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }

        .brand-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          text-align: left;
          max-width: 250px;
          margin: 0 auto;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-sm);
        }

        .login-form-section {
          flex: 1;
          padding: 3rem;
          display: flex;
          align-items: center;
        }

        .login-form {
          width: 100%;
        }

        .form-title {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .form-subtitle {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--danger-400);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: fadeInUp 0.3s ease-out;
        }

        .login-btn {
          width: 100%;
          justify-content: center;
          margin-top: 0.5rem;
        }

        .quick-access {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-light);
          text-align: center;
        }

        .quick-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
        }

        .quick-btns {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
          }
          .login-brand {
            padding: 2rem;
            border-right: none;
            border-bottom: 1px solid var(--bg-glass-border);
          }
          .brand-features {
            display: none;
          }
          .login-form-section {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
