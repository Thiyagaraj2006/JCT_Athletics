import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';
import Avatar from '../../components/Avatar';

const Players = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('/api/players');
        setPlayers(response.data);
      } catch (error) {
        console.error('Failed to fetch players', error);
      }
    };
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', padding: '3rem 5%' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Our Athletes</h1>
          
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by name or event..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <div className="grid-cards">
          {filteredPlayers.map(player => (
            <div key={player.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Avatar user={player} size={250} style={{ borderRadius: '0', width: '100%', height: '250px' }} />
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{player.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: '500', color: 'var(--primary)' }}>{player.event || 'Athlete'}</span>
                  <span>Age: {player.age || 'N/A'}</span>
                </div>
                <Link to={`/players/${player.id}`} className="btn" style={{ marginTop: 'auto', width: '100%', border: '1px solid var(--primary)', color: 'var(--primary)', backgroundColor: 'transparent' }}>View Profile</Link>
              </div>
            </div>
          ))}
        </div>
        
        {filteredPlayers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <h3>No athletes found matching your search.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;
