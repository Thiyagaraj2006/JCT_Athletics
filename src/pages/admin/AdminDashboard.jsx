import { useState, useEffect } from 'react';
import { Users, Activity, Target, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const AdminDashboard = () => {
  const [workoutData, setWorkoutData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalAthletes: 0,
    activeWorkoutsToday: 0,
    avgCompletionRate: 0,
    personalBestsWeek: 0
  });

  useEffect(() => {
    // Connect to actual backend
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/admin/dashboard-stats');
        setStats(res.data);
        
        // We'll leave these empty for now since we haven't built explicit routes for the admin dashboard overview stats
        // but this connects it to the idea of a backend rather than hardcoding.
        setWorkoutData([]);
        setDistributionData([]);
        setRecentActivity([]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#6366F1'];

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Overview</h1>
      
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div className="kpi-title">Total Athletes</div>
          <div className="kpi-value">{stats.totalAthletes}</div>
        </div>
        
        <div className="card kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
            <Activity size={24} />
          </div>
          <div className="kpi-title">Active Workouts Today</div>
          <div className="kpi-value">{stats.activeWorkoutsToday}</div>
        </div>
        
        <div className="card kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Target size={24} />
          </div>
          <div className="kpi-title">Avg Completion Rate</div>
          <div className="kpi-value">{stats.avgCompletionRate}%</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
            <Award size={24} />
          </div>
          <div className="kpi-title">Personal Bests (Week)</div>
          <div className="kpi-value">{stats.personalBestsWeek}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Main Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Workout Completion (Last 7 Days)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={workoutData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }} />
                <Area type="monotone" dataKey="completed" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Player Distribution</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {distributionData.map((entry, index) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recentActivity.length > 0 ? (
            recentActivity.map(activity => (
              <div key={activity.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', backgroundColor: 'var(--input-bg)', borderRadius: '12px', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{activity.user}</span>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>{activity.action}</span>{' '}
                  <span style={{ fontWeight: '500', color: 'var(--primary)' }}>{activity.target}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{activity.time}</div>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
