import { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/audit');
        if (response.data && response.data.length > 0) {
          // Format for UI
          setLogs(response.data.map(log => ({
            id: log.id,
            timestamp: new Date(log.created_at).toLocaleString(),
            user: log.user_name || 'Unknown',
            role: log.role || 'System',
            action: log.action,
            details: log.details,
            status: log.status
          })));
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error('Error fetching logs', err);
      }
    };
    fetchLogs();
  }, []);

  // Filter logs based on search and action dropdown
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircle size={16} color="var(--success)" />;
      case 'warning': return <AlertCircle size={16} color="var(--warning)" />;
      case 'error': return <ShieldAlert size={16} color="#EF4444" />;
      default: return <Info size={16} color="var(--primary)" />;
    }
  };

  const getActionBadgeClass = (action) => {
    switch(action) {
      case 'CREATE': return 'badge-success';
      case 'UPDATE': return 'badge-primary';
      case 'DELETE': return 'badge-warning'; // Usually red/warning
      case 'LOGIN': return 'badge-success'; // Could be default, using success for visual variety
      default: return 'badge-primary';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>Audit Logs</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Track system-wide activity, security events, and data modifications.</p>
        </div>
      </div>

      <div className="card">
        {/* Controls */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search users or event details..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select 
              className="form-control" 
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login Events</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Role</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {log.timestamp}
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{log.user}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.role}</div>
                    </td>
                    <td>
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getStatusIcon(log.status)}
                        <span style={{ fontSize: '0.9rem' }}>{log.details}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
