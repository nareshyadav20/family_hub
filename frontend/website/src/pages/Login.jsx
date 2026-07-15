import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [params] = useSearchParams();
  const isJoin = params.get('join') === 'true';
  const [mode, setMode] = useState(isJoin ? 'join' : 'login'); // login | join | otp
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
  const navigate = null; // Removed hook since we are hard redirecting
  const API_URL = `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

  // Requirement 7: If the user is already logged in, automatically redirect them based on their role
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
       try {
         const user = JSON.parse(userStr);
         const targetUrl = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'FAMILY_ADMIN' 
             ? 'http://localhost:5173/admin/dashboard' 
             : 'http://localhost:5173/member/dashboard';
         window.location.replace(`${targetUrl}?token=${token}&user=${encodeURIComponent(userStr)}`);
       } catch(e) {}
    }
  }, []);

  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email: form.email, password: form.password });
      const payload = res.data.success !== undefined ? res.data : res.data; 
      
      const { token, user } = payload;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      const role = user.role;
      const targetUrl = (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FAMILY_ADMIN')
        ? 'http://localhost:5173/admin/dashboard'
        : 'http://localhost:5173/member/dashboard';
      
      window.location.replace(`${targetUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setOtpSent(true); setMode('otp'); }, 1500);
  };

  const handleOtpLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('token', 'mock_website_token');
      localStorage.setItem('user', JSON.stringify({ name: 'Arjun Smith', email: form.email, role: 'member' }));
      navigate('/private');
    }, 1500);
  };

  const handleOtpChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #ECFDF5 100%)' }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 64px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -100, right: -100 }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -100, left: -80 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64, textDecoration: 'none', color: 'white' }}>
            <ArrowLeft size={18} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Back to Website</span>
          </Link>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 36, fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
            Welcome to<br />FamilyHub OS
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.8, marginBottom: 48, maxWidth: 360 }}>
            Your family's digital home. Log in to access memories, events, documents, and stay connected with every family member.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              ['🔒', 'Bank-level security for your family data'],
              ['🌍', 'Access from anywhere in the world'],
              ['📸', 'Unlimited photos and memories storage'],
              ['👨‍👩‍👧‍👦', 'Connect generations through a beautiful tree'],
            ].map(([emoji, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 14, opacity: 0.85 }}>
                <span style={{ fontSize: 20 }}>{emoji}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {mode === 'otp' ? (
            <div style={{ animation: 'fadeInUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Phone size={28} color="#4F46E5" />
                </div>
                <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 28, color: '#111827', marginBottom: 10 }}>Enter OTP</h2>
                <p style={{ color: '#6B7280', fontSize: 15 }}>We sent a 6-digit code to <strong>{form.email}</strong></p>
              </div>
              <form onSubmit={handleOtpLogin}>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
                  {otp.map((val, idx) => (
                    <input key={idx} id={`otp-${idx}`} maxLength={1} value={val} onChange={e => handleOtpChange(e.target.value, idx)} style={{ width: 52, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 700, borderRadius: 14, border: `2px solid ${val ? '#4F46E5' : '#E5E7EB'}`, outline: 'none', fontFamily: 'Poppins,sans-serif', color: '#111827', transition: 'border-color 0.2s' }} />
                  ))}
                </div>
                <button type="submit" disabled={loading || otp.join('').length < 6} style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', opacity: loading ? 0.7 : 1, transition: 'all 0.3s', marginBottom: 16 }}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <button type="button" onClick={() => setMode('login')} style={{ width: '100%', padding: '14px', borderRadius: 14, border: '1px solid #E5E7EB', cursor: 'pointer', fontWeight: 600, fontSize: 15, background: 'white', color: '#374151' }}>
                  ← Back
                </button>
              </form>
            </div>
          ) : (
            <div style={{ animation: 'fadeInUp 0.5s ease both' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', padding: 4, borderRadius: 14, marginBottom: 36 }}>
                {[['login', 'Sign In'], ['join', 'Join Family']].map(([val, label]) => (
                  <button key={val} onClick={() => setMode(val)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, transition: 'all 0.2s', background: mode === val ? 'white' : 'transparent', color: mode === val ? '#4F46E5' : '#6B7280', boxShadow: mode === val ? '0 2px 10px rgba(0,0,0,0.08)' : 'none' }}>
                    {label}
                  </button>
                ))}
              </div>

              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 28, color: '#111827', marginBottom: 8 }}>
                {mode === 'login' ? 'Welcome Back!' : 'Join Your Family'}
              </h2>
              <p style={{ color: '#6B7280', fontSize: 15, marginBottom: 32 }}>
                {mode === 'login' ? 'Sign in to access your family\'s private space' : 'Request access to your family\'s FamilyHub'}
              </p>

              {errorMsg && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>{errorMsg}</div>}

              <form onSubmit={mode === 'login' ? handleLogin : handleSendOtp}>
                {mode === 'join' && (
                  <>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Your full name" style={{ width: '100%', padding: '14px 16px 14px 42px', borderRadius: 14, border: '1px solid #E5E7EB', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#4F46E5'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Phone Number</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required placeholder="+1 234 567 8900" style={{ width: '100%', padding: '14px 16px 14px 42px', borderRadius: 14, border: '1px solid #E5E7EB', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#4F46E5'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                      </div>
                    </div>
                  </>
                )}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="name@family.com" style={{ width: '100%', padding: '14px 16px 14px 42px', borderRadius: 14, border: '1px solid #E5E7EB', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#4F46E5'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                  </div>
                </div>
                {mode === 'login' && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Password</label>
                      <a href="#" style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                      <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Enter your password" style={{ width: '100%', padding: '14px 48px 14px 42px', borderRadius: 14, border: '1px solid #E5E7EB', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#4F46E5'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: loading ? 'wait' : 'pointer', fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', opacity: loading ? 0.7 : 1, transition: 'all 0.3s', marginBottom: 20 }}>
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign In to FamilyHub' : 'Send Join Request'}
                </button>
              </form>

              {mode === 'login' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
                    <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>or login with OTP</span>
                    <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
                  </div>
                  <button onClick={handleSendOtp} style={{ width: '100%', padding: '14px', borderRadius: 14, border: '1px solid #E5E7EB', cursor: 'pointer', fontWeight: 600, fontSize: 15, background: 'white', color: '#374151', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#4F46E5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E5E7EB'; }}>
                    📱 Login with OTP
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
