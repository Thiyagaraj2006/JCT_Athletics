import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MessageSquare, ClipboardList, Activity, ArrowRight } from 'lucide-react';
import axios from 'axios';
import Avatar from '../../components/Avatar';

const CoachPlayers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('All');
  
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('/api/players');
         const userString = localStorage.getItem('user');
         const user = userString ? JSON.parse(userString) : null;

         // Map database response to component structure
         if (response.data && response.data.length > 0) {
           const assignedPlayers = response.data
             .filter(p => user && p.assigned_coach === user.name)
             .map(p => ({
               id: p.id,
               name: p.name,
               event: p.specialty || 'General',
               age: p.age || 20,
               status: 'Active',
               fitnessScore: 0,
               lastWorkout: 'N/A',
               img: p.avatar_url || 'https://via.placeholder.com/400'
             }));
           setPlayers(assignedPlayers);
        } else {
           setPlayers([]);
        }
      } catch (err) {
        console.error('Error fetching players:', err);
      }
    };
    fetchPlayers();
  }, []);

  const filteredPlayers = players
    .filter(p => filterEvent === 'All' || p.event.includes(filterEvent))
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>My Players</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage and monitor your assigned athletes.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search players by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select 
            className="form-control" 
            value={filterEvent} 
            onChange={(e) => setFilterEvent(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="All">All Events</option>
            <option value="Sprint">Sprints</option>
            <option value="Run">Endurance (Runs)</option>
            <option value="Jump">Jumps</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredPlayers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No players found matching your search.
          </div>
        ) : (
          filteredPlayers.map(player => (
            <div key={player.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative' }}>
                <Avatar user={player} size={160} style={{ borderRadius: '0', width: '100%', height: '160px' }} />
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <span className={`badge ${
                    player.status === 'Active' ? 'badge-success' : 
                    player.status === 'Injured' ? 'badge-warning' : 'badge-primary'
                  }`} style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {player.status}
                  </span>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{player.name}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {player.event} • Age {player.age}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Fitness Score</div>
                    <div style={{ fontWeight: '600', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Activity size={16} /> {player.fitnessScore}/100
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Last Workout</div>
                    <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{player.lastWorkout}</div>
                  </div>
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" style={{ flex: 1, padding: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', border: '1px solid #E2E8F0', backgroundColor: 'transparent' }} onClick={() => alert(`Message feature for ${player.name} coming soon!`)}>
                      <MessageSquare size={16} /> Message
                    </button>
                    <Link to="/coach/assign-workout" className="btn" style={{ flex: 1, padding: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', border: '1px solid #E2E8F0', backgroundColor: 'transparent' }}>
                      <ClipboardList size={16} /> Assign
                    </Link>
                  </div>
                  <Link to={`/players/${player.id}`} className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    View Profile <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoachPlayers;
