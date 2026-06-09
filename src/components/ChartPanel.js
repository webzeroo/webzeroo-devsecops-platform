'use client';

import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function ChartPanel({ type, data, options = {}, title, height = 300 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    // Destroy previous chart instance
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#9ca3af',
            font: { family: 'Inter', size: 12 },
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#f9fafb',
          bodyColor: '#9ca3af',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' },
        },
      },
      scales: type === 'doughnut' || type === 'pie' ? {} : {
        x: {
          grid: { color: 'rgba(75, 85, 99, 0.15)' },
          ticks: { color: '#6b7280', font: { family: 'Inter', size: 11 } },
        },
        y: {
          grid: { color: 'rgba(75, 85, 99, 0.15)' },
          ticks: { color: '#6b7280', font: { family: 'Inter', size: 11 } },
          beginAtZero: true,
        },
      },
      animation: {
        duration: 1000,
        easing: 'easeOutCubic',
      },
    };

    chartRef.current = new Chart(ctx, {
      type,
      data,
      options: { ...defaultOptions, ...options },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div className="chart-panel glass-card">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-container" style={{ height }}>
        <canvas ref={canvasRef}></canvas>
      </div>

      <style jsx>{`
        .chart-panel {
          padding: 1.5rem;
        }
        .chart-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }
        .chart-container {
          position: relative;
        }
      `}</style>
    </div>
  );
}
