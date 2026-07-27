import { useState, useEffect } from 'react';
import { Target, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TodayWorkout = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchTodayWorkout = async () => {
      try {
        if (user && user.id) {
          console.log('Fetching for user ID:', user.id);
          const response = await axios.get(`/api/workouts/${user.id}`);
          console.log('Workouts fetched:', response.data);
          
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          
          let todaysPending = response.data.filter(w => {
            if (w.status !== 'pending' || !w.due_date) return false;
            // Check if the due date string contains today's date string anywhere
            return w.due_date.includes(todayStr);
          });
          
          // Fallback: if no workout explicitly matches today, just grab the next pending one
          if (todaysPending.length === 0) {
            todaysPending = response.data.filter(w => w.status === 'pending');
          }
          
          if (todaysPending.length > 0) {
            setWorkout(todaysPending[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch workouts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayWorkout();
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workout) return;

    try {
      // 1. Submit performance record
      await axios.post('/api/performance', {
        player_id: user.id,
        workout_id: workout.id,
        metric_name: workout.type,
        metric_value: parseFloat(result.replace(/[^0-9.]/g, '') || 0),
        metric_unit: result.includes(':') ? 'time' : 'reps/kg'
      });

      // 2. Update workout status to completed (this triggers auto-trophy in backend)
      await axios.put(`/api/workouts/${workout.id}`, {
        status: 'completed'
      });

      setSubmitted(true);
      toast.success('Workout submitted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit workout');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Today's Workout</h1>

      {submitted ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>Workout Completed!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Great job pushing your limits today. Your result has been saved and sent to your coach.</p>
          <button className="btn btn-primary" onClick={() => navigate('/player')}>View Dashboard</button>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading workout...</div>
      ) : !workout ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>No Workouts Pending!</h2>
          <p style={{ color: 'var(--text-muted)' }}>You have completed all your assigned workouts for now. Take a rest!</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{workout.type}</span>
              <h2 style={{ margin: 0, fontSize: '2rem' }}>{workout.type} Training</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <Clock size={16} /> {workout.due_date ? new Date(workout.due_date).toLocaleDateString() : 'No date set'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '500' }}>
                <Target size={16} /> Target: {workout.target}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Instruction Notes</h3>
            <div style={{ backgroundColor: '#F8FAFC', padding: '2rem', borderRadius: '12px', whiteSpace: 'pre-line', lineHeight: '1.8', color: 'var(--text-main)' }}>
              Complete the {workout.type} workout as directed. Aim for the target of {workout.target}. Don't forget to warm up and stretch properly!
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Submit Workout Result</h3>
            <form onSubmit={handleSubmit} style={{ backgroundColor: 'rgba(37, 99, 235, 0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '1.125rem' }}>Your Result</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g., 45:30 or 120" 
                    required 
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    style={{ fontSize: '1.25rem', padding: '1rem', maxWidth: '300px' }}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>Time or Value</span>
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Additional Notes (Optional)</label>
                <textarea 
                  className="form-control" 
                  placeholder="How did you feel?" 
                  style={{ minHeight: '100px' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}>
                  Submit Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayWorkout;
