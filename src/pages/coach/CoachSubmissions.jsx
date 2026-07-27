import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Clock, MessageSquare, X, Send, Activity, Info, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';


const CoachSubmissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get('/api/workouts');
        if (response.data && response.data.length > 0) {
           // Mapping real backend data if we had completed submissions
           setSubmissions([]);
        } else {
           setSubmissions([]);
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
      }
    };
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions
    .filter(sub => filterStatus === 'All' || sub.status === filterStatus)
    .filter(sub => 
      sub.playerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sub.workoutTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const openReviewModal = (submission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.coachFeedback || '');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSubmissions(submissions.map(sub => 
      sub.id === selectedSubmission.id 
        ? { ...sub, status: 'Reviewed', coachFeedback: feedback } 
        : sub
    ));
    
    setShowReviewModal(false);
    setSelectedSubmission(null);
    setFeedback('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>Workout Submissions</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Review and provide feedback on your athletes' recent training sessions.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by player or workout..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn" 
            style={{ padding: '0.5rem 1rem', backgroundColor: filterStatus === 'Pending' ? 'var(--primary)' : 'transparent', color: filterStatus === 'Pending' ? 'white' : 'var(--text-main)', border: filterStatus === 'Pending' ? 'none' : '1px solid #E2E8F0' }}
            onClick={() => setFilterStatus('Pending')}
          >
            Pending Review
          </button>
          <button 
            className="btn" 
            style={{ padding: '0.5rem 1rem', backgroundColor: filterStatus === 'Reviewed' ? 'var(--success)' : 'transparent', color: filterStatus === 'Reviewed' ? 'white' : 'var(--text-main)', border: filterStatus === 'Reviewed' ? 'none' : '1px solid #E2E8F0' }}
            onClick={() => setFilterStatus('Reviewed')}
          >
            Reviewed
          </button>
          <button 
            className="btn" 
            style={{ padding: '0.5rem 1rem', backgroundColor: filterStatus === 'All' ? 'var(--text-main)' : 'transparent', color: filterStatus === 'All' ? 'white' : 'var(--text-main)', border: filterStatus === 'All' ? 'none' : '1px solid #E2E8F0' }}
            onClick={() => setFilterStatus('All')}
          >
            All Submissions
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredSubmissions.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
            <p>No submissions found in this category.</p>
          </div>
        ) : (
          filteredSubmissions.map(submission => (
            <div key={submission.id} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: `4px solid ${submission.status === 'Pending' ? 'var(--warning)' : 'var(--success)'}` }}>
              <img src={submission.img ? `${API_BASE_URL}${submission.img}` : 'https://images.unsplash.com/photo-1552674605-15caff8d65e9?auto=format&fit=crop&w=60&h=60&q=80'} alt={submission.playerName} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Link to={`/players/${submission.playerId}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                        {submission.playerName}
                      </Link>
                      <span className={`badge ${submission.status === 'Pending' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.75rem' }}>
                        {submission.status}
                      </span>
                    </h3>
                    <div style={{ color: 'var(--primary)', fontWeight: '500', fontSize: '1.1rem' }}>{submission.workoutTitle}</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon size={14} /> {submission.date}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <Clock size={16} /> Duration: <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{submission.duration}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <Activity size={16} /> RPE: <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{submission.rpe}/10</span>
                  </div>
                  
                  {Object.entries(submission.metrics).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <Info size={16} /> {key}: <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: submission.status === 'Reviewed' ? '1rem' : '0' }}>
                  <div style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={16} color="var(--primary)" /> Player Notes:
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    "{submission.playerNotes}"
                  </div>
                </div>

                {submission.status === 'Reviewed' && submission.coachFeedback && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                      <CheckCircle size={16} /> Your Feedback:
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      {submission.coachFeedback}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  className={`btn ${submission.status === 'Pending' ? 'btn-primary' : ''}`}
                  style={{ 
                    width: '120px', 
                    backgroundColor: submission.status === 'Pending' ? 'var(--primary)' : 'white', 
                    border: submission.status === 'Pending' ? 'none' : '1px solid #E2E8F0',
                    color: submission.status === 'Pending' ? 'white' : 'var(--text-main)'
                  }}
                  onClick={() => openReviewModal(submission)}
                >
                  {submission.status === 'Pending' ? 'Review' : 'Edit Review'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} color="var(--primary)" /> Review Submission
              </h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowReviewModal(false)}>
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit}>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img src={selectedSubmission.img ? `${API_BASE_URL}${selectedSubmission.img}` : 'https://images.unsplash.com/photo-1552674605-15caff8d65e9?auto=format&fit=crop&w=40&h=40&q=80'} alt={selectedSubmission.playerName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '600' }}>{selectedSubmission.playerName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{selectedSubmission.workoutTitle} • {selectedSubmission.date}</div>
                  </div>
                </div>
                
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Player Notes:</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                    "{selectedSubmission.playerNotes}"
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Coach Feedback</label>
                  <textarea 
                    className="form-control" 
                    placeholder="Provide feedback on their performance, technique, or effort..." 
                    style={{ minHeight: '150px', resize: 'vertical' }}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                    autoFocus
                  ></textarea>
                </div>
              </div>
              
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#F8FAFC' }}>
                <button type="button" className="btn" style={{ backgroundColor: '#E2E8F0', color: 'var(--text-main)' }} onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={16} /> Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachSubmissions;
