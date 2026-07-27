import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Mail, Settings, LogOut, Sun, Moon, ClipboardList, Trophy } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Avatar from '../components/Avatar';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          JCT<span style={{ color: 'var(--primary)' }}> Athletic</span>
        </div>
        
        <nav style={{ flex: 1, marginTop: '2rem' }}>
          <Link to="/admin" className={`nav-link nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/players" className={`nav-link nav-item ${location.pathname.includes('/admin/players') ? 'active' : ''}`}>
            <Users size={20} /> Players
          </Link>
          <Link to="/admin/coaches" className={`nav-link nav-item ${location.pathname.includes('/admin/coaches') ? 'active' : ''}`}>
            <UserCog size={20} /> Coaches
          </Link>
          <Link to="/admin/messages" className={`nav-link nav-item ${location.pathname.includes('/admin/messages') ? 'active' : ''}`}>
            <Mail size={20} /> Messages
          </Link>
          <Link to="/admin/audit-logs" className={`nav-link nav-item ${location.pathname.includes('/admin/audit-logs') ? 'active' : ''}`}>
            <ClipboardList size={20} /> Audit Logs
          </Link>
          <Link to="/admin/settings" className={`nav-link nav-item ${location.pathname.includes('/admin/settings') ? 'active' : ''}`}>
            <Settings size={20} /> Settings
          </Link>
          <Link to="/admin/competitions" className={`nav-link nav-item ${location.pathname.includes('/admin/competitions') ? 'active' : ''}`}>
            <Trophy size={20} /> Competitions
          </Link>
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '0 1rem' }}>
          <a href="#" onClick={handleLogout} className="nav-item" style={{ color: '#F43F5E' }}>
            <LogOut size={20} /> Logout
          </a>
        </div>
      </aside>

      <main className="dashboard-content" style={{ backgroundColor: 'var(--bg-color)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Admin Portal</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {(() => {
              const userString = localStorage.getItem('user');
              const user = userString ? JSON.parse(userString) : { name: 'Admin User' };
              return (
                <>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: '600' }}>{user.name}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Administrator</p>
                  </div>
                  <Avatar user={user} size={40} />
                </>
              );
            })()}
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
