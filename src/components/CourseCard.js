'use client';

export default function CourseCard({ course, role, onEdit, onDelete, onPublish, onEnroll }) {
  return (
    <div className="course-card glass-card">
      <div className="course-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.thumbnail || '/placeholder-course.svg'}
          alt={course.name}
          onError={(e) => { e.target.src = '/placeholder-course.svg'; }}
        />
        <span className={`badge ${course.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
          {course.status}
        </span>
      </div>
      <div className="course-body">
        <span className="course-category">{course.category || 'General'}</span>
        <h3 className="course-title">{course.name}</h3>
        <p className="course-desc">{course.description}</p>
        <div className="course-meta">
          <span>📝 {course.lessonCount || 0} Lessons</span>
          <span>👥 {course.enrolledCount || 0} Enrolled</span>
        </div>
      </div>
      <div className="course-actions">
        {role === 'admin' ? (
          <>
            {course.status === 'draft' && (
              <button className="btn btn-success btn-sm" onClick={() => onPublish?.(course.id)} id={`publish-course-${course.id}`}>
                Publish
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit?.(course)} id={`edit-course-${course.id}`}>
              ✏️ Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(course.id)} id={`delete-course-${course.id}`}>
              🗑️
            </button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => onEnroll?.(course.id)} id={`enroll-course-${course.id}`}>
            {course.enrolled ? 'Continue' : 'Enroll Now'}
          </button>
        )}
      </div>

      <style jsx>{`
        .course-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 0;
        }

        .course-thumb {
          position: relative;
          height: 160px;
          overflow: hidden;
          background: linear-gradient(135deg, var(--primary-900), var(--bg-tertiary));
        }

        .course-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .course-card:hover .course-thumb img {
          transform: scale(1.05);
        }

        .course-thumb .badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
        }

        .course-body {
          padding: 1.25rem;
          flex: 1;
        }

        .course-category {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--primary-400);
          font-weight: 600;
        }

        .course-title {
          font-size: 1.1rem;
          margin: 0.35rem 0;
          line-height: 1.3;
        }

        .course-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }

        .course-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .course-actions {
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--border-light);
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}
