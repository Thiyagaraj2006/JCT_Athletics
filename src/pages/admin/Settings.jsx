import { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';


const Settings = () => {
  const [settings, setSettings] = useState({
    requireApproval: false,
    disableRegistrations: false,
    emailNewUser: true,
    emailSubmission: true,
    emailReport: true,
    inAppNewUser: true,
    inAppSubmissions: true
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [groupPhotoUploading, setGroupPhotoUploading] = useState(false);

  const handleSettingChange = (e) => {
    setSettings({ ...settings, [e.target.id]: e.target.checked });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleExport = async (type) => {
    try {
      let endpoint = '';
      if (type === 'players') endpoint = '/api/players';
      else if (type === 'coaches') endpoint = '/api/coaches';
      else if (type === 'submissions') endpoint = '/api/workouts'; 
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      const data = response.data;
      
      if (!data || data.length === 0) {
        alert(`No ${type} data available to export.`);
        return;
      }

      // Convert JSON to CSV
      const headers = Object.keys(data[0]).join(',');
      const csvRows = data.map(row => Object.values(row).map(val => `"${val}"`).join(','));
      const csvData = [headers, ...csvRows].join('\n');
      
      // Trigger Download
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert(`Failed to export ${type}`);
    }
  };

  const handleGroupPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setGroupPhotoUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      // 1. Upload file
      const uploadRes = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      const imageUrl = uploadRes.data.url;

      // 2. Save URL to settings
      await axios.post('/api/group-photos', { image_url: imageUrl }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Group photo updated successfully!');
    } catch (err) {
      console.error('Group photo upload error:', err);
      alert('Failed to upload group photo');
    } finally {
      setGroupPhotoUploading(false);
      e.target.value = null; // reset input
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '2rem' }}>Settings</h1>

      {/* Registration Controls */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>Registration Controls</h3>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <input type="checkbox" id="requireApproval" checked={settings.requireApproval} onChange={handleSettingChange} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
          <label htmlFor="requireApproval" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Require Admin Approval for New Coaches/Players</label>
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input type="checkbox" id="disableRegistrations" checked={settings.disableRegistrations} onChange={handleSettingChange} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
          <label htmlFor="disableRegistrations" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Disable New Registrations Temporarily</label>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>Notification Preferences</h3>
        
        <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>Email Alerts</h4>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input type="checkbox" id="emailNewUser" checked={settings.emailNewUser} onChange={handleSettingChange} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
          <label htmlFor="emailNewUser" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>A new Coach or Player registers</label>
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input type="checkbox" id="emailSubmission" checked={settings.emailSubmission} onChange={handleSettingChange} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
          <label htmlFor="emailSubmission" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>A new submission/request is made by a Coach</label>
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input type="checkbox" id="emailReport" checked={settings.emailReport} onChange={handleSettingChange} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
          <label htmlFor="emailReport" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>A user reports an issue</label>
        </div>

        <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>In-App Notifications</h4>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input type="checkbox" id="inAppNewUser" checked={settings.inAppNewUser} onChange={handleSettingChange} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
          <label htmlFor="inAppNewUser" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>New User Registrations</label>
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input type="checkbox" id="inAppSubmissions" checked={settings.inAppSubmissions} onChange={handleSettingChange} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
          <label htmlFor="inAppSubmissions" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>New Submissions</label>
        </div>
      </div>

      {/* Data Management & Exports */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>Data Management & Exports</h3>
        <p style={{ marginBottom: '1.5rem', color: '#64748B' }}>Quickly download all platform data for your records.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => handleExport('players')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', border: '1px solid #E2E8F0' }}>
            <Download size={18} /> Export Players (CSV)
          </button>
          <button className="btn" onClick={() => handleExport('coaches')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', border: '1px solid #E2E8F0' }}>
            <Download size={18} /> Export Coaches (CSV)
          </button>
          <button className="btn" onClick={() => handleExport('submissions')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', border: '1px solid #E2E8F0' }}>
            <Download size={18} /> Export Submissions (CSV)
          </button>
        </div>
      </div>

      {/* Website Content */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>Website Content</h3>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: '600' }}>Homepage Group Photo</label>
          <p style={{ marginBottom: '1rem', color: '#64748B', fontSize: '0.9rem' }}>Upload a new image to replace the group photo on the public homepage.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: groupPhotoUploading ? 0.7 : 1 }}>
              <Upload size={18} /> {groupPhotoUploading ? 'Uploading...' : 'Upload New Photo'}
              <input type="file" accept="image/*" onChange={handleGroupPhotoUpload} style={{ display: 'none' }} disabled={groupPhotoUploading} />
            </label>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>Security</h3>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} className="form-control" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} className="form-control" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} className="form-control" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button className="btn" style={{ backgroundColor: 'white', border: '1px solid #E2E8F0' }}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
};

export default Settings;
