'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import Header from '@/components/Header';
import CourseCard from '@/components/CourseCard';
import Modal from '@/components/Modal';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: '', thumbnail: '', status: 'draft' });
  const { user } = useAuth();

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const snap = await getDocs(collection(db, 'courses'));
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditCourse(null);
    setFormData({ name: '', description: '', category: '', thumbnail: '', status: 'draft' });
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      category: course.category || '',
      thumbnail: course.thumbnail || '',
      status: course.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editCourse) {
        await updateDoc(doc(db, 'courses', editCourse.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'courses'), {
          ...formData,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lessonCount: 0,
          enrolledCount: 0,
        });
      }
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteDoc(doc(db, 'courses', id));
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      await updateDoc(doc(db, 'courses', id), { status: 'published', updatedAt: serverTimestamp() });
      fetchCourses();
    } catch (error) {
      console.error('Error publishing course:', error);
    }
  };

  return (
    <>
      <Header title="Courses" subtitle="Create and manage your courses" />
      <div className="page-content">
        <div className="toolbar">
          <div className="toolbar-left">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {courses.length} course{courses.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button className="btn btn-primary" onClick={openCreate} id="create-course-btn">
            + Create Course
          </button>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: '50vh' }}>
            <div className="spinner"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No courses yet</h3>
            <p style={{ color: 'var(--text-tertiary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Create your first course to get started</p>
            <button className="btn btn-primary" onClick={openCreate}>+ Create Course</button>
          </div>
        ) : (
          <div className="cards-grid">
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                role="admin"
                onEdit={openEdit}
                onDelete={handleDelete}
                onPublish={handlePublish}
              />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCourse ? 'Edit Course' : 'Create Course'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Course Name *</label>
            <input
              className="form-input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. Introduction to Cybersecurity"
              id="course-name-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this course..."
              id="course-desc-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              id="course-category-select"
            >
              <option value="">Select Category</option>
              <option value="Technology">Technology</option>
              <option value="Security">Security</option>
              <option value="DevOps">DevOps</option>
              <option value="Programming">Programming</option>
              <option value="Cloud">Cloud</option>
              <option value="Data Science">Data Science</option>
              <option value="General">General</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Thumbnail URL</label>
            <input
              className="form-input"
              value={formData.thumbnail}
              onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
              placeholder="https://example.com/image.jpg"
              id="course-thumbnail-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              id="course-status-select"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="course-save-btn">
              {editCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
