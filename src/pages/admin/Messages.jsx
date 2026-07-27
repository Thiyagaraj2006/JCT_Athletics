import { useState, useEffect } from 'react';
import { Search, Mail, MailOpen, Trash2, Reply, X, Send } from 'lucide-react';
import axios from 'axios';

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  useEffect(() => {
    // Connect to actual backend
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/messages/admin');
        if (response.data && response.data.length > 0) {
          // Admin sees all messages or messages directed to them
          // We map it to the structure needed by UI
          setMessages(response.data.map(msg => ({
            id: msg.id,
            sender: msg.sender?.name || 'System',
            email: msg.sender?.email || 'noreply@athleticpro.com',
            subject: msg.text.substring(0, 30) + '...',
            content: msg.text,
            date: new Date(msg.created_at).toLocaleDateString(),
            time: new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            read: true,
            type: msg.sender?.role || 'System'
          })));
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, []);

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || null;

  const filteredMessages = messages
    .filter(m => (filter === 'All' ? true : filter === 'Unread' ? !m.read : true))
    .filter(m => 
      m.sender.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const markAsRead = (id) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const markAsUnread = (id) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: false } : m));
  };

  const deleteMessage = (id) => {
    setMessages(messages.filter(m => m.id !== id));
    if (selectedMessageId === id) {
      setSelectedMessageId(messages.length > 1 ? messages.find(m => m.id !== id)?.id : null);
    }
  };

  const handleSelectMessage = (id) => {
    setSelectedMessageId(id);
    markAsRead(id);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    // In a real app, this would send an API request
    alert(`Reply sent successfully to ${selectedMessage?.email}!`);
    setShowReplyModal(false);
    setReplyContent('');
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 150px)', gap: '1.5rem', position: 'relative' }}>
      
      {/* Left Pane: Message List */}
      <div className="card" style={{ width: '350px', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Inbox</h2>
          
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search messages..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn" 
              style={{ flex: 1, padding: '0.5rem', backgroundColor: filter === 'All' ? 'var(--primary)' : 'transparent', color: filter === 'All' ? 'white' : 'var(--text-main)', border: filter === 'All' ? 'none' : '1px solid #E2E8F0' }}
              onClick={() => setFilter('All')}
            >
              All
            </button>
            <button 
              className="btn" 
              style={{ flex: 1, padding: '0.5rem', backgroundColor: filter === 'Unread' ? 'var(--primary)' : 'transparent', color: filter === 'Unread' ? 'white' : 'var(--text-main)', border: filter === 'Unread' ? 'none' : '1px solid #E2E8F0' }}
              onClick={() => setFilter('Unread')}
            >
              Unread
            </button>
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredMessages.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No messages found.</div>
          ) : (
            filteredMessages.map(msg => (
              <div 
                key={msg.id} 
                onClick={() => handleSelectMessage(msg.id)}
                style={{ 
                  padding: '1rem 1.5rem', 
                  borderBottom: '1px solid #E2E8F0', 
                  cursor: 'pointer',
                  backgroundColor: selectedMessageId === msg.id ? '#F8FAFC' : 'transparent',
                  borderLeft: `4px solid ${!msg.read ? 'var(--primary)' : 'transparent'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: !msg.read ? '600' : '500', color: 'var(--text-main)' }}>{msg.sender}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{msg.date}</span>
                </div>
                <div style={{ fontWeight: !msg.read ? '600' : '400', fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {msg.subject}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Message Detail */}
      <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedMessage ? (
          <>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>{selectedMessage.subject}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {selectedMessage.sender.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>{selectedMessage.sender} <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.875rem' }}>&lt;{selectedMessage.email}&gt;</span></div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedMessage.date} at {selectedMessage.time}</div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selectedMessage.type !== 'System' && (
                  <button 
                    className="btn" 
                    style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid #E2E8F0', color: 'var(--text-muted)' }} 
                    title="Reply"
                    onClick={() => setShowReplyModal(true)}
                  >
                    <Reply size={18} />
                  </button>
                )}
                {selectedMessage.read ? (
                  <button 
                    className="btn" 
                    style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid #E2E8F0', color: 'var(--text-muted)' }} 
                    title="Mark as Unread"
                    onClick={() => markAsUnread(selectedMessage.id)}
                  >
                    <Mail size={18} />
                  </button>
                ) : (
                  <button 
                    className="btn" 
                    style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid #E2E8F0', color: 'var(--text-muted)' }} 
                    title="Mark as Read"
                    onClick={() => markAsRead(selectedMessage.id)}
                  >
                    <MailOpen size={18} />
                  </button>
                )}
                <button 
                  className="btn" 
                  style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid #E2E8F0', color: '#F43F5E' }} 
                  title="Delete"
                  onClick={() => deleteMessage(selectedMessage.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-main)' }}>
                {selectedMessage.content}
              </div>
            </div>
            
            {selectedMessage.type !== 'System' && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                  onClick={() => setShowReplyModal(true)}
                >
                  <Reply size={18} /> Reply
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <Mail size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Select a message to read</p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Reply size={20} /> Reply to {selectedMessage.sender}
              </h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowReplyModal(false)}>
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>
            
            <form onSubmit={handleSendReply}>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <strong>To:</strong> {selectedMessage.email}
                </div>
                <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <strong>Subject:</strong> Re: {selectedMessage.subject}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <textarea 
                    className="form-control" 
                    placeholder="Type your reply here..." 
                    style={{ minHeight: '200px', resize: 'vertical' }}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    autoFocus
                  ></textarea>
                </div>
              </div>
              
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#F8FAFC' }}>
                <button type="button" className="btn" style={{ backgroundColor: '#E2E8F0', color: 'var(--text-main)' }} onClick={() => setShowReplyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={16} /> Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
