import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, Target, Clock, Flame, Sparkles } from 'lucide-react';

const PerformanceCenter = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        if (user && user.id) {
          const response = await axios.get(`/api/performance/${user.id}`);
          setDbData(response.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch performance', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [user?.id]);

  // Group data by metric_name
  const groupedData = dbData.reduce((acc, curr) => {
    const metric = curr.metric_name || curr.workouts?.type || 'General';
    if (!acc[metric]) {
      acc[metric] = {
        name: metric,
        unit: curr.metric_unit,
        records: []
      };
    }
    acc[metric].records.push({
      date: new Date(curr.recorded_at).toLocaleDateString(),
      value: Number(curr.metric_value)
    });
    return acc;
  }, {});

  const metricsList = Object.values(groupedData);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>My Performance Center</h1>
      </div>

      {/* AI Insights Card */}
      <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(15,23,42,0.05))', border: '1px solid rgba(37,99,235,0.2)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
          <Sparkles /> AI Assistant Insights
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ color: 'var(--success)', marginTop: '0.25rem' }}><Activity size={20} /></div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>Consistent Progress</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>You've been logging results consistently. Keep it up!</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ color: 'var(--primary)', marginTop: '0.25rem' }}><Target size={20} /></div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>Milestones Reached</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>You are hitting your targets in most of your assigned workouts.</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading performance data...</div>
      ) : metricsList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Activity size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h2 style={{ marginBottom: '1rem' }}>No Data Yet</h2>
          <p style={{ color: 'var(--text-muted)' }}>Complete some workouts and submit your results to see your performance charts here.</p>
        </div>
      ) : (
        <>
          <h2 style={{ marginBottom: '1.5rem', marginTop: '2rem' }}>Specific Workout Analytics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {metricsList.map((metric, index) => {
              const color = index % 2 === 0 ? 'var(--primary)' : 'var(--success)';
              
              return (
                <div className="card" key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>{metric.name}</h3>
                    <span className="badge badge-primary">{metric.records.length} entries</span>
                  </div>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metric.records}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          domain={['auto', 'auto']} 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
                          formatter={(value) => [`${value} ${metric.unit}`, 'Result']} 
                        />
                        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceCenter;
