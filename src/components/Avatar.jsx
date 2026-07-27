import { useState, useEffect } from 'react';

const Avatar = ({ user, size = 40, style = {} }) => {
  const [avatarUrl, setAvatarUrl] = useState(user?.img ? `${API_BASE_URL}${user.img}?t=${new Date().getTime()}` : '');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Listen for custom event from Profile edit
    const handleProfileUpdate = () => {
      // Re-read user from localStorage as it was just updated
      const updatedUserString = localStorage.getItem('user');
      if (updatedUserString) {
        const updatedUser = JSON.parse(updatedUserString);
        if (updatedUser.img) {
          setAvatarUrl(`${API_BASE_URL}${updatedUser.img}?t=${new Date().getTime()}`);
        }
      }
      setImgError(false); // Reset error state to try fetching the new image
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user?.id]);

  if (!user) return null;

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: 'var(--primary)',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: `${size / 2.5}px`,
      fontWeight: 'bold',
      overflow: 'hidden',
      backgroundImage: !imgError ? `url(${avatarUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      flexShrink: 0,
      ...style
    }}>
      {!imgError && avatarUrl && <img src={avatarUrl} alt={user?.name || 'User'} style={{ display: 'none' }} onError={() => setImgError(true)} />}
      {imgError && user.name ? user.name.charAt(0).toUpperCase() : ''}
    </div>
  );
};

export default Avatar;
