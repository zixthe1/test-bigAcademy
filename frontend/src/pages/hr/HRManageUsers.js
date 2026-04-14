import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, X, UserMinus } from 'lucide-react';

export default function HRManageUsers({ isExecutive }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState({ text: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({
    email: '', first_name: '', last_name: '',
    role: 'educator', phone_number: '', password: ''
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = () => {
    API.get('/users/')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users/register/', form);
      setMessage({ text: 'User registered successfully.', type: 'success' });
      setShowForm(false);
      setForm({ email: '', first_name: '', last_name: '', role: 'educator', phone_number: '', password: '' });
      fetchUsers();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Registration failed.', type: 'error' });
    }
  };

  const handleOffboard = async (u) => {
    if (!window.confirm(`Offboard ${u.first_name} ${u.last_name}?`)) return;
    try {
      await API.patch(`/users/${u.id}/offboard/`, { offboard_type: 'disabled' });
      setMessage({ text: `${u.first_name} ${u.last_name} has been offboarded.`, type: 'success' });
      fetchUsers();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Could not offboard user.', type: 'error' });
    }
  };

  const canOffboard = (targetUser) => {
    if (targetUser.email === currentUser.email) return false;
    if (targetUser.role === 'hr' && !isExecutive) return false;
    return true;
  };

  const roleBadge = (role) => {
    const config = {
      'hr':             { bg: '#fef2f2', color: '#ef4444', border: '#fecaca', label: 'HR'             },
      'area_manager':   { bg: '#fefce8', color: '#d97706', border: '#fde68a', label: 'Area Manager'   },
      'branch_manager': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Branch Manager' },
      'educator':       { bg: '#f0fdf4', color: '#059669', border: '#bbf7d0', label: 'Educator'       },
    };
    const c = config[role] || { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: role };
    return (
      <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
        {c.label}
      </span>
    );
  };

  const S = {
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
    },
    title: { fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' },
    onboardBtn: (isOpen) => ({
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600',
      cursor: 'pointer', border: 'none',
      background: isOpen ? '#f1f5f9' : '#1a1f8c',
      color: isOpen ? '#64748b' : '#fff',
      transition: 'all 0.15s',
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
    formRow:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' },
    label:     { fontSize: '0.78rem', fontWeight: '600', color: '#374151' },
    input:     { padding: '9px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#1e293b', outline: 'none', fontFamily: 'inherit' },
    select:    { padding: '9px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#1e293b', outline: 'none', fontFamily: 'inherit', background: '#fff' },
    submitBtn: { padding: '9px 20px', background: '#1a1f8c', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
    th: { padding: '12px 16px', fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' },
    td: { padding: '12px 16px', fontSize: '0.875rem', color: '#334155', borderBottom: '1px solid #f8fafc' },
    nameCell: { fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' },
    execBadge: { fontSize: '0.62rem', fontWeight: '700', padding: '2px 6px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' },
    statusBadge: (active) => ({
      fontSize: '0.72rem', fontWeight: '600', padding: '3px 9px', borderRadius: '20px',
      background: active ? '#f0fdf4' : '#f8fafc',
      color:      active ? '#059669' : '#94a3b8',
      border:     `1px solid ${active ? '#bbf7d0' : '#e2e8f0'}`,
    }),
    offboardBtn: {
      padding: '5px 12px', fontSize: '0.78rem', fontWeight: '600',
      background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca',
      borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px',
    },
  };

  if (loading) return <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading users...</p>;

  return (
    <div>
      <div style={S.header}>
        <div style={S.title}>
          <Users size={18} color="#1a1f8c" />
          Users
        </div>
        <button style={S.onboardBtn(showForm)} onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Onboard User</>}
        </button>
      </div>

      {message.text && <div style={S.message(message.type)}>{message.text}</div>}

      {/* Register Form */}
      {showForm && (
        <div style={S.formCard}>
          <div style={S.formTitle}>Onboard New User</div>
          <form onSubmit={handleRegister}>
            <div style={S.formRow}>
              <div style={S.formGroup}>
                <label style={S.label}>First Name</label>
                <input style={S.input} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Last Name</label>
                <input style={S.input} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required />
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Email</label>
              <input type="email" style={S.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div style={S.formRow}>
              <div style={S.formGroup}>
                <label style={S.label}>Role</label>
                <select style={S.select} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="educator">Educator</option>
                  <option value="branch_manager">Branch Manager</option>
                  <option value="area_manager">Area Manager</option>
                  <option value="hr">HR</option>
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Phone Number</label>
                <input style={S.input} value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} />
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Password</label>
              <input type="password" style={S.input} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" style={S.submitBtn}>Onboard User</button>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Name', 'Email', 'Role', 'Location', 'Last Login', 'Status', 'Actions'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={S.td}>
                  <div style={S.nameCell}>
                    {u.first_name} {u.last_name}
                    {u.role === 'hr' && u.is_hr_executive && (
                      <span style={S.execBadge}>Executive</span>
                    )}
                  </div>
                </td>
                <td style={{ ...S.td, color: '#64748b', fontSize: '0.82rem' }}>{u.email}</td>
                <td style={S.td}>{roleBadge(u.role)}</td>
                <td style={{ ...S.td, color: '#64748b' }}>{u.location ? u.location.name : '—'}</td>
                <td style={{ ...S.td, color: '#64748b' }}>{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}</td>
                <td style={S.td}>
                  <span style={S.statusBadge(u.status === 'active')}>{u.status}</span>
                </td>
                <td style={S.td}>
                  {canOffboard(u) ? (
                    <button style={S.offboardBtn} onClick={() => handleOffboard(u)}>
                      <UserMinus size={12} /> Offboard
                    </button>
                  ) : (
                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}