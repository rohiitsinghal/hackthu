import { useState } from 'react';

export default function SignupVolunteer({ onBack, onCreate }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    if (!fullName.trim()) return 'Full Name is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email';
    if (!/^\d{12}$/.test(aadhaarNo)) return 'Aadhaar Number must be 12 digits';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirm) return 'Passwords do not match';
    return '';
  };

  const handleCreate = () => {
    const v = validate();
    if (v) { setErr(v); return; }
    const key = 'ct_volunteer_users';
    const users = JSON.parse(localStorage.getItem(key) || '[]');
    if (users.some(u => u.email === email)) { setErr('An account with this email already exists'); return; }
    const user = { fullName, email, aadhaarNo, password, createdAt: Date.now() };
    localStorage.setItem(key, JSON.stringify([...users, user]));
    setErr('');
    onCreate(user); // pass user to App
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
            Volunteer
          </span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}>Join CommuniTree</div>
        <div style={{ color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
          Create your account to start connecting with your community
        </div>

        <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
          <label style={{ fontSize: 14, color: '#374151' }}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Enter your full name"
              style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1px solid #e5e7eb', borderRadius: 10 }}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>
            </span>
          </div>

          <label style={{ fontSize: 14, color: '#374151' }}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email address"
              style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1px solid #e5e7eb', borderRadius: 10 }}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 6h16v12H4z" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M4 8l8 5 8-5" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>
            </span>
          </div>

          <label style={{ fontSize: 14, color: '#374151' }}>Aadhaar Number</label>
          <div style={{ position: 'relative' }}>
            <input
              value={aadhaarNo}
              onChange={e => setAadhaarNo(e.target.value)}
              inputMode="numeric"
              placeholder="Enter your 12-digit Aadhaar number"
              style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1px solid #e5e7eb', borderRadius: 10 }}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" strokeWidth="1.8"/><polyline points="14,2 14,8 20,8" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>
            </span>
          </div>

          <label style={{ fontSize: 14, color: '#374151' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={showPwd ? 'text' : 'password'}
              placeholder="Enter your password (min 8 characters)"
              style={{ width: '100%', padding: '12px 40px 12px 40px', border: '1px solid #e5e7eb', borderRadius: 10 }}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>
            </span>
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              aria-label="Toggle password visibility"
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                {showPwd
                  ? <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                  : <>
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </>}
              </svg>
            </button>
          </div>

          <label style={{ fontSize: 14, color: '#374151' }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm your password"
              style={{ width: '100%', padding: '12px 40px 12px 40px', border: '1px solid #e5e7eb', borderRadius: 10 }}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>
            </span>
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              aria-label="Toggle confirm password visibility"
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                {showConfirm
                  ? <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                  : <>
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </>}
              </svg>
            </button>
          </div>

          {err && <div style={{ color: '#DC2626', fontSize: 13 }}>{err}</div>}

          <button onClick={handleCreate} style={{ marginTop: 6, width: '100%', padding: '12px 14px', borderRadius: 10, border: 'none', background: '#16A34A', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            Create Account
          </button>

          <div style={{ textAlign: 'center', marginTop: 8, color: '#374151' }}>
            Already have an account? <a href="#/login/volunteer" style={{ color: '#16A34A' }}>Sign In</a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, color: '#6b7280', fontSize: 12, textAlign: 'center' }}>
        By continuing, you agree to our <a href="#/terms" style={{ color: '#16A34A' }}>Terms of Service</a> and <a href="#/privacy" style={{ color: '#16A34A' }}>Privacy Policy</a>
      </div>
    </div>
  );
}
