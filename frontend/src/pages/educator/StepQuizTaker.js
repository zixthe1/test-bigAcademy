import React, { useEffect, useState, useRef } from 'react';
import API from '../../api/axios';
import {
  ChevronLeft, CheckCircle, XCircle, Lock, Play,
  Video, Award, AlertCircle, RotateCcw
} from 'lucide-react';

/**
 * StepQuizTaker — VicRoads-style section-by-section quiz
 *
 * Flow per section:
 * 1. Watch video (cannot skip — must wait for full duration)
 * 2. Answer all questions
 * 3. Must get ALL correct to unlock next section
 * 4. If any wrong: "3 out of 4 correct, please try again"
 *
 * Props:
 *   quiz      — quiz object with { id, title, course (with id) }
 *   onBack    — callback to go back to course list
 *   onComplete — callback when quiz is fully completed
 */
export default function StepQuizTaker({ quiz, onBack, onComplete }) {
  const [state, setState]               = useState(null);    // Full attempt state from backend
  const [activeSection, setActiveSection] = useState(null);  // Currently viewed section
  const [questions, setQuestions]         = useState([]);
  const [answers, setAnswers]             = useState({});
  const [submitResult, setSubmitResult]   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');

  // Video state
  const [videoPlaying, setVideoPlaying]   = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [timeLeft, setTimeLeft]           = useState(0);
  const [totalTime, setTotalTime]         = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    startQuiz();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // ── API Calls ──────────────────────────────────────────────
  const startQuiz = async () => {
    try {
      const res = await API.post(`/step-quiz/${quiz.id}/start/`);
      setState(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start quiz.');
      setLoading(false);
    }
  };

  const markVideoWatched = async (moduleId) => {
    try {
      const res = await API.post(`/step-quiz/${state.attempt_id}/sections/${moduleId}/video/`);
      setState(res.data);
      // Update active section
      const updated = res.data.sections.find(s => s.module_id === moduleId);
      if (updated) {
        setActiveSection(updated);
        loadQuestions(moduleId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark video watched.');
    }
  };

  const loadQuestions = async (moduleId) => {
    try {
      const res = await API.get(`/step-quiz/${state.attempt_id}/sections/${moduleId}/questions/`);
      setQuestions(res.data.questions);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load questions.');
    }
  };

  const submitSection = async (moduleId) => {
    setSubmitting(true);
    try {
      const answersList = Object.entries(answers).map(([qId, optId]) => ({
        question_id: Number(qId),
        option_id: optId,
      }));
      const res = await API.post(`/step-quiz/${state.attempt_id}/sections/${moduleId}/submit/`, {
        answers: answersList,
      });
      setSubmitResult(res.data);
      setState(res.data.state);

      if (res.data.passed) {
        // Check if quiz is now complete
        if (res.data.state.status === 'completed') {
          setTimeout(() => onComplete && onComplete(), 100);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit answers.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Video Timer ────────────────────────────────────────────
  const startVideoTimer = (durationSeconds) => {
    const dur = Math.max(durationSeconds || 10, 5);
    setTotalTime(dur);
    setTimeLeft(dur);
    setVideoPlaying(true);
    setVideoFinished(false);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setVideoPlaying(false);
          setVideoFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVideoComplete = (moduleId) => {
    setVideoFinished(false);
    markVideoWatched(moduleId);
  };

  // ── Helpers ────────────────────────────────────────────────
  const openSection = (section) => {
    if (section.status === 'locked') return;
    setActiveSection(section);
    setSubmitResult(null);
    setAnswers({});
    setQuestions([]);
    setVideoPlaying(false);
    setVideoFinished(false);
    if (section.status === 'answer_questions') {
      loadQuestions(section.module_id);
    }
  };

  const retrySection = () => {
    if (!activeSection) return;
    const updated = state.sections.find(s => s.module_id === activeSection.module_id);
    if (updated) setActiveSection({...updated, video_watched: false});
    setSubmitResult(null);
    setAnswers({});
    setQuestions([]);
    setVideoPlaying(false);
    setVideoFinished(false);
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const selectAnswer = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  // ── Loading / Error ────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3 text-muted">Loading assessment...</p>
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
        <button className="btn btn-outline-secondary" onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // QUIZ COMPLETE
  // ══════════════════════════════════════════════════════════
  if (state?.status === 'completed') {
    return (
      <div className="container py-4">
        <div className="text-center py-5">
          <Award size={80} className="text-success mb-3" />
          <h2 className="fw-bold text-dark">Congratulations!</h2>
          <p className="text-muted fs-5 mt-2">
            You have successfully completed <strong>{state.quiz_title}</strong>.
            <br />All {state.total_sections} parts passed.
          </p>
          <div className="bg-success-subtle border border-success rounded-3 p-4 mx-auto mt-4" style={{maxWidth: 400}}>
            <h5 className="text-success fw-bold mb-1">Certificate Unlocked</h5>
            <p className="text-success-emphasis mb-0 small">
              Your completion has been recorded. Check your Certificates tab.
            </p>
          </div>
          <button className="btn btn-primary btn-lg mt-4" onClick={onBack}>
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SUBMIT RESULT SCREEN
  // ══════════════════════════════════════════════════════════
  if (submitResult && activeSection) {
    return (
      <div className="container py-4" style={{maxWidth: 700}}>
        <button className="btn btn-link text-decoration-none p-0 mb-3" onClick={() => {setActiveSection(null); setSubmitResult(null);}}>
          <ChevronLeft size={16} /> Back to Overview
        </button>
        <h5 className="fw-bold">Part {activeSection.sort_order}: {activeSection.module_title}</h5>

        {/* Result banner */}
        <div className={`rounded-3 p-4 text-center mb-4 ${submitResult.passed ? 'bg-success-subtle border border-success' : 'bg-danger-subtle border border-danger'}`}>
          {submitResult.passed
            ? <CheckCircle size={48} className="text-success mb-2" />
            : <XCircle size={48} className="text-danger mb-2" />
          }
          <h4 className={`fw-bold ${submitResult.passed ? 'text-success' : 'text-danger'}`}>
            {submitResult.correct_count} out of {submitResult.total_count} correct
          </h4>
          <p className={`mb-0 ${submitResult.passed ? 'text-success-emphasis' : 'text-danger-emphasis'}`}>
            {submitResult.message}
          </p>
        </div>

        {/* Question breakdown */}
        {submitResult.results.map((r, i) => (
          <div key={r.question_id} className={`card mb-2 border-${r.is_correct ? 'success' : 'danger'}`}>
            <div className="card-body d-flex gap-2 py-3">
              {r.is_correct
                ? <CheckCircle size={20} className="text-success flex-shrink-0 mt-1" />
                : <XCircle size={20} className="text-danger flex-shrink-0 mt-1" />
              }
              <div>
                <div className="fw-semibold small">Q{i+1}: {r.question_text}</div>
                {!r.is_correct && r.correct_option_text && (
                  <div className="text-success small mt-1">Correct answer: {r.correct_option_text}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Action */}
        {submitResult.passed ? (
          <button className="btn btn-success w-100 py-3 fw-bold mt-3" onClick={() => {setActiveSection(null); setSubmitResult(null);}}>
            Continue to Next Part →
          </button>
        ) : (
          <button className="btn btn-danger w-100 py-3 fw-bold mt-3" onClick={retrySection}>
            <RotateCcw size={18} className="me-2" /> Try Again
          </button>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // ACTIVE SECTION — VIDEO + QUESTIONS
  // ══════════════════════════════════════════════════════════
  if (activeSection && state) {
    const needsVideo = (activeSection.status === 'watch_video' || activeSection.status === 'failed') && !activeSection.video_watched;

    return (
      <div className="container py-4" style={{maxWidth: 700}}>
        <button className="btn btn-link text-decoration-none p-0 mb-3" onClick={() => {
          setActiveSection(null);
          if (timerRef.current) clearInterval(timerRef.current);
          setVideoPlaying(false);
        }}>
          <ChevronLeft size={16} /> Back to Overview
        </button>

        <h5 className="fw-bold">Part {activeSection.sort_order}: {activeSection.module_title}</h5>
        <p className="text-muted small">
          Attempt #{activeSection.attempt_count + 1} · {activeSection.question_count} questions
        </p>

        {/* ── VIDEO SECTION ── */}
        {needsVideo && (
          <div className="card mb-4">
            {activeSection.video_url ? (
              <div className="ratio ratio-16x9 bg-dark rounded-top">
                <iframe
                  src={activeSection.video_url + (activeSection.video_url.includes('?') ? '&' : '?') + 'autoplay=0'}
                  allowFullScreen
                  title="Training Video"
                />
              </div>
            ) : (
              <div className="ratio ratio-16x9 bg-dark rounded-top d-flex align-items-center justify-content-center">
                <div className="text-white text-center">
                  <Video size={48} className="mb-2" />
                  <div>Video Tutorial</div>
                </div>
              </div>
            )}

            <div className="card-body text-center">
              {/* Progress bar during playback */}
              {videoPlaying && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>{formatTime(totalTime - timeLeft)}</span>
                    <span className="fw-bold text-primary">{formatTime(timeLeft)} remaining</span>
                    <span>{formatTime(totalTime)}</span>
                  </div>
                  <div className="progress" style={{height: 10}}>
                    <div
                      className="progress-bar bg-primary progress-bar-animated"
                      style={{width: `${((totalTime - timeLeft) / totalTime) * 100}%`, transition: 'width 1s linear'}}
                    />
                  </div>
                  <p className="text-muted small mt-2">
                    <Lock size={14} className="me-1" />
                    Questions will unlock when the video finishes.
                  </p>
                </div>
              )}

              {/* Before watching */}
              {!videoPlaying && !videoFinished && (
                <>
                  <div className="alert alert-warning small d-flex align-items-center gap-2 mb-3">
                    <AlertCircle size={16} />
                    You must watch the complete video before answering questions. No skipping allowed.
                  </div>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => startVideoTimer(activeSection.video_duration_seconds)}
                  >
                    <Play size={18} className="me-2" />
                    Play Video ({formatTime(activeSection.video_duration_seconds || 10)})
                  </button>
                </>
              )}

              {/* After watching */}
              {videoFinished && (
                <>
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
                    <CheckCircle size={16} />
                    <strong>Video Complete — Questions Unlocked!</strong>
                  </div>
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => handleVideoComplete(activeSection.module_id)}
                  >
                    Continue to Questions →
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── QUESTIONS SECTION ── */}
        {activeSection.status === 'answer_questions' && questions.length > 0 && (
          <>
            <div className="alert alert-success small mb-3 text-center">
              <CheckCircle size={14} className="me-1" /> Video watched — answer all questions below
            </div>

            {questions.map((q, i) => (
              <div key={q.id} className="card mb-3">
                <div className="card-body">
                  <div className="text-primary small fw-bold mb-1">
                    Question {i+1} of {questions.length}
                  </div>
                  <div className="fw-bold mb-3">{q.question_text}</div>
                  <div className="d-grid gap-2">
                    {q.options.map(opt => {
                      const selected = answers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => selectAnswer(q.id, opt.id)}
                          className={`btn text-start py-2 px-3 ${
                            selected
                              ? 'btn-primary'
                              : 'btn-outline-secondary'
                          }`}
                        >
                          <span className="d-flex align-items-center gap-2">
                            <span className={`rounded-circle border d-inline-flex align-items-center justify-content-center ${
                              selected ? 'bg-white' : ''
                            }`} style={{width: 20, height: 20, minWidth: 20}}>
                              {selected && <span className="rounded-circle bg-primary" style={{width: 8, height: 8}} />}
                            </span>
                            {opt.option_text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => submitSection(activeSection.module_id)}
              disabled={submitting || Object.keys(answers).length !== questions.length}
              className="btn btn-primary w-100 py-3 fw-bold"
            >
              {submitting ? 'Submitting...' : `Submit All ${questions.length} Answers`}
            </button>
            {Object.keys(answers).length !== questions.length && (
              <p className="text-center text-muted small mt-2">
                Answer all {questions.length} questions to submit ({Object.keys(answers).length}/{questions.length} answered)
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SECTION OVERVIEW (main view)
  // ══════════════════════════════════════════════════════════
  if (!state) return null;

  const statusConfig = {
    locked:           { bg: 'bg-light text-muted',          icon: <Lock size={20} />,        label: 'Locked' },
    watch_video:      { bg: 'bg-primary-subtle text-primary', icon: <Video size={20} />,      label: 'Watch Video →' },
    answer_questions: { bg: 'bg-warning-subtle text-warning', icon: <AlertCircle size={20} />, label: 'Answer Questions →' },
    passed:           { bg: 'bg-success-subtle text-success', icon: <CheckCircle size={20} />, label: 'Passed' },
    failed:           { bg: 'bg-danger-subtle text-danger',   icon: <XCircle size={20} />,     label: 'Try Again →' },
  };

  return (
    <div className="container py-4" style={{maxWidth: 700}}>
      <button className="btn btn-link text-decoration-none p-0 mb-3" onClick={onBack}>
        <ChevronLeft size={16} /> Back to Courses
      </button>

      <h4 className="fw-bold">{state.course_title || state.quiz_title}</h4>
      <p className="text-muted">Complete each part step by step to earn your certification</p>

      {/* Progress */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="progress flex-grow-1" style={{height: 12}}>
          <div
            className="progress-bar bg-success"
            style={{width: `${state.progress_percentage}%`}}
          />
        </div>
        <span className="fw-bold text-success">{state.progress_percentage}%</span>
      </div>

      {/* Section list */}
      <div className="d-grid gap-2">
        {state.sections.map(section => {
          const config = statusConfig[section.status] || statusConfig.locked;
          const clickable = section.status !== 'locked' && section.status !== 'passed';

          return (
            <div
              key={section.module_id}
              onClick={() => clickable && openSection(section)}
              className={`card border ${config.bg} ${clickable ? 'cursor-pointer' : ''}`}
              style={{cursor: clickable ? 'pointer' : 'default'}}
            >
              <div className="card-body d-flex align-items-center justify-content-between py-3">
                <div className="d-flex align-items-center gap-3">
                  {config.icon}
                  <div>
                    <div className="fw-semibold">Part {section.sort_order}: {section.module_title}</div>
                    <div className="small opacity-75">
                      {section.question_count} questions
                      {section.attempt_count > 0 && ` · Attempt #${section.attempt_count}`}
                      {section.status === 'failed' && ` · ${section.correct_count}/${section.total_count} correct`}
                    </div>
                  </div>
                </div>
                <span className="fw-semibold small">{config.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="alert alert-danger mt-3 small">{error}</div>
      )}
    </div>
  );
}
