'use client';

import Header from '@/components/Header';

export default function AdminSettingsPage() {
  return (
    <>
      <Header title="Settings" subtitle="Platform configuration" />
      <div className="page-content">
        <div className="glass-card" style={{ maxWidth: '600px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Platform Settings</h3>
          <div className="form-group">
            <label className="form-label">Platform Name</label>
            <input className="form-input" defaultValue="WebZero LMS" id="settings-name" />
          </div>
          <div className="form-group">
            <label className="form-label">Support Email</label>
            <input className="form-input" defaultValue="admin@webzeroo.com" id="settings-email" />
          </div>
          <div className="form-group">
            <label className="form-label">Default Passing Percentage</label>
            <input className="form-input" type="number" defaultValue="50" min="0" max="100" id="settings-passing" />
          </div>
          <div className="form-group">
            <label className="form-label">Assessment Auto-Publish</label>
            <select className="form-select" defaultValue="no" id="settings-auto-publish">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <button className="btn btn-primary" id="settings-save-btn" onClick={() => alert('Settings saved!')}>
            Save Settings
          </button>
        </div>

        <div className="glass-card" style={{ maxWidth: '600px', marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>About</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7 }}>
            <strong>WebZero LMS Platform</strong><br />
            Version 1.0.0<br />
            Built with Next.js + Firebase<br />
            © 2026 WebZeroo. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
