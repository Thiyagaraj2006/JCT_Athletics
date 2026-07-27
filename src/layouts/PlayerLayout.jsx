import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, ClipboardList, Activity, User, LogOut, Sun, Moon, Trophy, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Avatar from '../components/Avatar';

const PlayerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const handleLogout = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          JCT <span style={{ color: 'var(--primary)' }}>Athletic</span>
        </div>
        
        <nav style={{ flex: 1, marginTop: '2rem' }}>
          <Link to="/player" className={`nav-link nav-item ${location.pathname === '/player' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/player/today" className={`nav-link nav-item ${location.pathname.includes('/player/today') ? 'active' : ''}`}>
            <CheckSquare size={20} /> Today's Workout
          </Link>
          <Link to="/player/history" className={`nav-link nav-item ${location.pathname.includes('/player/history') ? 'active' : ''}`}>
            <ClipboardList size={20} /> Workout History
          </Link>
          <Link to="/player/performance" className={`nav-link nav-item ${location.pathname.includes('/player/performance') ? 'active' : ''}`}>
            <Activity size={20} /> Performance Center
          </Link>
          <Link to="/player/trophies" className={`nav-link nav-item ${location.pathname.includes('/player/trophies') ? 'active' : ''}`}>
            <Trophy size={20} /> Trophy Cabinet
          </Link>
          <Link to="/player/messages" className={`nav-link nav-item ${location.pathname.includes('/player/messages') ? 'active' : ''}`}>
            <MessageSquare size={20} /> Messages
          </Link>
          <Link to="/player/profile" className={`nav-link nav-item ${location.pathname.includes('/player/profile') ? 'active' : ''}`}>
            <User size={20} /> Profile
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
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Player Portal</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {(() => {
              const userString = localStorage.getItem('user');
              const user = userString ? JSON.parse(userString) : { name: 'Player', specialty: 'General' };
              return (
                <div style={{ textAlign: 'right', display: 'var(--header-text-display, block)' }}>
                  <p style={{ margin: 0, fontWeight: '600' }}>{user.name}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.specialty || 'General'}</p>
                </div>
              );
            })()}
            
            {(() => {
              const userString = localStorage.getItem('user');
              const user = userString ? JSON.parse(userString) : { name: 'Player' };
              return <Avatar user={user} size={40} />;
            })()}
          </div>
        </header>

        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <Link to="/player" className={`bottom-nav-item ${location.pathname === '/player' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Home</span>
        </Link>
        <Link to="/player/today" className={`bottom-nav-item ${location.pathname.includes('/player/today') ? 'active' : ''}`}>
          <CheckSquare size={20} />
          <span>Workout</span>
        </Link>
        <Link to="/player/trophies" className={`bottom-nav-item ${location.pathname.includes('/player/trophies') ? 'active' : ''}`}>
          <Trophy size={20} />
          <span>Trophies</span>
        </Link>
        <Link to="/player/profile" className={`bottom-nav-item ${location.pathname.includes('/player/profile') ? 'active' : ''}`}>
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default PlayerLayout;
