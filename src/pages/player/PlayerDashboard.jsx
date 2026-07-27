import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Flame, Target, Trophy, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PlayerDashboard = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Player' };
  // Extract just the first name for the welcome message
  const firstName = user.name.split(' ')[0];
  
  const [workouts, setWorkouts] = useState([]);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [completedThisMonth, setCompletedThisMonth] = useState(0);
  const [stats, setStats] = useState({
    currentStreak: 0,
    personalBests: 0
  });

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        if (user && user.id) {
          const response = await axios.get(`/api/workouts/${user.id}`);
          if (response.data && response.data.length > 0) {
            setWorkouts(response.data);
            
            // Calculate completed workouts this month
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            const completed = response.data.filter(w => {
              if (w.status !== 'completed') return false;
              if (!w.due_date) return true; // Count if it has no date
              const dueDate = new Date(w.due_date);
              return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
            });
            setCompletedThisMonth(completed.length);
            
            // Find the pending workout for today
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
              setTodayWorkout(todaysPending[0]);
            } else {
              setTodayWorkout(null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch workouts:', error);
      }
    };
    
    const fetchStats = async () => {
      try {
        if (user && user.id) {
          const response = await axios.get(`/api/stats/${user.id}`);
          if (response.data) {
            setStats({
              currentStreak: response.data.currentStreak || 0,
              personalBests: response.data.personalBests || 0
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    
    fetchWorkouts();
    fetchStats();
  }, [user?.id]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Welcome back, {firstName}!</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/leaderboard" className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#F8FAFC', color: 'var(--text-main)' }}>
            <Trophy size={18} color="var(--primary)" /> View Leaderboard
          </Link>
          <Link to="/player/performance" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Activity size={18} /> View Performance Center
          </Link>
        </div>
      </div>
      
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}><Flame size={24} /></div>
          <div className="kpi-title">Current Streak</div>
          <div className="kpi-value">{stats.currentStreak} {stats.currentStreak === 1 ? 'Day' : 'Days'}</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}><CheckCircle size={24} /></div>
          <div className="kpi-title">Completed Workouts (This Month)</div>
          <div className="kpi-value">{completedThisMonth}</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}><Trophy size={24} /></div>
          <div className="kpi-title">Personal Bests</div>
          <div className="kpi-value">{stats.personalBests}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Today's Workout Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Today's Workout</h3>
            <span className="badge badge-primary">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          
          {todayWorkout ? (
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', flex: 1 }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{todayWorkout.type}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <Target size={18} /> Target: {todayWorkout.target}
              </div>
              <p style={{ color: 'var(--text-muted)' }}>Assigned by Coach {todayWorkout.coach?.name || 'Unknown'}</p>
            </div>
          ) : (
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No workouts assigned for today.</p>
            </div>
          )}
          
          <Link to="/player/today" className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            View Details & Submit <CheckCircle size={18} />
          </Link>
        </div>

        {/* Upcoming Workouts */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Upcoming Schedule</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {workouts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>You have no assigned workouts.</p>
            ) : (
              workouts.slice(0, 5).map((w, i) => {
                const date = new Date(w.due_date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (
                  <div key={w.id || i} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px', alignItems: 'center' }}>
                    <div style={{ backgroundColor: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center', minWidth: '80px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{dayName}</div>
                      <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{monthDay}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '500' }}>{w.type}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{w.target}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
