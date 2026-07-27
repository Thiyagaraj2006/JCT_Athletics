import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, ClipboardList, Activity, Calendar, User, LogOut, Sun, Moon, MessageSquare, Trophy } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Avatar from '../components/Avatar';

const CoachLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
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
          <Link to="/coach" className={`nav-link nav-item ${location.pathname === '/coach' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/coach/players" className={`nav-link nav-item ${location.pathname.includes('/coach/players') ? 'active' : ''}`}>
            <Users size={20} /> Players
          </Link>
          <Link to="/coach/assign-workout" className={`nav-link nav-item ${location.pathname.includes('/coach/assign-workout') ? 'active' : ''}`}>
            <PlusCircle size={20} /> Assign Workout
          </Link>
          <Link to="/coach/submissions" className={`nav-link nav-item ${location.pathname.includes('/coach/submissions') ? 'active' : ''}`}>
            <ClipboardList size={20} /> Submissions
          </Link>
          <Link to="/coach/messages" className={`nav-link nav-item ${location.pathname.includes('/coach/messages') ? 'active' : ''}`}>
            <MessageSquare size={20} /> Messages
          </Link>
          <Link to="/coach/calendar" className={`nav-link nav-item ${location.pathname.includes('/coach/calendar') ? 'active' : ''}`}>
            <Calendar size={20} /> Calendar
          </Link>
          <Link to="/coach/profile" className={`nav-link nav-item ${location.pathname.includes('/coach/profile') ? 'active' : ''}`}>
            <User size={20} /> Profile
          </Link>
          <Link 
            to="/coach/competitions" 
            className={`nav-link nav-item ${location.pathname === '/coach/competitions' ? 'active' : ''}`}
          >
            <Trophy size={20} /> Log Competitions
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
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Coach Portal</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {(() => {
              const userString = localStorage.getItem('user');
              const user = userString ? JSON.parse(userString) : { name: 'Coach', specialty: 'General' };
              return (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: '600' }}>{user.name}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.specialty || 'Head Coach'}</p>
                </div>
              );
            })()}
            {(() => {
              const userString = localStorage.getItem('user');
              const user = userString ? JSON.parse(userString) : { name: 'Coach' };
              return <Avatar user={user} size={40} />;
            })()}
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default CoachLayout;
