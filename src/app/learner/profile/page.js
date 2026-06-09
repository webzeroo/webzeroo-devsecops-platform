'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import Header from '@/components/Header';

export default function LearnerProfilePage() {
  const { userData } = useAuth();
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userData.uid), { displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header title="Profile" subtitle="Manage your account" />
      <div className="page-content">
        <div className="glass-card" style={{ maxWidth: '500px' }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, color: 'white', margin: '0 auto 1rem',
            }}>
              {displayName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h3>{displayName || 'Learner'}</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{userData?.email}</p>
            <span className="badge badge-learner" style={{ marginTop: '0.5rem' }}>🎓 Learner</span>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                id="profile-name-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={userData?.email || ''} disabled style={{ opacity: 0.5 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input" value="Learner" disabled style={{ opacity: 0.5 }} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} id="profile-save-btn" style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
