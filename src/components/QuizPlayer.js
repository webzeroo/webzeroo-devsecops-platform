'use client';

import { useState } from 'react';

export default function QuizPlayer({ assessment, onSubmit }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(new Array(assessment.questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const questions = assessment.questions;
  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleSelect = (optionIndex) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Calculate score
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        score += q.marks || 1;
      }
    });

    const totalMarks = assessment.totalMarks || questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const passed = score >= (assessment.passingMarks || Math.ceil(totalMarks * 0.5));

    const resultData = { score, totalMarks, passed, answers };
    setResult(resultData);
    setSubmitted(true);

    if (onSubmit) {
      await onSubmit(resultData);
    }
  };

  const answeredCount = answers.filter(a => a !== -1).length;

  return (
    <div className="quiz-player">
      {/* Progress */}
      <div className="quiz-progress-section">
        <div className="quiz-progress-info">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span>{answeredCount}/{questions.length} answered</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Result Banner */}
      {submitted && result && (
        <div className={`quiz-result ${result.passed ? 'passed' : 'failed'}`}>
          <div className="result-icon">{result.passed ? '🎉' : '😞'}</div>
          <div className="result-info">
            <h2>{result.passed ? 'Congratulations! You Passed!' : 'Unfortunately, You Did Not Pass'}</h2>
            <p>Score: <strong>{result.score}/{result.totalMarks}</strong> ({Math.round((result.score / result.totalMarks) * 100)}%)</p>
            <p>Passing marks: {assessment.passingMarks || Math.ceil(result.totalMarks * 0.5)}</p>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="quiz-question glass-card">
        <div className="question-header">
          <span className="question-number">Q{currentQ + 1}</span>
          <span className="question-marks">{question.marks || 1} mark{(question.marks || 1) > 1 ? 's' : ''}</span>
        </div>
        <h3 className="question-text">{question.question}</h3>

        <div className="options-list">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${answers[currentQ] === i ? 'selected' : ''} ${
                submitted
                  ? i === question.correctAnswer
                    ? 'correct'
                    : answers[currentQ] === i
                    ? 'incorrect'
                    : ''
                  : ''
              }`}
              onClick={() => handleSelect(i)}
              disabled={submitted}
              id={`option-${currentQ}-${i}`}
            >
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              <span className="option-text">{opt}</span>
              {submitted && i === question.correctAnswer && <span className="option-check">✓</span>}
              {submitted && answers[currentQ] === i && i !== question.correctAnswer && <span className="option-check">✗</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-nav">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
        >
          ← Previous
        </button>

        <div className="quiz-dots">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`quiz-dot ${i === currentQ ? 'current' : ''} ${answers[i] !== -1 ? 'answered' : ''}`}
              onClick={() => setCurrentQ(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentQ(currentQ + 1)}
          >
            Next →
          </button>
        ) : !submitted ? (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={answeredCount < questions.length}
            id="submit-quiz-btn"
          >
            Submit Assessment
          </button>
        ) : (
          <div></div>
        )}
      </div>

      <style jsx>{`
        .quiz-player {
          max-width: 800px;
          margin: 0 auto;
        }

        .quiz-progress-section {
          margin-bottom: 1.5rem;
        }

        .quiz-progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .quiz-result {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          margin-bottom: 1.5rem;
          animation: scaleIn 0.3s ease-out;
        }

        .quiz-result.passed {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .quiz-result.failed {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .result-icon {
          font-size: 3rem;
        }

        .result-info h2 {
          font-size: 1.15rem;
          margin-bottom: 0.25rem;
        }

        .result-info p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0.15rem 0;
        }

        .quiz-question {
          margin-bottom: 1.5rem;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .question-number {
          background: var(--primary-600);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 700;
        }

        .question-marks {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .question-text {
          font-size: 1.1rem;
          font-weight: 600;
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--bg-input);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.9rem;
          text-align: left;
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .option-btn:hover:not(:disabled) {
          border-color: var(--primary-500);
          background: rgba(99, 102, 241, 0.08);
        }

        .option-btn.selected {
          border-color: var(--primary-500);
          background: rgba(99, 102, 241, 0.12);
        }

        .option-btn.correct {
          border-color: var(--success-500) !important;
          background: rgba(16, 185, 129, 0.12) !important;
        }

        .option-btn.incorrect {
          border-color: var(--danger-500) !important;
          background: rgba(239, 68, 68, 0.12) !important;
        }

        .option-letter {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: rgba(99, 102, 241, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--primary-400);
          flex-shrink: 0;
        }

        .option-text {
          flex: 1;
        }

        .option-check {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .quiz-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .quiz-dots {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .quiz-dot {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          color: var(--text-secondary);
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quiz-dot.current {
          border-color: var(--primary-500);
          background: var(--primary-600);
          color: white;
        }

        .quiz-dot.answered {
          background: rgba(16, 185, 129, 0.2);
          border-color: var(--success-500);
          color: var(--success-400);
        }
      `}</style>
    </div>
  );
}
