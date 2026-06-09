'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import DataTable from '@/components/DataTable';

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ courseId: '', title: '', type: 'video', contentUrl: '', order: 1 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [lessonsSnap, coursesSnap] = await Promise.all([
        getDocs(collection(db, 'lessons')),
        getDocs(collection(db, 'courses')),
      ]);
      const coursesList = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const lessonsList = lessonsSnap.docs.map(d => {
        const data = d.data();
        const course = coursesList.find(c => c.id === data.courseId);
        return { id: d.id, ...data, courseName: course?.name || 'Unknown' };
      });
      setCourses(coursesList);
      setLessons(lessonsList.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'lessons'), {
        ...formData,
        order: parseInt(formData.order) || 1,
        createdAt: serverTimestamp(),
      });

      // Update lesson count on course
      const courseRef = doc(db, 'courses', formData.courseId);
      const currentLessons = lessons.filter(l => l.courseId === formData.courseId).length;
      await updateDoc(courseRef, { lessonCount: currentLessons + 1 });

      setShowModal(false);
      setFormData({ courseId: '', title: '', type: 'video', contentUrl: '', order: 1 });
      fetchData();
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this lesson?')) {
      try {
        const lesson = lessons.find(l => l.id === id);
        await deleteDoc(doc(db, 'lessons', id));
        if (lesson?.courseId) {
          const remaining = lessons.filter(l => l.courseId === lesson.courseId && l.id !== id).length;
          await updateDoc(doc(db, 'courses', lesson.courseId), { lessonCount: remaining });
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting lesson:', error);
      }
    }
  };

  const typeIcons = { video: '🎥', pdf: '📄', ppt: '📊', docx: '📝' };

  const columns = [
    { key: 'order', label: '#', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'title', label: 'Title' },
    { key: 'courseName', label: 'Course' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => (
        <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
          {typeIcons[val] || '📎'} {val}
        </span>
      ),
    },
    {
      key: 'contentUrl',
      label: 'Content',
      render: (val) => val ? (
        <a href={val} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-400)', fontSize: '0.8rem' }}>
          View →
        </a>
      ) : '—',
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (val) => (
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(val)}>🗑️</button>
      ),
    },
  ];

  return (
    <>
      <Header title="Lessons" subtitle="Manage course content and materials" />
      <div className="page-content">
        <div className="toolbar">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
          </span>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="create-lesson-btn">
            + Add Lesson
          </button>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: '50vh' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <DataTable columns={columns} data={lessons} emptyMessage="No lessons yet. Create a course first, then add lessons." />
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Lesson">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Course *</label>
            <select
              className="form-select"
              value={formData.courseId}
              onChange={e => setFormData({ ...formData, courseId: e.target.value })}
              required
              id="lesson-course-select"
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Lesson Title *</label>
            <input
              className="form-input"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g. Introduction to Networks"
              id="lesson-title-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Content Type</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              id="lesson-type-select"
            >
              <option value="video">🎥 Video URL</option>
              <option value="pdf">📄 PDF</option>
              <option value="ppt">📊 PPT</option>
              <option value="docx">📝 DOCX</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Content URL *</label>
            <input
              className="form-input"
              value={formData.contentUrl}
              onChange={e => setFormData({ ...formData, contentUrl: e.target.value })}
              required
              placeholder="https://youtube.com/watch?v=... or file URL"
              id="lesson-url-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Order</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={formData.order}
              onChange={e => setFormData({ ...formData, order: e.target.value })}
              id="lesson-order-input"
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="lesson-save-btn">Add Lesson</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
