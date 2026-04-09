import React, { useEffect, useState } from 'react';
import API from '../../api/axios';

export default function AdminCourseBuilder({ course, onBack }) {
  const [modules, setModules]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [message, setMessage]         = useState('');
  const [expandedModule, setExpanded] = useState(null);

  // Module form
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleForm, setModuleForm]         = useState({ title: '', sort_order: 1 });
  const [savingModule, setSavingModule]     = useState(false);
  const [editingModule, setEditingModule]   = useState(null);

  // Lesson form
  const [activeLessonModule, setActiveLessonModule] = useState(null);
  const [lessonForm, setLessonForm]                 = useState({
    title: '', content_type: 'video', content_url: '', duration_seconds: '', sort_order: 1
  });
  const [savingLesson, setSavingLesson]   = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  // Quiz form
  const [activeQuizModule, setActiveQuizModule] = useState(null);
  const [quizForm, setQuizForm]                 = useState({
    title: '', pass_mark_percent: 80, attempt_limit: 3
  });
  const [savingQuiz, setSavingQuiz]   = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Question form
  const [activeQuestionQuiz, setActiveQuestionQuiz]   = useState(null);
  const [questionForm, setQuestionForm]               = useState({
    question_text: '', question_type: 'mcq', sort_order: 1
  });
  const [savingQuestion, setSavingQuestion]     = useState(false);
  const [editingQuestion, setEditingQuestion]   = useState(null);
  const [expandedQuiz, setExpandedQuiz]         = useState(null);

  // Option form
  const [activeOptionQuestion, setActiveOptionQuestion] = useState(null);
  const [optionForm, setOptionForm]                     = useState({
    option_text: '', is_correct: false, sort_order: 1
  });
  const [savingOption, setSavingOption]   = useState(false);
  const [editingOption, setEditingOption] = useState(null);

  useEffect(() => { fetchModules(); }, []);

  const fetchModules = async () => {
    try {
      const res = await API.get(`/courses/${course.id}/`);
      setModules(res.data.modules || []);
      if (res.data.modules?.length > 0) setExpanded(res.data.modules[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const confirmDelete = (label) => window.confirm(`Delete "${label}"? This cannot be undone.`);

  // ── Module ───────────────────────────────────────────────
  const handleAddModule = async (e) => {
    e.preventDefault();
    setSavingModule(true);
    try {
      await API.post(`/courses/${course.id}/modules/`, moduleForm);
      showMessage('Module added.');
      setModuleForm({ title: '', sort_order: modules.length + 2 });
      setShowModuleForm(false);
      fetchModules();
    } catch { showMessage('Could not add module.'); }
    finally { setSavingModule(false); }
  };

  const handleEditModule = async (e) => {
    e.preventDefault();
    setSavingModule(true);
    try {
      await API.patch(`/modules/${editingModule.id}/edit/`, moduleForm);
      showMessage('Module updated.');
      setEditingModule(null);
      fetchModules();
    } catch { showMessage('Could not update module.'); }
    finally { setSavingModule(false); }
  };

  const handleDeleteModule = async (module) => {
    if (!confirmDelete(module.title)) return;
    try {
      await API.delete(`/modules/${module.id}/delete/`);
      showMessage('Module deleted.');
      fetchModules();
    } catch { showMessage('Could not delete module.'); }
  };

  // ── Lesson ───────────────────────────────────────────────
  const handleAddLesson = async (e) => {
    e.preventDefault();
    setSavingLesson(true);
    try {
      await API.post(`/modules/${activeLessonModule}/lessons/`, lessonForm);
      showMessage('Lesson added.');
      setLessonForm({ title: '', content_type: 'video', content_url: '', duration_seconds: '', sort_order: 1 });
      setActiveLessonModule(null);
      fetchModules();
    } catch { showMessage('Could not add lesson.'); }
    finally { setSavingLesson(false); }
  };

  const handleEditLesson = async (e) => {
    e.preventDefault();
    setSavingLesson(true);
    try {
      await API.patch(`/lessons/${editingLesson.id}/edit/`, lessonForm);
      showMessage('Lesson updated.');
      setEditingLesson(null);
      fetchModules();
    } catch { showMessage('Could not update lesson.'); }
    finally { setSavingLesson(false); }
  };

  const handleDeleteLesson = async (lesson) => {
    if (!confirmDelete(lesson.title)) return;
    try {
      await API.delete(`/lessons/${lesson.id}/delete/`);
      showMessage('Lesson deleted.');
      fetchModules();
    } catch { showMessage('Could not delete lesson.'); }
  };

  // ── Quiz ─────────────────────────────────────────────────
  const handleAddQuiz = async (e) => {
    e.preventDefault();
    setSavingQuiz(true);
    try {
      await API.post(`/courses/${course.id}/quizzes/`, quizForm);
      showMessage('Quiz added.');
      setQuizForm({ title: '', pass_mark_percent: 80, attempt_limit: 3 });
      setActiveQuizModule(null);
      fetchModules();
    } catch { showMessage('Could not add quiz.'); }
    finally { setSavingQuiz(false); }
  };

  const handleEditQuiz = async (e) => {
    e.preventDefault();
    setSavingQuiz(true);
    try {
      await API.patch(`/quizzes/${editingQuiz.id}/edit/`, quizForm);
      showMessage('Quiz updated.');
      setEditingQuiz(null);
      fetchModules();
    } catch { showMessage('Could not update quiz.'); }
    finally { setSavingQuiz(false); }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!confirmDelete(quiz.title)) return;
    try {
      await API.delete(`/quizzes/${quiz.id}/delete/`);
      showMessage('Quiz deleted.');
      fetchModules();
    } catch { showMessage('Could not delete quiz.'); }
  };

  // ── Question ─────────────────────────────────────────────
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setSavingQuestion(true);
    try {
      await API.post(`/quizzes/${activeQuestionQuiz.id}/questions/`, questionForm);
      showMessage('Question added.');
      setQuestionForm({ question_text: '', question_type: 'mcq', sort_order: 1 });
      fetchModules();
    } catch { showMessage('Could not add question.'); }
    finally { setSavingQuestion(false); }
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    setSavingQuestion(true);
    try {
      await API.patch(`/questions/${editingQuestion.id}/edit/`, questionForm);
      showMessage('Question updated.');
      setEditingQuestion(null);
      fetchModules();
    } catch { showMessage('Could not update question.'); }
    finally { setSavingQuestion(false); }
  };

  const handleDeleteQuestion = async (question) => {
    if (!confirmDelete(question.question_text)) return;
    try {
      await API.delete(`/questions/${question.id}/delete/`);
      showMessage('Question deleted.');
      fetchModules();
    } catch { showMessage('Could not delete question.'); }
  };

  // ── Option ───────────────────────────────────────────────
  const handleAddOption = async (e) => {
    e.preventDefault();
    setSavingOption(true);
    try {
      await API.post(`/questions/${activeOptionQuestion.id}/options/`, optionForm);
      showMessage('Option added.');
      setOptionForm({ option_text: '', is_correct: false, sort_order: 1 });
      fetchModules();
    } catch { showMessage('Could not add option.'); }
    finally { setSavingOption(false); }
  };

  const handleEditOption = async (e) => {
    e.preventDefault();
    setSavingOption(true);
    try {
      await API.patch(`/options/${editingOption.id}/edit/`, optionForm);
      showMessage('Option updated.');
      setEditingOption(null);
      fetchModules();
    } catch { showMessage('Could not update option.'); }
    finally { setSavingOption(false); }
  };

  const handleDeleteOption = async (option) => {
    if (!confirmDelete(option.option_text)) return;
    try {
      await API.delete(`/options/${option.id}/delete/`);
      showMessage('Option deleted.');
      fetchModules();
    } catch { showMessage('Could not delete option.'); }
  };

  const contentTypeIcon = (type) => {
    if (type === 'video')   return '🎬';
    if (type === 'pdf')     return '📄';
    if (type === 'article') return '📰';
    if (type === 'text')    return '📝';
    return '📁';
  };

  const lessonFormFields = (
    <div>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Lesson Title</label>
          <input className="form-control" value={lessonForm.title}
            onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
            placeholder="e.g. Introduction Video" required />
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label">Content Type</label>
          <select className="form-select" value={lessonForm.content_type}
            onChange={e => setLessonForm({ ...lessonForm, content_type: e.target.value })}>
            <option value="video">Video (YouTube)</option>
            <option value="pdf">PDF</option>
            <option value="article">Article</option>
            <option value="text">Text</option>
          </select>
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label">Duration (seconds)</label>
          <input type="number" className="form-control" value={lessonForm.duration_seconds}
            onChange={e => setLessonForm({ ...lessonForm, duration_seconds: e.target.value })}
            placeholder="e.g. 300" />
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">
          {lessonForm.content_type === 'video' ? 'YouTube Embed URL' :
           lessonForm.content_type === 'pdf'   ? 'PDF URL' : 'Content'}
        </label>
        {lessonForm.content_type === 'text' || lessonForm.content_type === 'article' ? (
          <textarea className="form-control" rows={4} value={lessonForm.content_url}
            onChange={e => setLessonForm({ ...lessonForm, content_url: e.target.value })}
            placeholder="Paste HTML content or text here..." />
        ) : (
          <input className="form-control" value={lessonForm.content_url}
            onChange={e => setLessonForm({ ...lessonForm, content_url: e.target.value })}
            placeholder={lessonForm.content_type === 'video'
              ? 'https://www.youtube.com/embed/...'
              : 'https://example.com/file.pdf'} required />
        )}
      </div>
    </div>
  );

  if (loading) return <p>Loading course content...</p>;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-link ps-0" onClick={onBack}>← Back to Courses</button>
        <div>
          <h4 className="mb-0">{course.title}</h4>
          <small className="text-muted">Course Content Builder</small>
        </div>
      </div>

      {message && <div className="alert alert-info py-2 mb-3">{message}</div>}

      {/* Add Module Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Modules</h5>
        <button className="btn btn-primary btn-sm"
          onClick={() => {
            setShowModuleForm(!showModuleForm);
            setEditingModule(null);
            setModuleForm({ title: '', sort_order: modules.length + 1 });
          }}>
          {showModuleForm ? 'Cancel' : '+ Add Module'}
        </button>
      </div>

      {/* Add Module Form */}
      {showModuleForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h6>New Module</h6>
            <form onSubmit={handleAddModule}>
              <div className="mb-3">
                <label className="form-label">Module Title</label>
                <input className="form-control" value={moduleForm.title}
                  onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g. Understanding the Framework" required />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={savingModule}>
                {savingModule ? 'Saving...' : 'Add Module'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Module Form */}
      {editingModule && (
        <div className="card shadow-sm mb-4 border-warning">
          <div className="card-body">
            <h6>Edit Module</h6>
            <form onSubmit={handleEditModule}>
              <div className="mb-3">
                <label className="form-label">Module Title</label>
                <input className="form-control" value={moduleForm.title}
                  onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} required />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-warning btn-sm" disabled={savingModule}>
                  {savingModule ? 'Saving...' : 'Update Module'}
                </button>
                <button type="button" className="btn btn-outline-secondary btn-sm"
                  onClick={() => setEditingModule(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="text-center text-muted py-5">
          <div style={{ fontSize: '2.5rem' }}>📦</div>
          <p>No modules yet. Add your first module above.</p>
        </div>
      ) : (
        <div className="accordion mb-4">
          {modules.map((module, index) => (
            <div className="accordion-item shadow-sm mb-2" key={module.id}>
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${expandedModule !== module.id ? 'collapsed' : ''}`}
                  onClick={() => setExpanded(expandedModule === module.id ? null : module.id)}>
                  <div className="d-flex align-items-center gap-3 w-100 me-3">
                    <span className="badge bg-primary">Module {index + 1}</span>
                    <span>{module.title}</span>
                    <small className="text-muted ms-auto">
                      {module.lessons?.length || 0} lesson(s) · {module.quizzes?.length || 0} quiz
                    </small>
                  </div>
                </button>
              </h2>

              {expandedModule === module.id && (
                <div className="accordion-body">

                  {/* Module Actions */}
                  <div className="d-flex justify-content-end gap-2 mb-3">
                    <button className="btn btn-outline-warning btn-sm"
                      onClick={() => {
                        setEditingModule(module);
                        setModuleForm({ title: module.title, sort_order: module.sort_order });
                        setShowModuleForm(false);
                      }}>
                      ✏️ Edit Module
                    </button>
                    <button className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteModule(module)}>
                      🗑 Delete Module
                    </button>
                  </div>

                  {/* ── LESSONS ── */}
                  <h6 className="text-muted mb-2">Lessons</h6>
                  {module.lessons && module.lessons.length > 0 ? (
                    <ul className="list-group list-group-flush mb-3">
                      {module.lessons.map(lesson => (
                        <li key={lesson.id} className="list-group-item">
                          {editingLesson?.id === lesson.id ? (
                            <form onSubmit={handleEditLesson} className="py-2">
                              {lessonFormFields}
                              <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-warning btn-sm" disabled={savingLesson}>
                                  {savingLesson ? 'Saving...' : 'Update Lesson'}
                                </button>
                                <button type="button" className="btn btn-outline-secondary btn-sm"
                                  onClick={() => setEditingLesson(null)}>Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <span>{contentTypeIcon(lesson.content_type)}</span>
                              <span className="fw-semibold">{lesson.title}</span>
                              <span className="badge bg-secondary ms-1">{lesson.content_type}</span>
                              {lesson.duration_seconds && (
                                <small className="text-muted ms-auto me-2">
                                  {Math.round(lesson.duration_seconds / 60)} mins
                                </small>
                              )}
                              <div className="d-flex gap-1 ms-auto">
                                <button className="btn btn-outline-warning btn-sm"
                                  onClick={() => {
                                    setEditingLesson(lesson);
                                    setLessonForm({
                                      title: lesson.title,
                                      content_type: lesson.content_type,
                                      content_url: lesson.content_url || '',
                                      duration_seconds: lesson.duration_seconds || '',
                                      sort_order: lesson.sort_order
                                    });
                                  }}>✏️</button>
                                <button className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteLesson(lesson)}>🗑</button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted small">No lessons yet.</p>
                  )}

                  {/* Add Lesson Form */}
                  {activeLessonModule === module.id ? (
                    <div className="card border-primary shadow-sm mb-3">
                      <div className="card-body">
                        <h6>Add Lesson</h6>
                        <form onSubmit={handleAddLesson}>
                          {lessonFormFields}
                          <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-success btn-sm" disabled={savingLesson}>
                              {savingLesson ? 'Saving...' : 'Add Lesson'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm"
                              onClick={() => setActiveLessonModule(null)}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-outline-primary btn-sm mb-4"
                      onClick={() => {
                        setActiveLessonModule(module.id);
                        setActiveQuizModule(null);
                        setEditingLesson(null);
                        setLessonForm({ title: '', content_type: 'video', content_url: '', duration_seconds: '', sort_order: 1 });
                      }}>
                      + Add Lesson
                    </button>
                  )}

                  <hr />

                  {/* ── QUIZ ── */}
                  <h6 className="text-muted mb-2">Quiz</h6>
                  {module.quizzes && module.quizzes.length > 0 ? (
                    module.quizzes.map(quiz => (
                      <div key={quiz.id} className="card border-warning mb-3">
                        <div className="card-body">
                          {editingQuiz?.id === quiz.id ? (
                            <form onSubmit={handleEditQuiz}>
                              <div className="row g-2 mb-3">
                                <div className="col-md-6">
                                  <label className="form-label">Quiz Title</label>
                                  <input className="form-control" value={quizForm.title}
                                    onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} required />
                                </div>
                                <div className="col-md-3">
                                  <label className="form-label">Pass Mark (%)</label>
                                  <input type="number" className="form-control" value={quizForm.pass_mark_percent}
                                    onChange={e => setQuizForm({ ...quizForm, pass_mark_percent: e.target.value })}
                                    min={1} max={100} />
                                </div>
                                <div className="col-md-3">
                                  <label className="form-label">Attempt Limit</label>
                                  <input type="number" className="form-control" value={quizForm.attempt_limit}
                                    onChange={e => setQuizForm({ ...quizForm, attempt_limit: e.target.value })}
                                    min={1} />
                                </div>
                              </div>
                              <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-warning btn-sm" disabled={savingQuiz}>
                                  {savingQuiz ? 'Saving...' : 'Update Quiz'}
                                </button>
                                <button type="button" className="btn btn-outline-secondary btn-sm"
                                  onClick={() => setEditingQuiz(null)}>Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div>
                                <span className="fw-bold">📝 {quiz.title}</span>
                                <small className="text-muted ms-2">
                                  Pass mark: {quiz.pass_mark_percent}% · Attempts: {quiz.attempt_limit}
                                </small>
                              </div>
                              <div className="d-flex gap-2">
                                <button className="btn btn-outline-warning btn-sm"
                                  onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}>
                                  {expandedQuiz === quiz.id ? 'Hide Questions' : 'Manage Questions'}
                                </button>
                                <button className="btn btn-outline-warning btn-sm"
                                  onClick={() => {
                                    setEditingQuiz(quiz);
                                    setQuizForm({
                                      title: quiz.title,
                                      pass_mark_percent: quiz.pass_mark_percent,
                                      attempt_limit: quiz.attempt_limit
                                    });
                                  }}>✏️</button>
                                <button className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteQuiz(quiz)}>🗑</button>
                              </div>
                            </div>
                          )}

                          {expandedQuiz === quiz.id && !editingQuiz && (
                            <div className="mt-3">
                              {quiz.questions && quiz.questions.length > 0 ? (
                                <div className="mb-3">
                                  {quiz.questions.map((q, qi) => (
                                    <div key={q.id} className="card mb-2 border-light">
                                      <div className="card-body py-2">
                                        {editingQuestion?.id === q.id ? (
                                          <form onSubmit={handleEditQuestion}>
                                            <div className="row g-2 mb-2">
                                              <div className="col-md-8">
                                                <input className="form-control form-control-sm"
                                                  value={questionForm.question_text}
                                                  onChange={e => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                                                  required />
                                              </div>
                                              <div className="col-md-4">
                                                <select className="form-select form-select-sm"
                                                  value={questionForm.question_type}
                                                  onChange={e => setQuestionForm({ ...questionForm, question_type: e.target.value })}>
                                                  <option value="mcq">Multiple Choice</option>
                                                  <option value="truefalse">True / False</option>
                                                  <option value="short_answer">Short Answer</option>
                                                </select>
                                              </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                              <button type="submit" className="btn btn-warning btn-sm" disabled={savingQuestion}>
                                                {savingQuestion ? 'Saving...' : 'Update'}
                                              </button>
                                              <button type="button" className="btn btn-outline-secondary btn-sm"
                                                onClick={() => setEditingQuestion(null)}>Cancel</button>
                                            </div>
                                          </form>
                                        ) : (
                                          <div>
                                            <div className="d-flex justify-content-between align-items-start">
                                              <div>
                                                <span className="badge bg-secondary me-2">{q.question_type}</span>
                                                <span className="fw-semibold">Q{qi + 1}: {q.question_text}</span>
                                              </div>
                                              <div className="d-flex gap-2">
                                                {(q.question_type === 'mcq' || q.question_type === 'truefalse') && (
                                                  <button className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => {
                                                      setActiveOptionQuestion(activeOptionQuestion?.id === q.id ? null : q);
                                                      setOptionForm({ option_text: '', is_correct: false, sort_order: (q.options?.length || 0) + 1 });
                                                    }}>+ Option</button>
                                                )}
                                                <button className="btn btn-outline-warning btn-sm"
                                                  onClick={() => {
                                                    setEditingQuestion(q);
                                                    setQuestionForm({ question_text: q.question_text, question_type: q.question_type, sort_order: q.sort_order });
                                                  }}>✏️</button>
                                                <button className="btn btn-outline-danger btn-sm"
                                                  onClick={() => handleDeleteQuestion(q)}>🗑</button>
                                              </div>
                                            </div>

                                            {/* Options */}
                                            {q.options && q.options.length > 0 && (
                                              <ul className="mt-2 mb-0 ps-3">
                                                {q.options.map(opt => (
                                                  <li key={opt.id} className="d-flex align-items-center gap-2 mb-1">
                                                    {editingOption?.id === opt.id ? (
                                                      <form onSubmit={handleEditOption} className="d-flex gap-2 align-items-center w-100">
                                                        <input className="form-control form-control-sm"
                                                          value={optionForm.option_text}
                                                          onChange={e => setOptionForm({ ...optionForm, option_text: e.target.value })}
                                                          required />
                                                        <div className="form-check mb-0 ms-2">
                                                          <input className="form-check-input" type="checkbox"
                                                            checked={optionForm.is_correct}
                                                            onChange={e => setOptionForm({ ...optionForm, is_correct: e.target.checked })}
                                                            id={`edit-correct-${opt.id}`} />
                                                          <label className="form-check-label" htmlFor={`edit-correct-${opt.id}`}>Correct</label>
                                                        </div>
                                                        <button type="submit" className="btn btn-warning btn-sm" disabled={savingOption}>
                                                          {savingOption ? '...' : '✓'}
                                                        </button>
                                                        <button type="button" className="btn btn-outline-secondary btn-sm"
                                                          onClick={() => setEditingOption(null)}>✕</button>
                                                      </form>
                                                    ) : (
                                                      <>
                                                        <span className={opt.is_correct ? 'text-success fw-semibold' : 'text-muted'}>
                                                          {opt.is_correct ? '✅ ' : '○ '}{opt.option_text}
                                                        </span>
                                                        <div className="d-flex gap-1 ms-auto">
                                                          <button className="btn btn-outline-warning btn-sm py-0 px-1" style={{ fontSize: '0.7rem' }}
                                                            onClick={() => {
                                                              setEditingOption(opt);
                                                              setOptionForm({ option_text: opt.option_text, is_correct: opt.is_correct });
                                                            }}>✏️</button>
                                                          <button className="btn btn-outline-danger btn-sm py-0 px-1" style={{ fontSize: '0.7rem' }}
                                                            onClick={() => handleDeleteOption(opt)}>🗑</button>
                                                        </div>
                                                      </>
                                                    )}
                                                  </li>
                                                ))}
                                              </ul>
                                            )}

                                            {/* Add Option Form */}
                                            {activeOptionQuestion?.id === q.id && (
                                              <form onSubmit={handleAddOption} className="mt-2 p-2 bg-light rounded">
                                                <div className="row align-items-end g-2">
                                                  <div className="col-md-6">
                                                    <input className="form-control form-control-sm" placeholder="Option text"
                                                      value={optionForm.option_text}
                                                      onChange={e => setOptionForm({ ...optionForm, option_text: e.target.value })} required />
                                                  </div>
                                                  <div className="col-md-3">
                                                    <div className="form-check">
                                                      <input className="form-check-input" type="checkbox"
                                                        checked={optionForm.is_correct}
                                                        onChange={e => setOptionForm({ ...optionForm, is_correct: e.target.checked })}
                                                        id={`correct-${q.id}`} />
                                                      <label className="form-check-label" htmlFor={`correct-${q.id}`}>Correct answer</label>
                                                    </div>
                                                  </div>
                                                  <div className="col-md-3 d-flex gap-1">
                                                    <button type="submit" className="btn btn-success btn-sm" disabled={savingOption}>
                                                      {savingOption ? '...' : 'Add'}
                                                    </button>
                                                    <button type="button" className="btn btn-outline-secondary btn-sm"
                                                      onClick={() => setActiveOptionQuestion(null)}>✕</button>
                                                  </div>
                                                </div>
                                              </form>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted small">No questions yet.</p>
                              )}

                              {/* Add Question Form */}
                              {activeQuestionQuiz?.id === quiz.id ? (
                                <div className="card border-secondary mb-2">
                                  <div className="card-body py-2">
                                    <h6 className="mb-2">Add Question</h6>
                                    <form onSubmit={handleAddQuestion}>
                                      <div className="row g-2 mb-2">
                                        <div className="col-md-8">
                                          <input className="form-control form-control-sm" placeholder="Question text"
                                            value={questionForm.question_text}
                                            onChange={e => setQuestionForm({ ...questionForm, question_text: e.target.value })} required />
                                        </div>
                                        <div className="col-md-4">
                                          <select className="form-select form-select-sm"
                                            value={questionForm.question_type}
                                            onChange={e => setQuestionForm({ ...questionForm, question_type: e.target.value })}>
                                            <option value="mcq">Multiple Choice (MCQ)</option>
                                            <option value="truefalse">True / False</option>
                                            <option value="short_answer">Short Answer</option>
                                          </select>
                                        </div>
                                      </div>
                                      <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-primary btn-sm" disabled={savingQuestion}>
                                          {savingQuestion ? 'Saving...' : 'Add Question'}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary btn-sm"
                                          onClick={() => setActiveQuestionQuiz(null)}>Cancel</button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              ) : (
                                <button className="btn btn-outline-primary btn-sm"
                                  onClick={() => {
                                    setActiveQuestionQuiz(quiz);
                                    setQuestionForm({ question_text: '', question_type: 'mcq', sort_order: (quiz.questions?.length || 0) + 1 });
                                  }}>
                                  + Add Question
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted small mb-2">No quiz yet for this module.</p>
                  )}

                  {/* Add Quiz Form */}
                  {(activeQuizModule === module.id ? (
                    <div className="card border-warning shadow-sm">
                      <div className="card-body">
                        <h6>Add Quiz</h6>
                        <form onSubmit={handleAddQuiz}>
                          <div className="row g-2 mb-3">
                            <div className="col-md-6">
                              <label className="form-label">Quiz Title</label>
                              <input className="form-control" value={quizForm.title}
                                onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
                                placeholder="e.g. Module 1 Knowledge Check" required />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Pass Mark (%)</label>
                              <input type="number" className="form-control" value={quizForm.pass_mark_percent}
                                onChange={e => setQuizForm({ ...quizForm, pass_mark_percent: e.target.value })}
                                min={1} max={100} />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Attempt Limit</label>
                              <input type="number" className="form-control" value={quizForm.attempt_limit}
                                onChange={e => setQuizForm({ ...quizForm, attempt_limit: e.target.value })}
                                min={1} />
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-warning btn-sm" disabled={savingQuiz}>
                              {savingQuiz ? 'Saving...' : 'Add Quiz'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm"
                              onClick={() => setActiveQuizModule(null)}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-outline-warning btn-sm"
                      onClick={() => {
                        setActiveQuizModule(module.id);
                        setActiveLessonModule(null);
                        setQuizForm({ title: '', pass_mark_percent: 80, attempt_limit: 3 });
                      }}>
                      + Add Quiz
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}