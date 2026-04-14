import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../api/axios';
import NotificationBell from '../../components/NotificationBell';
import logo from '../../BigChildcare-Logo.png';
import BrowseCourses from '../educator/AssignedCourses';
import MyLearning from '../educator/MyLearning';
import MyCertificates from '../educator/MyCertificates';
import {
  LayoutDashboard, BookOpen, GraduationCap, Award,
  LogOut, ChevronLeft, ChevronRight,
  BookMarked, PlayCircle, CheckCircle,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { key: 'dashboard',    path: '/branch-manager/dashboard',    icon: LayoutDashboard, label: 'Dashboard'        },
  { key: 'courses',      path: '/branch-manager/courses',      icon: BookOpen,        label: 'Assigned Courses' },
  { key: 'learning',     path: '/branch-manager/learning',     icon: GraduationCap,   label: 'My Learning'      },
  { key: 'certificates', path: '/branch-manager/certificates', icon: Award,           label: 'Certificates'     },
];

export default function AdminDashboard() {
  const { user, logout }              = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats]             = useState({ total: 0, active: 0, completed: 0, certificates: 0 });
  const navigate  = useNavigate();
  const location  = useLocation();

  const activeItem = SIDEBAR_ITEMS.find(i => location.pathname.startsWith(i.path)) || SIDEBAR_ITEMS[0];

  useEffect(() => {
    if (location.pathname === '/branch-manager' || location.pathname === '/branch-manager/') {
      navigate('/branch-manager/dashboard', { replace: true });
    }
  }, [location.pathname]);

  useEffect(() => {
    API.get('/my-learning/').then(res => {
      const enrolments = res.data;
      setStats(prev => ({
        ...prev,
        total:     enrolments.length,
        active:    enrolments.filter(e => e.status === 'in_progress').length,
        completed: enrolments.filter(e => e.status === 'completed').length,
      }));
    }).catch(() => {});
    API.get('/certificates/').then(res => {
      setStats(prev => ({ ...prev, certificates: res.data.length }));
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await API.post('/auth/logout/'); } catch (err) {}
    logout();
    navigate('/login');
  };

  const S = {
    layout: {
      display: 'flex', minHeight: '100vh',
      fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    },
    sidebar: {
      width: sidebarOpen ? '240px' : '68px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #2563eb 0%, #29abe2 100%)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s ease',
      overflow: 'hidden', flexShrink: 0,
      boxShadow: '3px 0 16px rgba(37,99,235,0.2)',
    },
    sidebarHeader: {
        padding: '0 12px',
        height: '64px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarOpen ? 'flex-start' : 'center',
        gap: '8px',
    },
    logoText: { color: '#fff', fontWeight: '700', fontSize: '0.95rem', whiteSpace: 'nowrap', lineHeight: 1.2 },
    logoSub:  { color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' },
    toggleBtn: {
      background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
      cursor: 'pointer', padding: '4px', marginLeft: 'auto',
      flexShrink: 0, display: 'flex', alignItems: 'center',
      minWidth: '24px',flexShrink: 0,
    },
    navSection: { padding: '20px 0 8px', flex: 1 },
    navSectionLabel: {
      padding: '0 18px 8px', color: 'rgba(255,255,255,0.35)',
      fontSize: '0.65rem', letterSpacing: '0.1em',
      textTransform: 'uppercase', whiteSpace: 'nowrap',
    },
    navItem: (isActive) => ({
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 18px', cursor: 'pointer',
      color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
      background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
      borderLeft: isActive ? '3px solid #fff' : '3px solid transparent',
      transition: 'all 0.15s ease', whiteSpace: 'nowrap',
      overflow: 'hidden', userSelect: 'none',
    }),
    navText: { fontSize: '0.875rem', fontWeight: '500' },
    sidebarFooter: { padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' },
    userRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', overflow: 'hidden' },
    avatar: {
      width: '34px', height: '34px', borderRadius: '50%',
      background: 'rgba(255,255,255,0.2)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: '700', fontSize: '0.8rem',
      flexShrink: 0, border: '2px solid rgba(255,255,255,0.25)',
    },
    userName: { color: '#fff', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    userRole: { color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' },
    logoutBtn: {
      width: '100%', padding: '8px 12px',
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '7px', color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
      whiteSpace: 'nowrap', overflow: 'hidden',
    },
    main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#e0f2fe' },
    topbar: {
      height: '64px', background: '#fff', borderBottom: '1px solid #bae6fd',
      display: 'flex', alignItems: 'center', padding: '0 28px', gap: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    },
    pageTitle: {
      fontWeight: '700', fontSize: '1rem', color: '#1e293b',
      flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
    },
    locationBadge: {
      fontSize: '0.8rem', color: '#0369a1', fontWeight: '600',
      background: '#e0f2fe', padding: '4px 12px',
      borderRadius: '20px', border: '1px solid #bae6fd',
    },
    content: { flex: 1, padding: '28px', overflowY: 'auto' },
    greetingTitle:    { fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
    greetingSubtitle: { fontSize: '0.875rem', color: '#64748b', marginBottom: '24px' },
    statsGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px', marginBottom: '32px',
    },
    statCard: (accent) => ({
      background: '#fff', borderRadius: '12px', padding: '20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `3px solid ${accent}`,
    }),
    statIconBox: (bg) => ({
      width: '36px', height: '36px', borderRadius: '8px', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
    }),
    statNumber: { fontSize: '2rem', fontWeight: '800', color: '#0f172a', lineHeight: 1, marginBottom: '6px' },
    statLabel:  { fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' },
    sectionLabel: { fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' },
    quickLinksGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' },
    quickLink: {
      background: '#fff', borderRadius: '10px', padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: '14px',
      cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0', transition: 'box-shadow 0.15s',
    },
    quickLinkIconBox: (bg) => ({
      width: '40px', height: '40px', borderRadius: '10px', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }),
    quickLinkTitle: { fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
    quickLinkSub:   { fontSize: '0.75rem', color: '#94a3b8' },
  };

  const ActiveIcon = activeItem?.icon;

  const HomeDashboard = () => (
    <div>
      <div style={S.greetingTitle}>Welcome back, {user.first_name}! 👋</div>
      <div style={S.greetingSubtitle}>Branch Manager — Here's your learning overview</div>

      <div style={S.statsGrid}>
        {[
          { label: 'Total Enrolled', value: stats.total,        Icon: BookMarked,  accent: '#2563eb', iconColor: '#2563eb', iconBg: '#eff6ff' },
          { label: 'Active',         value: stats.active,       Icon: PlayCircle,  accent: '#f59e0b', iconColor: '#f59e0b', iconBg: '#fefce8' },
          { label: 'Completed',      value: stats.completed,    Icon: CheckCircle, accent: '#10b981', iconColor: '#10b981', iconBg: '#f0fdf4' },
          { label: 'Certificates',   value: stats.certificates, Icon: Award,       accent: '#29abe2', iconColor: '#29abe2', iconBg: '#e0f2fe' },
        ].map(stat => (
          <div key={stat.label} style={S.statCard(stat.accent)}>
            <div style={S.statIconBox(stat.iconBg)}>
              <stat.Icon size={18} color={stat.iconColor} />
            </div>
            <div style={S.statNumber}>{stat.value}</div>
            <div style={S.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={S.sectionLabel}>Quick Links</div>
      <div style={S.quickLinksGrid}>
        {[
          { Icon: BookOpen,      bg: '#eff6ff', color: '#2563eb', label: 'Assigned Courses', sub: 'View & enrol in courses',     path: '/branch-manager/courses'      },
          { Icon: GraduationCap, bg: '#e0f2fe', color: '#0369a1', label: 'My Learning',       sub: 'Continue where you left off', path: '/branch-manager/learning'     },
          { Icon: Award,         bg: '#f0fdf4', color: '#059669', label: 'Certificates',      sub: 'Download your certificates',  path: '/branch-manager/certificates' },
        ].map(link => (
          <div key={link.path} style={S.quickLink} onClick={() => navigate(link.path)}>
            <div style={S.quickLinkIconBox(link.bg)}>
              <link.Icon size={18} color={link.color} />
            </div>
            <div>
              <div style={S.quickLinkTitle}>{link.label}</div>
              <div style={S.quickLinkSub}>{link.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={S.layout}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.sidebarHeader}>
          {sidebarOpen ? (
           <>
              <img src={logo} alt="Big Childcare" style={{ width: '48px', height: '44px', objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ overflow: 'hidden', flex: 1 }}>
                 <div style={S.logoText}>Big Academy</div>
                 <div style={S.logoSub}>LMS Portal</div>
              </div>
            </>
         ) : null}
         <button style={S.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
           {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
         </button>
        </div>

        <div style={S.navSection}>
          {sidebarOpen && <div style={S.navSectionLabel}>Navigation</div>}
          {SIDEBAR_ITEMS.map(({ key, path, icon: Icon, label }) => (
            <div key={key} style={S.navItem(location.pathname.startsWith(path))} onClick={() => navigate(path)}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span style={S.navText}>{label}</span>}
            </div>
          ))}
        </div>

        <div style={S.sidebarFooter}>
          <div style={S.userRow}>
            <div style={S.avatar}>{user.first_name[0]}{user.last_name[0]}</div>
            {sidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={S.userName}>{user.first_name} {user.last_name}</div>
                <div style={S.userRole}>Branch Manager</div>
              </div>
            )}
          </div>
          <button style={S.logoutBtn} onClick={handleLogout}>
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        <div style={S.topbar}>
          <div style={S.pageTitle}>
            {ActiveIcon && <ActiveIcon size={18} color="#2563eb" />}
            {activeItem?.label}
          </div>
          <NotificationBell />
          {user.location && <span style={S.locationBadge}>{user.location}</span>}
        </div>

        <div style={S.content}>
          {activeItem?.key === 'dashboard'    && <HomeDashboard />}
          {activeItem?.key === 'courses'      && <BrowseCourses />}
          {activeItem?.key === 'learning'     && <MyLearning />}
          {activeItem?.key === 'certificates' && <MyCertificates />}
        </div>
      </div>
    </div>
  );
}