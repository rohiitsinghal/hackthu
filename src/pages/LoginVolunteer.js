import { useState } from 'react';

export default function LoginVolunteer({ onBack, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = () => {
    const users = JSON.parse(localStorage.getItem('ct_volunteer_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (found) { setErr(''); onLogin(); } else { setErr('Invalid email or password'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(1200px 400px at 20% 5%, #ECFDF5 0%, #ffffff 40%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', display: 'inline-flex', gap: 8, alignItems: 'center', color: '#16A34A', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14 }}>
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 19l-7-7 7-7" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to role selection
      </button>

      <div style={{ marginTop: 24, display: 'grid', justifyItems: 'center', gap: 8 }}>
        <span style={{ width: 60, height: 60, borderRadius: '50%', background: '#16A34A', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>CT</span>
        <div style={{ fontSize: 24, fontWeight: 700 }}>CommuniTree</div>
        <div style={{ color: '#6b7280' }}>Connect. Contribute. Grow.</div>
      </div>

      <div style={{ marginTop: 28, background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.08)', width: 'min(560px, 92vw)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <span style={{ padding: '6px 12px', borderRadius: 999, background: '#ECFDF5', color: '#16A34A', fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
            VOLUNTEER
          </span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}>Welcome Back</div>
        <div style={{ color: '#6b7280', textAlign: 'center', marginTop: 4 }}>Sign in to your volunteer account</div>

        <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
          <label style={{ fontSize: 14, color: '#374151' }}>Email Address</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your email address" style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10, outline: 'none' }} />
          <label style={{ fontSize: 14, color: '#374151' }}>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Enter your password" style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10, outline: 'none' }} />
          {err && <div style={{ color: '#DC2626', fontSize: 13 }}>{err}</div>}
          <button onClick={handleSubmit} style={{ marginTop: 6, width: '100%', padding: '12px 14px', borderRadius: 10, border: 'none', background: '#16A34A', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            Sign In
          </button>
          <div style={{ textAlign: 'center', marginTop: 8, color: '#374151' }}>
            Don't have an account? <a href="#/signup/volunteer" style={{ color: '#16A34A' }}>Create Account</a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, color: '#6b7280', fontSize: 12, textAlign: 'center' }}>
        By continuing, you agree to our <a href="#/terms" style={{ color: '#16A34A' }}>Terms of Service</a> and <a href="#/privacy" style={{ color: '#16A34A' }}>Privacy Policy</a>
      </div>
    </div>
  );
}
