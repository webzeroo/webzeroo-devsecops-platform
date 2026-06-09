'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAtStr: d.data().createdAt?.toDate?.()?.toLocaleDateString() || 'N/A',
        lastLoginStr: d.data().lastLogin?.toDate?.()?.toLocaleString() || 'N/A',
      }));
      setUsers(list);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'displayName', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (val) => (
        <span className={`badge ${val === 'admin' ? 'badge-admin' : 'badge-learner'}`}>
          {val}
        </span>
      ),
    },
    { key: 'createdAtStr', label: 'Joined' },
    { key: 'lastLoginStr', label: 'Last Login' },
  ];

  return (
    <>
      <Header title="Users" subtitle="Manage all platform users" />
      <div className="page-content">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: '50vh' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <DataTable columns={columns} data={users} emptyMessage="No users found" />
          </div>
        )}
      </div>
    </>
  );
}
