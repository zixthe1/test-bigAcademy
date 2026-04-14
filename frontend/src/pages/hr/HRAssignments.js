import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { ClipboardList, Plus, X, Trash2, Calendar } from 'lucide-react';

export default function HRAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses]         = useState([]);
  const [staff, setStaff]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [message, setMessage]         = useState({ text: '', type: '' });
  const [showForm, setShowForm]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [form, setForm]               = useState({
    course_id: '', assignment_type: 'all',
    target_value: '', mandatory: true, due_at: '',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [assignRes, courseRes, staffRes] = await Promise.all([
        API.get('/assignments/'),
        API.get('/courses/'),
        API.get('/users/'),
      ]);
      setAssignments(assignRes.data);
      setCourses(courseRes.data.filter(c => c.status === 'published'));
      setStaff(staffRes.data.filter(u => u.role === 'educator'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/assignments/create/', form);
      showMsg('Course assigned successfully.');
      setShowForm(false);
      setForm({ course_id: '', assignment_type: 'all', target_value: '', mandatory: true, due_at: '' });
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.error || 'Could not create assignment.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Remove assignment for "${assignment.course_title}"?`)) return;
    try {
      await API.delete(`/assignments/${assignment.id}/delete/`);
      showMsg('Assignment removed.');
      fetchData();
    } catch (err) {
      showMsg('Could not remove assignment.', 'error');
    }
  };

  const S = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title:  { fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' },
    newBtn: (isOpen) => ({
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600',
      cursor: 'pointer', border: 'none',
      background: isOpen ? '#f1f5f9' : '#1a1f8c',
      color: isOpen ? '#64748b' : '#fff',
    }),
    message: (type) => ({
      padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
      fontSize: '0.85rem', fontWeight: '500',
      background: type === 'success' ? '#f0fdf4' : '#fef2f2',
      color:      type === 'success' ? '#059669' : '#ef4444',
      border:     `1px solid ${type === 'success' ? '#bbf7d0' : '#fecaca'}`,
    }),
    formCard: {
      background: '#fff', borderRadius: '12px', padding: '24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', marginBottom: '20px',
    },
    formTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '18px' },
    formGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label:     { fontSize: '0.78rem', fontWeight: '600', color: '#374151' },
    input:     { padding: '9px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#1e293b', outline: 'none', fontFamily: 'inherit' },
    select:    { padding: '9px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#1e293b', outline: 'none', fontFamily: 'inherit', background: '#fff' },
    checkRow:  { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
    submitBtn: { padding: '9px 20px', background: '#1a1f8c', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
    table:     { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
    th:        { padding: '12px 16px', fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' },
    td:        { padding: '13px 16px', fontSize: '0.875rem', color: '#334155', borderBottom: '1px solid #f8fafc' },
    nameTd:    { fontWeight: '600', color: '#0f172a' },
    badge: (bg, color, border, label) => (
      <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', background: bg, color, border: `1px solid ${border}` }}>{label}</span>
    ),
    deleteBtn: {
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '5px 10px', fontSize: '0.78rem', fontWeight: '600',
      background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca',
      borderRadius: '6px', cursor: 'pointer',
    },
    emptyState: { textAlign: 'center', padding: '48px 24px', color: '#94a3b8' },
  };

  const assignmentLabel = (a) => {
    if (a.assignment_type === 'all') return S.badge('#eff6ff', '#2563eb', '#bfdbfe', 'All Staff');
    if (a.assignment_type === 'user') {
      const member = staff.find(s => String(s.id) === String(a.target_value));
      return S.badge('#f0fdf4', '#059669', '#bbf7d0', member ? `${member.first_name} ${member.last_name}` : `User #${a.target_value}`);
    }
    return S.badge('#f8fafc', '#64748b', '#e2e8f0', a.target_value);
  };

  if (loading) return <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading assignments...</p>;

  return (
    <div>
      <div style={S.header}>
        <div style={S.title}><ClipboardList size={18} color="#1a1f8c" /> Course Assignments</div>
        <button style={S.newBtn(showForm)} onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Assignment</>}
        </button>
      </div>

      {message.text && <div style={S.message(message.type)}>{message.text}</div>}

      {showForm && (
        <div style={S.formCard}>
          <div style={S.formTitle}>Assign Course</div>
          <form onSubmit={handleSubmit}>
            <div style={S.formGrid}>
              <div style={S.formGroup}>
                <label style={S.label}>Course</label>
                <select style={S.select} value={form.course_id}
                  onChange={e => setForm({ ...form, course_id: e.target.value })} required>
                  <option value="">Select a course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Assign To</label>
                <select style={S.select} value={form.assignment_type}
                  onChange={e => setForm({ ...form, assignment_type: e.target.value, target_value: '' })}>
                  <option value="all">All Staff</option>
                  <option value="user">Individual</option>
                </select>
              </div>
            </div>

            {form.assignment_type === 'user' && (
              <div style={{ ...S.formGroup, marginBottom: '14px' }}>
                <label style={S.label}>Select Staff Member</label>
                <select style={S.select} value={form.target_value}
                  onChange={e => setForm({ ...form, target_value: e.target.value })} required>
                  <option value="">Select a person...</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
              </div>
            )}

            <div style={S.formGrid}>
              <div style={S.formGroup}>
                <label style={S.label}>Due Date (optional)</label>
                <input type="date" style={S.input} value={form.due_at}
                  onChange={e => setForm({ ...form, due_at: e.target.value })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                  <input type="checkbox" checked={form.mandatory}
                    onChange={e => setForm({ ...form, mandatory: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#1a1f8c' }} />
                  Mandatory
                </label>
              </div>
            </div>

            <button type="submit" style={S.submitBtn} disabled={saving}>
              {saving ? 'Assigning...' : 'Assign Course'}
            </button>
          </form>
        </div>
      )}

      {assignments.length === 0 ? (
        <div style={S.emptyState}>
          <ClipboardList size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '0.9rem' }}>No assignments yet. Create one above.</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Course', 'Assigned To', 'Mandatory', 'Due Date', 'Actions'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>
                  <td style={{ ...S.td, ...S.nameTd }}>{a.course_title}</td>
                  <td style={S.td}>{assignmentLabel(a)}</td>
                  <td style={S.td}>
                    {a.mandatory
                      ? S.badge('#fef2f2', '#ef4444', '#fecaca', 'Mandatory')
                      : S.badge('#f8fafc', '#64748b', '#e2e8f0', 'Optional')}
                  </td>
                  <td style={S.td}>
                    {a.due_at ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.82rem' }}>
                        <Calendar size={12} />
                        {new Date(a.due_at).toLocaleDateString()}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={S.td}>
                    <button style={S.deleteBtn} onClick={() => handleDelete(a)}>
                      <Trash2 size={12} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}