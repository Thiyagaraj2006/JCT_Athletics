import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Medal, Timer, Activity } from 'lucide-react';
import Avatar from '../../components/Avatar';
import axios from 'axios';

const PlayerProfile = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState({ competitions: 0, medals: 0, yearsActive: 1 });
  const [awards, setAwards] = useState([]);
  const [personalBests, setPersonalBests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const [playerRes, statsRes, pbRes, compRes] = await Promise.all([
          axios.get(`/api/players/${id}`),
          axios.get(`/api/stats/${id}`),
          axios.get(`/api/performance/${id}`),
          axios.get(`/api/competitions/player/${id}`)
        ]);

        setPlayer(playerRes.data);
        
        if (statsRes.data) {
          setStats(prev => ({ ...prev, yearsActive: statsRes.data.level || 1 }));
        }
        
        if (compRes.data && Array.isArray(compRes.data)) {
          setStats(prev => ({
            ...prev,
            competitions: compRes.data.length,
            medals: compRes.data.filter(c => c.medal && c.medal !== 'None').length
          }));
          
          setAwards(
            compRes.data
              .filter(c => c.medal && c.medal !== 'None')
              .map(c => `${c.medal} - ${c.competition_name} ${c.event ? '('+c.event+')' : ''}`)
          );
        }
        
        if (pbRes.data) {
          // Get best value for each metric
          const bests = {};
          pbRes.data.forEach(record => {
            if (!bests[record.metric_name] || record.metric_value > bests[record.metric_name].value) {
              bests[record.metric_name] = {
                value: record.metric_value,
                unit: record.metric_unit
              };
            }
          });
          setPersonalBests(Object.entries(bests).map(([event, data]) => ({
            event,
            mark: `${data.value} ${data.unit}`
          })));
        }
        
      } catch (err) {
        console.error('Failed to fetch player data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayerData();
  }, [id]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading profile...</div>;
  if (!player) return <div style={{ padding: '4rem', textAlign: 'center' }}>Player not found.</div>;

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', padding: '3rem 5%' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Link to="/players" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', textDecoration: 'none' }}>
          <ArrowLeft size={18} /> Back to Athletes
        </Link>

        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
              <Avatar user={player} size={400} style={{ borderRadius: '0', width: '100%', height: '100%' }} />
            </div>
            <div style={{ flex: '1 1 400px', padding: '3rem' }}>
              <span className="badge badge-primary" style={{ marginBottom: '1rem', display: 'inline-block' }}>{player.specialty || 'General'}</span>
              <h1 style={{ fontSize: '3rem', margin: '0 0 0.5rem 0' }}>{player.name}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '2rem' }}>Age: {player.age || 20}</p>
              
              <h3 style={{ marginBottom: '1rem' }}>Biography</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '2rem' }}>
                {player.bio || `${player.name} is a dedicated athlete specializing in ${player.specialty || 'General Athletics'}. They have shown consistent progress and a strong commitment to their training regimen.`}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>{stats.competitions}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Meets</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>{stats.medals}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Medals</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--warning)' }}>{stats.yearsActive}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <div className="card">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Medal color="var(--warning)" /> Awards & Honors
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {awards.length === 0 ? (
                <li style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No awards yet.</li>
              ) : (
                awards.map((award, index) => (
                  <li key={index} style={{ padding: '1rem 0', borderBottom: index < awards.length - 1 ? '1px solid #E2E8F0' : 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></div>
                    {award}
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="card">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Timer color="var(--primary)" /> Personal Bests
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {personalBests.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No performance records yet.</div>
              ) : (
                personalBests.map((pb, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    <span style={{ fontWeight: '500' }}>{pb.event}</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>{pb.mark}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
