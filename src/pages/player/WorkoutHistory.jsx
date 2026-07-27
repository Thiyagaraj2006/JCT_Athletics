import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Target, Clock, CheckCircle, XCircle } from 'lucide-react';

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (user && user.id) {
          const response = await axios.get(`/api/workouts/${user.id}`);
          // Filter to show only completed or missed workouts, sorted by date descending
          const history = response.data
            .filter(w => w.status !== 'pending')
            .sort((a, b) => new Date(b.due_date || 0) - new Date(a.due_date || 0));
          setWorkouts(history);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user?.id]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Workout History</h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading history...</div>
      ) : workouts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No completed workouts found. Keep training!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {workouts.map(workout => (
            <div key={workout.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  backgroundColor: workout.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: workout.status === 'completed' ? 'var(--success)' : 'var(--danger)',
                  padding: '1rem',
                  borderRadius: '12px'
                }}>
                  {workout.status === 'completed' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0' }}>{workout.type} Training</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} /> {workout.due_date ? new Date(workout.due_date).toLocaleDateString() : 'N/A'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Target size={14} /> Target: {workout.target}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge badge-${workout.status === 'completed' ? 'success' : 'danger'}`}>
                  {workout.status}
                </span>
                {workout.coach && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Assigned by {workout.coach.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
