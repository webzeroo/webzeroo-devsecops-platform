'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import DataTable from '@/components/DataTable';

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '', title: '', description: '', passingMarks: 50, totalMarks: 100, status: 'draft',
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 10 }],
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [aSnap, cSnap] = await Promise.all([
        getDocs(collection(db, 'assessments')),
        getDocs(collection(db, 'courses')),
      ]);
      const coursesList = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCourses(coursesList);
      setAssessments(aSnap.docs.map(d => {
        const data = d.data();
        const course = coursesList.find(c => c.id === data.courseId);
        return { id: d.id, ...data, courseName: course?.name || 'N/A', questionCount: data.questions?.length || 0 };
      }));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 10 }],
    });
  };

  const removeQuestion = (idx) => {
    if (formData.questions.length <= 1) return;
    const q = [...formData.questions];
    q.splice(idx, 1);
    setFormData({ ...formData, questions: q });
  };

  const updateQuestion = (idx, field, value) => {
    const q = [...formData.questions];
    q[idx] = { ...q[idx], [field]: value };
    setFormData({ ...formData, questions: q });
  };

  const updateOption = (qIdx, oIdx, value) => {
    const q = [...formData.questions];
    q[qIdx].options[oIdx] = value;
    setFormData({ ...formData, questions: q });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const totalMarks = formData.questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0);
      await addDoc(collection(db, 'assessments'), {
        courseId: formData.courseId,
        title: formData.title,
        description: formData.description,
        passingMarks: parseInt(formData.passingMarks),
        totalMarks,
        status: formData.status,
        questions: formData.questions.map(q => ({
          ...q,
          marks: parseInt(q.marks) || 10,
          correctAnswer: parseInt(q.correctAnswer),
        })),
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setFormData({
        courseId: '', title: '', description: '', passingMarks: 50, totalMarks: 100, status: 'draft',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 10 }],
      });
      fetchData();
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const handlePublish = async (id) => {
    await updateDoc(doc(db, 'assessments', id), { status: 'published' });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this assessment?')) {
      await deleteDoc(doc(db, 'assessments', id));
      fetchData();
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'courseName', label: 'Course' },
    { key: 'questionCount', label: 'Questions' },
    { key: 'totalMarks', label: 'Total Marks' },
    { key: 'passingMarks', label: 'Passing' },
    {
      key: 'status', label: 'Status',
      render: (val) => <span className={`badge ${val === 'published' ? 'badge-published' : 'badge-draft'}`}>{val}</span>,
    },
    {
      key: 'id', label: 'Actions', sortable: false,
      render: (val, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {row.status === 'draft' && (
            <button className="btn btn-success btn-sm" onClick={() => handlePublish(val)}>Publish</button>
          )}
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(val)}>🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title="Assessments" subtitle="Create and manage MCQ assessments" />
      <div className="page-content">
        <div className="toolbar">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}
          </span>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="create-assessment-btn">
            + Create Assessment
          </button>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: '50vh' }}><div className="spinner"></div></div>
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <DataTable columns={columns} data={assessments} emptyMessage="No assessments yet" />
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Assessment">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Course *</label>
            <select className="form-select" value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })} required id="assessment-course-select">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assessment Title *</label>
            <input className="form-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g. Module 1 Quiz" id="assessment-title-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Assessment description..." id="assessment-desc-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Passing Marks</label>
            <input className="form-input" type="number" min="0" value={formData.passingMarks} onChange={e => setFormData({ ...formData, passingMarks: e.target.value })} id="assessment-passing-input" />
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4>Questions ({formData.questions.length})</h4>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>+ Add Question</button>
            </div>

            {formData.questions.map((q, qi) => (
              <div key={qi} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-400)' }}>Question {qi + 1}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="number" min="1" value={q.marks} onChange={e => updateQuestion(qi, 'marks', e.target.value)} style={{ width: '60px', padding: '0.25rem 0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>marks</span>
                    {formData.questions.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)} style={{ padding: '0.25rem 0.5rem' }}>✕</button>
                    )}
                  </div>
                </div>
                <input className="form-input" value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)} placeholder="Enter your question..." required style={{ marginBottom: '0.75rem' }} />
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi} onChange={() => updateQuestion(qi, 'correctAnswer', oi)} style={{ accentColor: 'var(--success-500)' }} />
                    <input className="form-input" value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} required style={{ flex: 1 }} />
                  </div>
                ))}
                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Select the radio button for the correct answer</p>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="assessment-save-btn">Create Assessment</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
