import { Outlet, Link, useLocation } from 'react-router-dom';

const PublicLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          JCT <span className="text-gradient">Athletic</span>
        </div>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/about" className={`nav-link ${isActive('/about')}`}>About</Link>
          <Link to="/players" className={`nav-link ${isActive('/players')}`}>Players</Link>
          <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>Leaderboard</Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>Contact</Link>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>AthleticPro</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
              The ultimate team management platform for professional athletes and coaches.
            </p>
          </div>
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/players">Players</Link></li>
              <li><Link to="/leaderboard">Leaderboard</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Legal</h3>
            <ul>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Follow Us</h3>
            <ul>
              <li>Twitter</li>
              <li>Instagram</li>
              <li>Facebook</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} JCT Athletic. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
