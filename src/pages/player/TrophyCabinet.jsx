import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Flame, Award, Shield, CheckCircle } from 'lucide-react';
import axios from 'axios';

const TrophyCabinet = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [stats, setStats] = useState({
    totalWorkouts: 0,
    currentStreak: 0,
    level: 1,
    points: 0,
    nextLevelPoints: 500
  });

  const [trophies, setTrophies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrophiesAndStats = async () => {
      try {
        if (user && user.id) {
          const [trophiesRes, statsRes] = await Promise.all([
            axios.get(`/api/performance/${user.id}/trophies`),
            axios.get(`/api/stats/${user.id}`)
          ]);
          
          setTrophies(trophiesRes.data || []);
          if (statsRes.data) {
            setStats({
              totalWorkouts: statsRes.data.totalWorkouts || 0,
              currentStreak: statsRes.data.currentStreak || 0,
              level: statsRes.data.level || 1,
              points: statsRes.data.points || 0,
              nextLevelPoints: statsRes.data.nextLevelPoints || 500
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
        setTrophies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrophiesAndStats();
  }, [user?.id]);

  const progressPercentage = (stats.points / stats.nextLevelPoints) * 100;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>Trophy Cabinet</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>View your achievements, badges, and current rank.</p>
      </div>

      {/* Level Progress */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, var(--primary), #4F46E5)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.875rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Current Rank</span>
            <h2 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={28} /> Level {stats.level} Athlete
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{stats.points}</span>
            <span style={{ fontSize: '0.875rem', opacity: 0.8 }}> / {stats.nextLevelPoints} XP</span>
          </div>
        </div>
        
        <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: '#FCD34D', transition: 'width 1s ease-in-out' }}></div>
        </div>
        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
          {stats.nextLevelPoints - stats.points} XP to reach Level {stats.level + 1}
        </p>
      </div>

      {/* Badges Grid */}
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Your Badges</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading trophies...</div>
      ) : trophies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Trophy size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No trophies unlocked yet. Keep completing workouts to earn badges!</p>
        </div>
      ) : (
        <div className="grid-cards">
          {trophies.map(trophy => (
            <div 
              key={trophy.id} 
              className="card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                opacity: trophy.unlocked ? 1 : 0.6,
                filter: trophy.unlocked ? 'none' : 'grayscale(100%)',
                position: 'relative'
              }}
            >
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: trophy.unlocked ? `${trophy.color}20` : '#E2E8F0',
                color: trophy.unlocked ? trophy.color : '#94A3B8',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '1rem',
                boxShadow: trophy.unlocked ? `0 0 20px ${trophy.color}40` : 'none'
              }}>
                <Trophy size={32} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{trophy.title}</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{trophy.description}</p>
              
              {trophy.unlocked ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '500', marginTop: 'auto' }}>
                  Unlocked {new Date(trophy.unlocked_at).toLocaleDateString()}
                </span>
              ) : (
                <div style={{ width: '100%', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>Progress</span>
                    <span>{trophy.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${trophy.progress}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrophyCabinet;
