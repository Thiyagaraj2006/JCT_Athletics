import { useState, useEffect } from 'react';
import { Search, Send, Image, Paperclip, MoreVertical, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const CoachMessages = () => {
  const [activeContactId, setActiveContactId] = useState('team');
  const [messages, setMessages] = useState({});
  const [inputMsg, setInputMsg] = useState('');
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    // In a real app, we'd use the logged in user ID. Mocking with '123'
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/messages/123');
        if (response.data && response.data.length > 0) {
          // Transform fetched data into the dictionary format grouped by contact
          const grouped = {};
          response.data.forEach(msg => {
            const contactId = msg.is_group ? 'team' : (msg.sender_id === '123' ? msg.receiver_id : msg.sender_id);
            if (!grouped[contactId]) grouped[contactId] = [];
            grouped[contactId].push({
              id: msg.id,
              sender: msg.sender_id === '123' ? 'You' : msg.sender?.name,
              text: msg.text,
              time: new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              isOwn: msg.sender_id === '123'
            });
          });
          setMessages(grouped);
        } else {
          setMessages({});
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, []);

  const activeContact = contacts.find(c => c.id === activeContactId);
  const currentMessages = messages[activeContactId] || [];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    try {
      // Assuming '123' is coach ID
      const newMsgData = {
        sender_id: '123',
        receiver_id: activeContact.type === 'group' ? null : activeContact.id,
        text: inputMsg,
        is_group: activeContact.type === 'group'
      };
      
      // In a real app we'd post to DB. Let's just update local state for the demo
      // await axios.post('/api/messages', newMsgData);

      const newMsg = {
        id: Date.now(),
        sender: 'You',
        text: inputMsg,
        time: 'Just now',
        isOwn: true
      };

      setMessages(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), newMsg]
      }));
      
      setInputMsg('');
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', height: 'calc(100vh - 180px)' }}>
      
      {/* Contacts Sidebar */}
      <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '10px', left: '12px' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search athletes..." 
              style={{ paddingLeft: '2.5rem', borderRadius: '20px' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {mockContacts.map(contact => (
            <div 
              key={contact.id}
              onClick={() => setActiveContactId(contact.id)}
              style={{ 
                padding: '1rem 1.5rem', 
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
                backgroundColor: activeContactId === contact.id ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                borderLeft: activeContactId === contact.id ? '4px solid var(--primary)' : '4px solid transparent',
                display: 'flex',
                gap: '1rem',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{ 
                width: '45px', 
                height: '45px', 
                borderRadius: '50%', 
                backgroundColor: contact.type === 'group' ? 'var(--primary)' : '#E2E8F0',
                color: contact.type === 'group' ? 'white' : 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {contact.type === 'group' ? 'Team' : contact.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contact.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: contact.unread > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {contact.time}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: contact.unread > 0 ? '600' : 'normal' }}>
                    {contact.lastMsg}
                  </p>
                  {contact.unread > 0 && (
                    <span style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Chat Header */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: activeContact?.type === 'group' ? 'var(--primary)' : '#E2E8F0',
              color: activeContact?.type === 'group' ? 'white' : 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {activeContact?.type === 'group' ? 'Team' : activeContact?.name.charAt(0)}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{activeContact?.name}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={12} /> Active Now
              </span>
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentMessages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            currentMessages.map(msg => (
              <div 
                key={msg.id} 
                style={{ 
                  alignSelf: msg.isOwn ? 'flex-end' : 'flex-start',
                  maxWidth: '70%'
                }}
              >
                <div style={{ 
                  backgroundColor: msg.isOwn ? 'var(--primary)' : 'var(--bg-color)', 
                  color: msg.isOwn ? 'white' : 'var(--text-main)',
                  padding: '0.75rem 1rem', 
                  borderRadius: msg.isOwn ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  boxShadow: 'var(--shadow-sm)',
                  border: msg.isOwn ? 'none' : '1px solid var(--border-color)'
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: msg.isOwn ? 'right' : 'left' }}>
                  {msg.time}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }}>
              <Paperclip size={20} />
            </button>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }}>
              <Image size={20} />
            </button>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Type a message..." 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              style={{ flex: 1, borderRadius: '20px' }}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              disabled={!inputMsg.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CoachMessages;
