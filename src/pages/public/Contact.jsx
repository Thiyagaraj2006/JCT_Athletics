import { useState } from 'react';
import { MapPin, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      // Send form data to the backend API
      const res = await axios.post('/api/contact', formData);

      if (res.status === 201) {
        setStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: 'General Inquiry',
          message: ''
        });
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.response?.data?.error || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', padding: '3rem 5%' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>Contact Us</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '4rem' }}>
          Have questions about our program? Get in touch with our management team.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          {/* Contact Form */}
          <div className="card">
            <h2 style={{ marginBottom: '2rem' }}>Send a Message</h2>

            {status === 'success' && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} />
                Your message has been sent successfully! We will get back to you soon.
              </div>
            )}

            {status === 'error' && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-control" name="subject" value={formData.subject} onChange={handleChange}>
                  <option>General Inquiry</option>
                  <option>Recruitment</option>
                  <option>Sponsorship</option>
                  <option>Media/Press</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-control" name="message" value={formData.message} onChange={handleChange} placeholder="How can we help you?" required minLength="10" rows="5"></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Details & Map */}
          <div>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Contact Information</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>Training Facility</h4>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>JCT College of Engineering and Technology<br />Pichanur<br />Coimbatore, Tamil Nadu 641105</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>Phone</h4>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>+91 93614 88801</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>Email</h4>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>info@jct.ac.in</p>
                  </div>
                </div>
              </div>

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Follow Us</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="https://www.facebook.com/jctinstitutions" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: '50%', color: 'var(--text-main)', display: 'inline-flex' }}>
                  <span style={{ fontWeight: 'bold' }}>FB</span>
                </a>
                <a href="https://www.instagram.com/jct_athletics?igsh=MXF1MnRnbnBpZnpwcA==" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: '50%', color: 'var(--text-main)', display: 'inline-flex' }}>
                  <span style={{ fontWeight: 'bold' }}>IG</span>
                </a>
                <a href="https://www.youtube.com/@jctinstitutions" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: '50%', color: 'var(--text-main)', display: 'inline-flex' }}>
                  <span style={{ fontWeight: 'bold' }}>YT</span>
                </a>
              </div>
            </div>

            {/* Real Map Embed */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', height: '300px' }}>
              <iframe
                title="Google Maps Location"
                src="https://maps.google.com/maps?q=JCT%20College%20of%20Engineering%20and%20Technology,%20coimbatore&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
