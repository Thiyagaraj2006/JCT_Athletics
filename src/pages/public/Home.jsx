import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Users, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [featuredPlayers, setFeaturedPlayers] = useState([]);
  const [groupPhotoUrl, setGroupPhotoUrl] = useState('/group-photo.jpg');
  const [stats, setStats] = useState({
    totalTrophies: 50, // default fallback
    totalAthletes: 120, // default fallback
    personalBestsYear: 200 // default fallback
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, statsRes, groupPhotoRes] = await Promise.all([
          axios.get('/api/players'),
          axios.get('/api/admin/dashboard-stats').catch(() => ({ data: {} })), // fallback if fails
          axios.get('/api/group-photos').catch(() => ({ data: null }))
        ]);

        const playersData = playersRes.data || [];
        setFeaturedPlayers(playersData.slice(0, 3)); // Just show top 3

        if (groupPhotoRes.data && groupPhotoRes.data.image_url) {
          setGroupPhotoUrl(groupPhotoRes.data.image_url.startsWith('http') ? groupPhotoRes.data.image_url : `${API_BASE_URL}${groupPhotoRes.data.image_url}`);
        }

        const dashboardStats = statsRes.data || {};
        setStats({
          totalTrophies: dashboardStats.totalTrophies || 50,
          totalAthletes: dashboardStats.totalAthletes || playersData.length || 0,
          personalBestsYear: dashboardStats.personalBestsYear || 200
        });
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Pushing Limits.<br /><span className="text-gradient">Breaking Records.</span></h1>
          <p className="hero-subtitle">The ultimate athletic team dedicated to excellence, perseverance, and championship culture.</p>
          <div className="hero-actions">
            <Link to="/players" className="btn btn-primary">Meet The Team <ArrowRight size={18} style={{ marginLeft: '8px' }} /></Link>
            <Link to="/about" className="btn btn-glass">Our Story</Link>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section style={{ padding: '6rem 5%', backgroundColor: 'var(--bg-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>Elite Performance Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', lineHeight: '1.7' }}>
            We are more than a team; we are a community of dedicated athletes pushing the boundaries of human performance. Our state-of-the-art facilities, world-class coaching staff, and data-driven approach to training ensure that every athlete reaches their full potential.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '3rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <Trophy size={40} color="var(--warning)" style={{ marginBottom: '1rem' }} />
              <h3>50+</h3>
              <p style={{ color: 'var(--text-muted)' }}>Championships</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <Users size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h3>{stats.totalAthletes}</h3>
              <p style={{ color: 'var(--text-muted)' }}>Active Athletes</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <TrendingUp size={40} color="var(--success)" style={{ marginBottom: '1rem' }} />
              <h3>200+</h3>
              <p style={{ color: 'var(--text-muted)' }}>Personal Bests This Year</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Players */}
      <section style={{ padding: '6rem 5%', backgroundColor: '#fff' }}>
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', fontWeight: '700' }}>Featured Athletes</h2>
        <div className="grid-cards" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {featuredPlayers.map(player => (
            <div key={player.id} className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
              <img src={player.img ? `${API_BASE_URL}${player.img}` : 'https://images.unsplash.com/photo-1552674605-15caff8d65e9?auto=format&fit=crop&w=400&q=80'} alt={player.name} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
              <div style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '600' }}>{player.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  <span>{player.event || 'Athlete'}</span>
                  <span>Age: {player.age || 'N/A'}</span>
                </div>
                <Link to={`/players/${player.id}`} className="btn" style={{ width: '100%', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontWeight: '500' }}>View Profile</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Group Photo Section */}
      <section style={{ padding: '5rem 5%', backgroundColor: 'var(--bg-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Our Team</h2>
          <div style={{ borderRadius: '1rem', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            <img src={groupPhotoUrl} alt="Group Photo" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginTop: '2rem', maxWidth: '800px', margin: '2rem auto 0' }}>
            Together we strive for greatness. Our combined strength and shared goals drive us to achieve the extraordinary.
          </p>
        </div>
      </section>

    </div>
  );
};

export default Home;
