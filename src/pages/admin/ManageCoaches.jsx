import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '../../config';


const ManageCoaches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingCoachId, setEditingCoachId] = useState(null);
  const [selectedCoachForAssign, setSelectedCoachForAssign] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [newCoach, setNewCoach] = useState({ name: '', email: '', specialty: '', assignedPlayers: 0, status: 'Active', password: '', img: '' });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const coachesRes = await axios.get('/api/coaches');
      const playersRes = await axios.get('/api/players');
      
      const coachesData = coachesRes.data;
      const playersData = playersRes.data;
      
      const mappedCoaches = coachesData.map(coach => {
        const assignedCount = playersData.filter(p => p.assigned_coach === coach.name).length;
        return {
          ...coach,
          specialty: coach.specialty || 'General',
          assignedPlayers: assignedCount,
          status: coach.status || 'Active'
        };
      });
      setCoaches(mappedCoaches);
      setAllPlayers(playersData); // Store players for the assign modal
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('/api/players');
      setAllPlayers(response.data);
    } catch (error) {
      console.error('Failed to fetch players');
    }
  };

  const openAddModal = () => {
    setNewCoach({ name: '', email: '', specialty: '', assignedPlayers: 0, status: 'Active', password: '', img: '' });
    setSelectedImage(null);
    setEditingCoachId(null);
    setShowAddModal(true);
  };

  const openEditModal = (coach) => {
    setNewCoach({ ...coach, password: '' });
    setSelectedImage(null);
    setEditingCoachId(coach.id);
    setShowAddModal(true);
  };

  const openAssignModal = async (coach) => {
    setSelectedCoachForAssign(coach);
    // Fetch players right before opening to ensure fresh data
    await fetchPlayers();
    
    try {
      // Find all players currently assigned to this coach
      const response = await axios.get('/api/players');
      const players = response.data;
      const currentlyAssignedIds = players
        .filter(p => p.assigned_coach === coach.name)
        .map(p => p.id);
      setSelectedPlayerIds(currentlyAssignedIds);
      setShowAssignModal(true);
    } catch (error) {
      toast.error('Failed to load current assignments');
    }
  };

  const handleAssignPlayers = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/coaches/${selectedCoachForAssign.id}/assign`, {
        playerIds: selectedPlayerIds
      });
      toast.success('Players assigned successfully!');
      setShowAssignModal(false);
      fetchCoaches(); // Refresh coach list to update the count
    } catch (error) {
      toast.error('Failed to assign players');
    }
  };

  const handleAddCoach = async (e) => {
    e.preventDefault();
    if (!newCoach.name || !newCoach.email) return;
    
    try {
      let imageUrl = newCoach.img;
      
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const uploadRes = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.url;
      }

      const payload = { ...newCoach, img: imageUrl };

      if (editingCoachId) {
        await axios.put(`/api/coaches/${editingCoachId}`, payload);
        toast.success('Coach updated successfully!');
      } else {
        await axios.post('/api/coaches', payload);
        toast.success('New coach added!');
      }
      fetchCoaches();
      setShowAddModal(false);
      setNewCoach({ name: '', email: '', specialty: '', assignedPlayers: 0, status: 'Active', password: '', img: '' });
      setSelectedImage(null);
      setEditingCoachId(null);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const deleteCoach = async (id) => {
    try {
      await axios.delete(`/api/coaches/${id}`);
      toast.success('Coach deleted');
      fetchCoaches();
    } catch (error) {
      toast.error('Failed to delete coach');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Manage Coaches</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Coach
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search coaches..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th>Assigned Players</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coaches.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(coach => (
                <tr key={coach.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={coach.img ? `${API_BASE_URL}${coach.img}` : 'https://images.unsplash.com/photo-1552674605-15caff8d65e9?auto=format&fit=crop&w=40&h=40&q=80'} alt={coach.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{coach.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{coach.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{coach.specialty}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} color="var(--text-muted)" />
                      {coach.assignedPlayers}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${coach.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {coach.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '0.5rem' }} 
                        title="Assign Players"
                        onClick={() => openAssignModal(coach)}
                      >
                        <Users size={16} />
                      </button>
                      <button 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }} 
                        title="Edit"
                        onClick={() => openEditModal(coach)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F43F5E', padding: '0.5rem' }} 
                        title="Delete"
                        onClick={() => deleteCoach(coach.id)}
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

      {/* Add/Edit Coach Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{editingCoachId ? 'Edit Coach' : 'Add New Coach'}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>
            
            <form onSubmit={handleAddCoach}>
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
                  value={newCoach.name}
                  onChange={(e) => setNewCoach({...newCoach, name: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  required
                  value={newCoach.email}
                  onChange={(e) => setNewCoach({...newCoach, email: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Specialty</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newCoach.specialty}
                  onChange={(e) => setNewCoach({...newCoach, specialty: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={newCoach.password || ''}
                  onChange={(e) => setNewCoach({...newCoach, password: e.target.value})}
                  placeholder={editingCoachId ? "Leave blank to keep unchanged" : "password123 (Default)"}
                />
                {editingCoachId && <small style={{ color: 'var(--text-muted)' }}>Only enter a password if you want to reset it.</small>}
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                <select 
                  className="form-control"
                  value={newCoach.status}
                  onChange={(e) => setNewCoach({...newCoach, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn" style={{ backgroundColor: '#E2E8F0', color: 'var(--text-main)' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCoachId ? 'Save Changes' : 'Add Coach'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Players Modal */}
      {showAssignModal && selectedCoachForAssign && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Assign Players</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAssignModal(false)}>
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Select the players you want to assign to <strong>{selectedCoachForAssign.name}</strong>.
            </p>

            <form onSubmit={handleAssignPlayers}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {allPlayers.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No players found in the system.</p>
                ) : (
                  allPlayers.map(player => (
                    <label key={player.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #E2E8F0', borderRadius: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedPlayerIds.includes(player.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlayerIds([...selectedPlayerIds, player.id]);
                          } else {
                            setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== player.id));
                          }
                        }}
                      />
                      <span>{player.name} <small style={{ color: 'var(--text-muted)' }}>({player.specialty || 'General'})</small></span>
                    </label>
                  ))
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn" style={{ backgroundColor: '#E2E8F0', color: 'var(--text-main)' }} onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Assignments</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoaches;
