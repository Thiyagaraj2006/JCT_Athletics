import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CoachDashboard = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Coach' };
  const firstName = user.name.split(' ')[0];
  
  const [assignedCount, setAssignedCount] = useState(0);
  const [workouts, setWorkouts] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch assigned players count
        const playersRes = await axios.get('/api/players');
        if (playersRes.data) {
          const count = playersRes.data.filter(p => user && p.assigned_coach === user.name).length;
          setAssignedCount(count);
        }

        // Fetch coach's workouts
        if (user && user.id) {
          const workoutsRes = await axios.get(`/api/workouts/coach/${user.id}`);
          setWorkouts(workoutsRes.data || []);
          
          const submissionsRes = await axios.get(`/api/performance/coach/${user.id}`);
          setSubmissions(submissionsRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, [user.name, user.id]);

  const todayWorkouts = workouts.filter(w => {
    if (!w.due_date) return false;
    // Extract YYYY-MM-DD from DB's ISO string (e.g. 2026-07-26T00:00:00.000Z -> 2026-07-26)
    const dbDateStr = w.due_date.split('T')[0];
    
    // Create local YYYY-MM-DD string to compare
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return dbDateStr === todayStr;
  });

  const completedToday = todayWorkouts.filter(w => w.status === 'completed').length;
  const pendingToday = todayWorkouts.filter(w => w.status === 'pending').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Welcome back, {firstName}!</h1>
      </div>
      
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}><Activity size={24} /></div>
          <div className="kpi-title">Assigned Players</div>
          <div className="kpi-value">{assignedCount}</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}><CheckCircle size={24} /></div>
          <div className="kpi-title">Completed Today</div>
          <div className="kpi-value">{completedToday}</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}><Clock size={24} /></div>
          <div className="kpi-title">Pending Today</div>
          <div className="kpi-value">{pendingToday}</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}><CalendarIcon size={24} /></div>
          <div className="kpi-title">Attendance %</div>
          <div className="kpi-value">96%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Today's Workouts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {todayWorkouts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No workouts assigned for today</div>
            ) : (
              todayWorkouts.slice(0, 5).map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{w.player?.name || 'Unknown Player'}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{w.type} - {w.target}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`badge ${w.status === 'completed' ? 'badge-success' : w.status === 'missed' ? 'badge-primary' : 'badge-warning'}`}>{w.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Submissions</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Workout</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent submissions</td>
                  </tr>
                ) : (
                  submissions.slice(0, 5).map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{s.player?.name || 'Unknown'}</td>
                      <td>{s.workouts?.type || s.metric_name}</td>
                      <td style={{ color: 'var(--success)', fontWeight: '600' }}>{s.metric_value} {s.metric_unit}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
