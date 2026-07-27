import { useState, useEffect } from 'react';
import { Send, Calendar, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AssignWorkout = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [target, setTarget] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('/api/players');
        // Only show players assigned to this coach
        if (response.data) {
          const assignedPlayers = response.data.filter(p => user && p.assigned_coach === user.name);
          setPlayers(assignedPlayers);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };
    fetchPlayers();
  }, [user?.name]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedPlayer || !workoutType || !target || !dueDate) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      await axios.post('/api/workouts', {
        player_id: selectedPlayer,
        coach_id: user?.id,
        type: workoutType,
        target: target,
        due_date: new Date(dueDate).toISOString()
      });
      
      toast.success('Workout assigned successfully!');
      
      // Reset form
      setSelectedPlayer('');
      setWorkoutType('');
      setTarget('');
      setDueDate('');
    } catch (err) {
      toast.error('Failed to assign workout');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>Assign Workout</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Create and assign a new workout for your athletes.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleAssign}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Player</label>
            <select 
              className="form-control" 
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              required
            >
              <option value="">-- Choose a player --</option>
              {players.length === 0 && <option value="" disabled>No players assigned to you yet.</option>}
              {players.map(player => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Workout Type</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. 100m Sprint Intervals, 5km Run, Squats"
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target / Goal</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Under 11.5s, 4x10 @ 100kg"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={18} /> Assign Workout
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignWorkout;
