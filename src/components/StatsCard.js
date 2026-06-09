'use client';

import { useEffect, useRef, useState } from 'react';

export default function StatsCard({ icon, label, value, trend, color = 'primary' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef(null);

  const colorMap = {
    primary: { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.25)', text: '#818cf8', glow: 'rgba(99, 102, 241, 0.15)' },
    accent: { bg: 'rgba(34, 211, 238, 0.12)', border: 'rgba(34, 211, 238, 0.25)', text: '#22d3ee', glow: 'rgba(34, 211, 238, 0.15)' },
    success: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', text: '#34d399', glow: 'rgba(16, 185, 129, 0.15)' },
    warning: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)', text: '#fbbf24', glow: 'rgba(245, 158, 11, 0.15)' },
    danger: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.25)', text: '#f87171', glow: 'rgba(239, 68, 68, 0.15)' },
  };

  const c = colorMap[color] || colorMap.primary;

  // Animate the number counting up
  useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseInt(value) || 0;
    if (numValue === 0) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => setDisplayValue(value));
      return;
    }

    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(eased * numValue);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(typeof value === 'string' ? value : numValue);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className="stat-card" ref={cardRef}>
      <div className="stat-icon-wrap">
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-info">
        <span className="stat-value">{displayValue}</span>
        <span className="stat-label">{label}</span>
      </div>
      {trend && (
        <div className={`stat-trend ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}

      <style jsx>{`
        .stat-card {
          background: ${c.bg};
          border: 1px solid ${c.border};
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
          overflow: hidden;
          transition: all var(--transition-base);
          animation: fadeInUp 0.5s ease-out both;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, ${c.glow} 0%, transparent 70%);
          pointer-events: none;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px ${c.glow};
        }

        .stat-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: ${c.text};
          line-height: 1.1;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .stat-trend {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .stat-trend.up {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success-400);
        }

        .stat-trend.down {
          background: rgba(239, 68, 68, 0.15);
          color: var(--danger-400);
        }
      `}</style>
    </div>
  );
}
