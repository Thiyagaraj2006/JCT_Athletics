import { useState, useEffect } from 'react';
import axios from 'axios';
import { Medal, Trophy, Plus, Trash2, Calendar, User, Search } from 'lucide-react';

const CoachCompetitions = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    competition_name: '',
    date: new Date().toISOString().split('T')[0],
    event: '',
    result_mark: '',
    postion: '',
    medal: ''
  });

  // Fetch athletes assigned to this coach
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        if (!user || !user.name) return;
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/players/coach/${user.name}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlayers(res.data);
      } catch (err) {
        console.error('Failed to fetch players:', err);
      }
    };
    fetchPlayers();
  }, [user?.name]);

  // Fetch results when a player is selected, or all if none
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const url = selectedPlayer 
          ? `/api/competitions/player/${selectedPlayer}`
          : '/api/competitions';
          
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(res.data);
      } catch (err) {
        console.error('Failed to fetch results:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedPlayer]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlayer) {
      alert('Please select a player first.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        player_id: selectedPlayer,
        ...formData,
        postion: formData.postion ? parseInt(formData.postion) : null
      };

      const res = await axios.post('/api/competitions', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResults([res.data, ...results]);

      setFormData({
        competition_name: '',
        date: new Date().toISOString().split('T')[0],
        event: '',
        result_mark: '',
        postion: '',
        medal: ''
      });

      alert('Competition result logged successfully!');
    } catch (err) {
      console.error('Failed to save result:', err);
      const backendError = err.response?.data?.error || err.message;
      alert(`Failed to save result: ${backendError}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/competitions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResults(results.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete result.');
    }
  };

  // Only show results for athletes assigned to this coach when viewing "All"
  const displayResults = selectedPlayer 
    ? results 
    : results.filter(r => players.some(p => p.id === r.player_id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>Log Competition Results</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Add match records, placements, and medals for your athletes.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column: Form */}
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            <Trophy size={20} color="var(--primary)" /> Record New Result
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Select Athlete</label>
              <select
                className="form-control"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                required
              >
                <option value="">-- Choose your athlete --</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.specialty}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Competition Name</label>
              <input
                type="text"
                className="form-control"
                name="competition_name"
                value={formData.competition_name}
                onChange={handleInputChange}
                placeholder="e.g. National Championships 2025"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Event</label>
                <input
                  type="text"
                  className="form-control"
                  name="event"
                  value={formData.event}
                  onChange={handleInputChange}
                  placeholder="e.g. 100m Sprint"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Result / Mark</label>
                <input
                  type="text"
                  className="form-control"
                  name="result_mark"
                  value={formData.result_mark}
                  onChange={handleInputChange}
                  placeholder="e.g. 9.87s"
                />
              </div>
              <div className="form-group">
                <label>Position (Optional)</label>
                <input
                  type="number"
                  className="form-control"
                  name="postion"
                  value={formData.postion}
                  onChange={handleInputChange}
                  placeholder="e.g. 1"
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Medal / Award (Optional)</label>
              <select
                className="form-control"
                name="medal"
                value={formData.medal}
                onChange={handleInputChange}
              >
                <option value="">None</option>
                <option value="Gold">Gold Medal</option>
                <option value="Silver">Silver Medal</option>
                <option value="Bronze">Bronze Medal</option>
                <option value="Certificate">Certificate of Merit</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={!selectedPlayer}>
              <Plus size={18} /> Save Competition Result
            </button>
          </form>
        </div>

        {/* Right Column: History */}
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            <Calendar size={20} color="var(--primary)" /> {selectedPlayer ? 'Athlete History' : 'My Squad History'}
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading results...</div>
          ) : displayResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No competition results found for your squad.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem 0.5rem' }}>Date</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Athlete</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Competition</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Event</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Result</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Awards</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayResults.map(r => {
                    const playerName = players.find(p => p.id === r.player_id)?.name || 'Unknown Athlete';
                    return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0.5rem' }}>{r.date}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{playerName}</td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{r.competition_name}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{r.event || '-'}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        {r.result_mark}
                        {r.postion && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.1rem 0.4rem', backgroundColor: '#F1F5F9', borderRadius: '4px' }}>Pos: {r.postion}</span>}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        {r.medal && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontWeight: '600', fontSize: '0.85rem' }}>
                            <Medal size={14} /> {r.medal}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }} title="Delete Result">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachCompetitions;
