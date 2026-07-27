import { useState, useEffect } from 'react';
import { Award, Target, Flag } from 'lucide-react';
import axios from 'axios';

const About = () => {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get('/api/coaches');
        setStaff(response.data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    fetchStaff();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <div style={{ height: '40vh', background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url(https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1920&q=80) center/cover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '3rem', color: 'white' }}>About Our Team</h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 5%' }}>
        {/* Mission & Vision */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '5rem' }}>
          <div className="card">
            <Target size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>Our Mission</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
              To cultivate an environment of excellence where athletes can reach their absolute maximum potential. We provide world-class coaching, cutting-edge analytics, and unwavering support to build champions both on and off the field.
            </p>
          </div>
          <div className="card">
            <Flag size={32} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>Our Vision</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
              To be recognized globally as the premier athletic development institution, consistently producing top-tier athletes while fostering a culture of integrity, sportsmanship, and continuous improvement.
            </p>
          </div>
        </div>

        {/* History */}
        <div style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Our History</h2>
          <div className="card" style={{ padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.125rem' }}>
              Founded in 2010, AthleticPro started as a small group of dedicated runners aiming to qualify for regional championships. Over the past decade, we have evolved into a comprehensive athletic program encompassing track and field, endurance events, and strength conditioning.
              <br /><br />
              Our commitment to science-backed training methodologies has led to unprecedented growth, turning local talents into national and international competitors. Today, we stand proud with over 50 championships and a growing community of elite athletes.
            </p>
          </div>
        </div>

        {/* Achievements Statistics */}
        <div style={{ marginBottom: '5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          <div className="card" style={{ textAlign: 'center', background: 'var(--primary)', color: 'white' }}>
            <Award size={40} style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '0.5rem' }}>10+</h3>
            <p style={{ opacity: 0.9 }}>Years of Excellence</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>50+</h3>
            <p style={{ color: 'var(--text-muted)' }}>Athletes Trained</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--success)', marginBottom: '0.5rem' }}>14</h3>
            <p style={{ color: 'var(--text-muted)' }}>Gold Medals</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>5</h3>
            <p style={{ color: 'var(--text-muted)' }}>National Medalists</p>
          </div>
        </div>

        {/* Coaching Staff */}
        <div style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Coaching Staff</h2>
          <div className="grid-cards">
            {staff.map(member => (
              <div key={member.id} className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <img src={member.img ? `${API_BASE_URL}${member.img}` : 'https://images.unsplash.com/photo-1552674605-15caff8d65e9?auto=format&fit=crop&w=400&q=80'} alt={member.name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem', border: '4px solid var(--bg-color)' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>{member.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: '500' }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
