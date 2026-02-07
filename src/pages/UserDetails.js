import { useEffect, useMemo, useState } from 'react';

export default function UserDetails({ role }) {
  const auth = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ct_auth') || 'null'); } catch { return null; }
  }, []);

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth || auth.role !== role) {
      window.location.hash = role === 'NGO' ? '#/login/ngo' : '#/login/volunteer';
      return;
    }

    try {
      const key = role === 'NGO' ? 'ct_ngo_users' : 'ct_volunteer_users';
      const users = JSON.parse(localStorage.getItem(key) || '[]');
      const byEmail = auth?.userEmail ? users.find(u => u.email === auth.userEmail) : null;
      const current = byEmail || users[users.length - 1] || null;
      setUser(current);
    } catch {}
  }, [auth, role]);

  const logout = () => {
    localStorage.removeItem('ct_auth');
    window.location.hash = '#/';
  };

  const goBack = () => {
    window.location.hash = role === 'NGO' ? '#/ngo' : '#/volunteer';
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b7280' }}>Loading user details...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        {/* Logo */}
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #16A34A, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>CT</span>
        </div>
        <button onClick={goBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#16A34A', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 19l-7-7 7-7" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Dashboard
        </button>
        <span style={{ fontSize: 22, fontWeight: 700 }}>User Profile</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={logout} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <span style={{ width: 60, height: 60, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 24, background: 'linear-gradient(135deg,#7C3AED,#3B82F6)' }}>
            {role === 'NGO' ? (user.orgName || 'N')[0].toUpperCase() : (user.fullName || 'V')[0].toUpperCase()}
          </span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              {role === 'NGO' ? user.orgName || 'NGO User' : user.fullName || 'Volunteer'}
            </div>
            <span style={{ padding: '2px 8px', borderRadius: 999, background: '#ECFDF5', color: '#16A34A', fontSize: 12, fontWeight: 600 }}>
              {role}
            </span>
          </div>
        </div>

        {/* User Details */}
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Contact Information</div>
          
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Email Address</span>
              <span style={{ color: '#111827' }}>{user.email || '—'}</span>
            </div>

            {role === 'NGO' && (
              <>
                <div style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Contact Person</span>
                  <span style={{ color: '#111827' }}>{user.contactName || '—'}</span>
                </div>
                <div style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Darpan ID</span>
                  <span style={{ color: '#111827' }}>{user.darpanId || '—'}</span>
                </div>
              </>
            )}

            {role === 'Volunteer' && (
              <div style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Aadhaar Number</span>
                <span style={{ color: '#111827' }}>{user.aadhaarNo || '—'}</span>
              </div>
            )}

            <div style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Account Created</span>
              <span style={{ color: '#111827' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : '—'}
              </span>
            </div>
          </div>

          {/* Account Stats */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Account Statistics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Trust Score</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#16A34A' }}>85/100</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                  {role === 'NGO' ? 'Listings Published' : 'Volunteered For'}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#3B82F6' }}>
                  {role === 'NGO' ? getListingsCount(user.email) : getVolunteerCount(user.email)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getListingsCount(userEmail) {
  try {
    const listings = JSON.parse(localStorage.getItem('ct_ngo_listings') || '[]');
    return listings.filter(l => l.orgEmail === userEmail).length;
  } catch {
    return 0;
  }
}

function getVolunteerCount(userEmail) {
  // This would track volunteer participation in the future
  // For now, return a placeholder
  return Math.floor(Math.random() * 10);
}
