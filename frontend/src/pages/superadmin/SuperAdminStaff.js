import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Users, AlertTriangle, MapPin } from 'lucide-react';

export default function SuperAdminStaff() {
  const [staff, setStaff]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterLocation, setFilter] = useState('all');
  const [locations, setLocations]   = useState([]);

  useEffect(() => {
    API.get('/users/')
      .then(res => {
        const users = res.data;
        setStaff(users);
        const locs = [...new Map(
          users
            .filter(u => u.location)
            .map(u => [u.location.name, u.location])
        ).values()];
        setLocations(locs);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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

  const filteredStaff = filterLocation === 'all'
    ? staff
    : staff.filter(u => u.location && u.location.name === filterLocation);

  const S = {
    header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    title:   { fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' },
    select:  { padding: '7px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', outline: 'none', background: '#fff', cursor: 'pointer' },
    summaryRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
    summaryBadge: (bg, color, border) => ({
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
      background: bg, color, border: `1px solid ${border}`,
    }),
    table:  { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
    th:     { padding: '12px 16px', fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' },
    td:     { padding: '13px 16px', fontSize: '0.875rem', color: '#334155', borderBottom: '1px solid #f8fafc' },
    nameTd: { fontWeight: '600', color: '#0f172a' },
    flagBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: '600', padding: '3px 9px', borderRadius: '20px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' },
  };

  if (loading) return <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading staff...</p>;

  return (
    <div>
      <div style={S.header}>
        <div style={S.title}>
          <Users size={18} color="#2563eb" />
          Staff Across My Locations
        </div>
        <select style={S.select} value={filterLocation} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Locations</option>
          {locations.map(loc => (
            <option key={loc.name} value={loc.name}>{loc.name}</option>
          ))}
        </select>
      </div>

      <div style={S.summaryRow}>
        <span style={S.summaryBadge('#eff6ff', '#2563eb', '#bfdbfe')}>
          <Users size={13} /> Total: {filteredStaff.length}
        </span>
        <span style={S.summaryBadge('#fef2f2', '#ef4444', '#fecaca')}>
          <AlertTriangle size={13} /> Quiz Locked: {filteredStaff.filter(u => u.has_locked_quiz).length}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Name', 'Email', 'Role', 'Location', 'Last Login', 'Flags'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(member => (
              <tr key={member.id}>
                <td style={{ ...S.td, ...S.nameTd }}>{member.first_name} {member.last_name}</td>
                <td style={{ ...S.td, color: '#64748b', fontSize: '0.82rem' }}>{member.email}</td>
                <td style={S.td}>{roleBadge(member.role)}</td>
                <td style={S.td}>
                  {member.location ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                      <MapPin size={12} />{member.location.name}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ ...S.td, color: '#64748b' }}>
                  {member.last_login_at ? new Date(member.last_login_at).toLocaleDateString() : 'Never'}
                </td>
                <td style={S.td}>
                  {member.has_locked_quiz ? (
                    <span style={S.flagBadge}>
                      <AlertTriangle size={11} /> Quiz Locked
                    </span>
                  ) : (
                    <span style={{ color: '#cbd5e1' }}>—</span>
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