import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User as UserIcon, Search, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '../../config';


const Chat = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (!user || !user.id) return;
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/messages/contacts/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContacts(res.data);
        if (res.data.length > 0) {
          setSelectedContact(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [user?.id]);

  // Fetch messages
  const fetchMessages = async () => {
    if (!user || !user.id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/messages/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const token = localStorage.getItem('token');
      const payload = {
        sender_id: user.id,
        receiver_id: selectedContact.id,
        text: newMessage,
        is_group: false
      };

      const res = await axios.post('/api/messages', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  // Filter messages for the currently selected contact
  const conversation = messages.filter(m => 
    (m.sender_id === user.id && m.receiver_id === selectedContact?.id) ||
    (m.receiver_id === user.id && m.sender_id === selectedContact?.id)
  );

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading communications...</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', height: 'calc(100vh - 140px)', minHeight: '600px' }}>
      
      {/* Left Sidebar: Contacts */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem 0' }}>
        <div style={{ padding: '0 1rem 1rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <MessageSquare size={20} color="var(--primary)" /> Direct Messages
          </h2>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
            />
          </div>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {contacts.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No contacts found.
            </div>
          ) : (
            contacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '1rem', 
                  cursor: 'pointer',
                  borderLeft: selectedContact?.id === contact.id ? '3px solid var(--primary)' : '3px solid transparent',
                  backgroundColor: selectedContact?.id === contact.id ? '#EFF6FF' : 'transparent',
                  borderBottom: '1px solid var(--border-color)'
                }}
                className="hover-effect"
              >
                {contact.img ? (
                  <img src={`${API_BASE_URL}${contact.img}`} alt={contact.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                    <UserIcon size={20} />
                  </div>
                )}
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{contact.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{contact.role}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Content: Chat Window */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#F8FAFC' }}>
              {selectedContact.img ? (
                <img src={`${API_BASE_URL}${selectedContact.img}`} alt={selectedContact.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <UserIcon size={20} />
                </div>
              )}
              <div>
                <h3 style={{ margin: 0 }}>{selectedContact.name}</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedContact.role}</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {conversation.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                conversation.map(msg => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      <div 
                        style={{ 
                          maxWidth: '70%', 
                          padding: '0.75rem 1rem', 
                          borderRadius: '16px',
                          borderBottomRightRadius: isMine ? '4px' : '16px',
                          borderBottomLeftRadius: !isMine ? '4px' : '16px',
                          backgroundColor: isMine ? 'var(--primary)' : '#F1F5F9',
                          color: isMine ? 'white' : 'var(--text-main)'
                        }}
                      >
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', padding: '0 0.5rem' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: '#fff' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '24px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  style={{ 
                    width: '45px', 
                    height: '45px', 
                    borderRadius: '50%', 
                    backgroundColor: newMessage.trim() ? 'var(--primary)' : '#E2E8F0', 
                    color: 'white', 
                    border: 'none', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    cursor: newMessage.trim() ? 'pointer' : 'default',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Send size={18} style={{ marginLeft: '-2px' }} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h2 style={{ margin: 0, fontWeight: '500' }}>Select a contact</h2>
            <p style={{ margin: '0.5rem 0 0 0' }}>Choose someone from the list to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
