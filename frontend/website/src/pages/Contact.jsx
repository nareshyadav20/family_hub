import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Share2, Camera, MessageCircle } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1800);
  };

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Header */}
      <section style={{ padding: '64px 0 48px', background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', textAlign: 'center' }}>
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>Get in Touch</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>Contact <span className="gradient-text">Us</span></h1>
          <p style={{ fontSize: 17, color: '#6B7280' }}>Have questions? We would love to hear from you. Send us a message and we will get back within 24 hours.</p>
        </div>
      </section>

      <section style={{ padding: '64px 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 48, alignItems: 'start' }}>
            {/* Contact info */}
            <div>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 32, color: '#111827' }}>Let's Connect</h2>
              {[
                { icon: Mail, title: 'Email Us', value: 'family@familyhubos.com', sub: 'We reply within 24 hours', color: '#4F46E5' },
                { icon: Phone, title: 'Call Us', value: '+1 (555) 123-4567', sub: 'Mon–Fri, 9am–6pm EST', color: '#7C3AED' },
                { icon: MapPin, title: 'Visit Us', value: '123 Family Lane', sub: 'San Francisco, CA 94105', color: '#14B8A6' },
              ].map(({ icon: Icon, title, value, sub, color }) => (
                <div key={title} style={{ display: 'flex', gap: 16, marginBottom: 28, padding: 20, borderRadius: 16, border: '1px solid #F3F4F6', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 4 }}>{title}</div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: '#111827', marginBottom: 2 }}>{value}</div>
                    <div style={{ fontSize: 13, color: '#9CA3AF' }}>{sub}</div>
                  </div>
                </div>
              ))}

              {/* Social */}
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#111827' }}>Follow Our Family</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[Share2, Camera, MessageCircle].map((Icon, i) => (
                    <a key={i} href="#" style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', transition: 'all 0.2s', textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#4F46E5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#E5E7EB'; }}>
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: 'white', borderRadius: 24, padding: 40, border: '1px solid #E5E7EB', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={40} color="#10B981" />
                  </div>
                  <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 24, color: '#111827', marginBottom: 12 }}>Message Sent!</h3>
                  <p style={{ color: '#6B7280', fontSize: 16, lineHeight: 1.7 }}>Thank you for reaching out. We will get back to you within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} style={{ marginTop: 24, padding: '12px 28px', borderRadius: 50, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 26, color: '#111827', marginBottom: 28 }}>Send a Message</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    {['name', 'email'].map(field => (
                      <div key={field}>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{field === 'name' ? 'Your Name' : 'Email Address'}</label>
                        <input type={field === 'email' ? 'email' : 'text'} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} required placeholder={field === 'name' ? 'John Smith' : 'john@example.com'} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
                          onFocus={e => e.target.style.borderColor = '#4F46E5'}
                          onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Subject</label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none', background: 'white' }}>
                      <option value="">Select a subject...</option>
                      <option>General Inquiry</option>
                      <option>Join the Family</option>
                      <option>Event Planning</option>
                      <option>Technical Support</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Message</label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={5} placeholder="Tell us how we can help..." style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Inter,sans-serif', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = '#4F46E5'}
                      onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                  </div>
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', opacity: loading ? 0.7 : 1, transition: 'all 0.3s' }}>
                    {loading ? <><span style={{ animation: 'float 1s ease-in-out infinite', display: 'inline-block' }}>⏳</span> Sending...</> : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
