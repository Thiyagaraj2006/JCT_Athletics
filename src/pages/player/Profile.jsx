import { useState, useRef } from 'react';
import { User, Mail, Shield, LogOut, Edit2, Save, X, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const [user, setUser] = useState(userString ? JSON.parse(userString) : null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user ? user.name : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.put('/api/auth/profile', {
        id: user.id,
        name,
        email,
        avatarBase64
      });
      
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      setAvatarBase64(null); // Clear pending upload
      
      // Dispatch a custom event to tell other components to reload the avatar
      window.dispatchEvent(new Event('profileUpdated'));
      
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div style={{ padding: '2rem' }}>Please log in.</div>;

  // Determine which image to show
  const avatarUrl = avatarBase64 || (user.img ? `${API_BASE_URL}${user.img}?t=${new Date().getTime()}` : '');

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>My Profile</h1>
        {!isEditing ? (
          <button className="btn btn-outline" onClick={() => setIsEditing(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Edit2 size={16} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline" onClick={() => { setIsEditing(false); setAvatarBase64(null); setName(user.name); setEmail(user.email); }} disabled={saving}>
              <X size={16} /> Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              overflow: 'hidden',
              backgroundImage: `url(${avatarUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {!avatarBase64 && avatarUrl && <img src={avatarUrl} alt="avatar" style={{ display: 'none' }} onError={(e) => e.target.parentElement.style.backgroundImage = 'none'} />}
              {user.name && !avatarBase64 && !avatarUrl ? user.name.charAt(0).toUpperCase() : ''}
            </div>
            
            {isEditing && (
              <>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    position: 'absolute', bottom: 0, right: 0, 
                    backgroundColor: 'white', border: '1px solid #E2E8F0', 
                    borderRadius: '50%', padding: '0.5rem', cursor: 'pointer',
                    color: 'var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <Camera size={16} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>{isEditing ? 'Editing Profile' : user.name}</h2>
            <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Shield size={14} /> {user.role}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: isEditing ? 'white' : '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', transition: 'all 0.2s' }}>
              <User size={18} color={isEditing ? 'var(--primary)' : 'var(--text-muted)'} />
              {isEditing ? (
                <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem' }} />
              ) : (
                <span>{user.name}</span>
              )}
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: isEditing ? 'white' : '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', transition: 'all 0.2s' }}>
              <Mail size={18} color={isEditing ? 'var(--primary)' : 'var(--text-muted)'} />
              {isEditing ? (
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem' }} />
              ) : (
                <span>{user.email}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="btn btn-danger" 
        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}
      >
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
};

export default Profile;
