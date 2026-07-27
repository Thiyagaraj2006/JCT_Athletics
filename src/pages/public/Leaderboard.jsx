import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award, Flame, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';


const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/stats/leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankStyle = (index) => {
    switch (index) {
      case 0: return { color: '#FCD34D', bg: 'rgba(252, 211, 77, 0.1)', icon: <Trophy size={24} color="#FCD34D" /> };
      case 1: return { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)', icon: <Medal size={24} color="#94A3B8" /> };
      case 2: return { color: '#B45309', bg: 'rgba(180, 83, 9, 0.1)', icon: <Award size={24} color="#B45309" /> };
      default: return { color: 'var(--text-muted)', bg: 'transparent', icon: <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>#{index + 1}</span> };
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <Flame color="var(--primary)" size={48} /> Club Leaderboard
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Rankings based on total XP earned through workouts and achievements.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2 style={{ color: 'var(--text-muted)' }}>Loading Rankings...</h2>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {leaderboard.map((player, index) => {
            const rank = getRankStyle(index);
            const isTop3 = index < 3;
            
            return (
              <div 
                key={player.id}
                className="card hover-effect"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: isTop3 ? '1.5rem' : '1rem 1.5rem',
                  gap: '1.5rem',
                  backgroundColor: rank.bg,
                  border: isTop3 ? `1px solid ${rank.color}40` : '1px solid var(--border-color)',
                  transform: isTop3 ? `scale(${1.02 - (index * 0.01)})` : 'none',
                  boxShadow: isTop3 ? `0 10px 25px -5px ${rank.color}20` : 'var(--shadow-sm)',
                  zIndex: 10 - index
                }}
              >
                <div style={{ width: '40px', display: 'flex', justifyContent: 'center', color: rank.color }}>
                  {rank.icon}
                </div>
                
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img 
                    src={player.img ? `${API_BASE_URL}${player.img}` : 'https://images.unsplash.com/photo-1552674605-15caff8d65e9?auto=format&fit=crop&w=64&h=64&q=80'} 
                    alt={player.name}
                    style={{ 
                      width: isTop3 ? '60px' : '48px', 
                      height: isTop3 ? '60px' : '48px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: `2px solid ${isTop3 ? rank.color : 'transparent'}`
                    }}
                  />
                  <div>
                    <Link to={`/players/${player.id}`} style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
                      <h3 style={{ margin: 0, fontSize: isTop3 ? '1.25rem' : '1.1rem', fontWeight: isTop3 ? 'bold' : '600' }}>
                        {player.name}
                      </h3>
                    </Link>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {player.specialty} • Level {player.level}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
                  <div style={{ display: 'none' }}>
                    {/* Optional: Add streak or other stats here later */}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total XP</div>
                    <div style={{ fontSize: isTop3 ? '1.5rem' : '1.25rem', fontWeight: 'bold', color: isTop3 ? rank.color : 'var(--primary)' }}>
                      {player.points}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {leaderboard.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <Target size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <h2>No athletes found.</h2>
              <p>Workouts and trophies will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
