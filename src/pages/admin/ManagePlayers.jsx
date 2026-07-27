import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '../../config';


const ManagePlayers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [availableCoaches, setAvailableCoaches] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ name: '', email: '', event: '', coach: '', status: 'Active', password: '', img: '' });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPlayers();
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await axios.get('/api/coaches');
      setAvailableCoaches(response.data);
    } catch (error) {
      console.error('Failed to fetch coaches');
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('/api/players');
      const mappedPlayers = response.data.map(player => ({
        ...player,
        event: player.specialty || 'General',
        coach: player.assigned_coach || '',
        status: player.status || 'Active'
      }));
      setPlayers(mappedPlayers);
    } catch (error) {
      toast.error('Failed to fetch players');
    }
  };

  const openAddModal = () => {
    setNewPlayer({ name: '', email: '', event: '', coach: '', status: 'Active', password: '', img: '' });
    setSelectedImage(null);
    setEditingPlayerId(null);
    setShowAddModal(true);
  };

  const openEditModal = (player) => {
    setNewPlayer({ ...player, password: '' });
    setSelectedImage(null);
    setEditingPlayerId(player.id);
    setShowAddModal(true);
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.email) return;
    
    try {
      let imageUrl = newPlayer.img;
      
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const uploadRes = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.url;
      }

      const payload = { ...newPlayer, img: imageUrl };

      if (editingPlayerId) {
        await axios.put(`/api/players/${editingPlayerId}`, payload);
        toast.success('Player updated successfully!');
      } else {
        await axios.post('/api/players', payload);
        toast.success('New player added!');
      }
      fetchPlayers();
      setShowAddModal(false);
      setNewPlayer({ name: '', email: '', event: '', coach: '', status: 'Active', password: '', img: '' });
      setSelectedImage(null);
      setEditingPlayerId(null);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const deletePlayer = async (id) => {
    try {
      await axios.delete(`/api/players/${id}`);
      toast.success('Player deleted');
      fetchPlayers();
    } catch (error) {
      toast.error('Failed to delete player');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Manage Players</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Player
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search players..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select className="form-control" style={{ width: '150px' }}>
              <option value="">All Events</option>
              <option value="sprint">Sprints</option>
              <option value="endurance">Endurance</option>
              <option value="jumps">Jumps</option>
            </select>
            <select className="form-control" style={{ width: '150px' }}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="injured">Injured</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Event</th>
                <th>Assigned Coach</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(player => (
                <tr key={player.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={player.img ? `${API_BASE_URL}${player.img}` : 'https://images.unsplash.com/photo-1552674605-15caff8d65e9?auto=format&fit=crop&w=40&h=40&q=80'} alt={player.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{player.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{player.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{player.event}</td>
                  <td>{player.coach}</td>
                  <td>
                    <span className={`badge ${
                      player.status === 'Active' ? 'badge-success' : 
                      player.status === 'Injured' ? 'badge-warning' : 'badge-primary'
                    }`}>
                      {player.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }} 
                        title="Edit"
                        onClick={() => openEditModal(player)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F43F5E', padding: '0.5rem' }} 
                        title="Delete"
                        onClick={() => deletePlayer(player.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Player Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{editingPlayerId ? 'Edit Player' : 'Add New Player'}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>
            
            <form onSubmit={handleAddPlayer}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Profile Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="form-control" 
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  required
                  value={newPlayer.email}
                  onChange={(e) => setNewPlayer({...newPlayer, email: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Event</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newPlayer.event}
                  onChange={(e) => setNewPlayer({...newPlayer, event: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Assigned Coach</label>
                <select 
                  className="form-control" 
                  value={newPlayer.coach}
                  onChange={(e) => setNewPlayer({...newPlayer, coach: e.target.value})}
                >
                  <option value="">-- Unassigned --</option>
                  {availableCoaches.map(coach => (
                    <option key={coach.id} value={coach.name}>{coach.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={newPlayer.password || ''}
                  onChange={(e) => setNewPlayer({...newPlayer, password: e.target.value})}
                  placeholder={editingPlayerId ? "Leave blank to keep unchanged" : "password123 (Default)"}
                />
                {editingPlayerId && <small style={{ color: 'var(--text-muted)' }}>Only enter a password if you want to reset it.</small>}
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                <select 
                  className="form-control"
                  value={newPlayer.status}
                  onChange={(e) => setNewPlayer({...newPlayer, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Injured">Injured</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn" style={{ backgroundColor: '#E2E8F0', color: 'var(--text-main)' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingPlayerId ? 'Save Changes' : 'Add Player'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlayers;
