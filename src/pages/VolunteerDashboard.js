import { useEffect, useMemo, useState } from 'react';

// Dynamic header with real user data
function Header({ user, onLogout }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>CommuniTree</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Grow Track pill */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706' }} />
          Grow Track
        </span>
        {/* Trust pill */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: '#DCFCE7', color: '#065F46', border: '1px solid #A7F3D0', fontWeight: 600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l3 6 6 .5-4.5 4 1.5 6-6-3.5-6 3.5 1.5-6L3 9.5 9 9l3-6z" fill="none" stroke="#065F46" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Trust: 85/100
        </span>
        {/* User Menu */}
        <UserMenu user={user} onLogout={onLogout} />
      </div>
    </div>
  );
}

export default function VolunteerDashboard() {
  const auth = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ct_auth') || 'null'); } catch { return null; }
  }, []);

  // Gate: only volunteers can access
  useEffect(() => {
    if (!auth || auth.role !== 'Volunteer') {
      window.location.hash = '#/login/volunteer';
    }
  }, [auth]);

  const TYPES = [
    'Animal Welfare',
    'Child Welfare',
    'Community Development',
    'Disaster Relief',
    'Education',
    'Environment',
    'Healthcare',
    'Women Empowerment',
    'Student Welfare',
    'General',
  ];

  const [q, setQ] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [onlyNeeding, setOnlyNeeding] = useState(false);
  const [sortKey, setSortKey] = useState('recent'); // recent | need | have
  const [listings, setListings] = useState([]);

  // Resolve current volunteer user
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem('ct_volunteer_users') || '[]');
      const byEmail = auth?.userEmail ? users.find(u => u.email === auth.userEmail) : null;
      const current = byEmail || users[users.length - 1] || null;
      setCurrentUser(current);
    } catch {}
  }, [auth]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('ct_ngo_listings') || '[]');
    setListings(all.filter(l => l.ownerRole === 'NGO'));
  }, []);

  const toggleType = (t) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };
  const clearFilters = () => {
    setQ('');
    setSelectedTypes([]);
    setOnlyNeeding(false);
    setSortKey('recent');
  };

  const filtered = listings
    .filter(l => {
      const text = (l.orgName + ' ' + (l.description || '') + ' ' + (l.types || []).join(' ')).toLowerCase();
      const matchesText = q ? text.includes(q.toLowerCase()) : true;
      const matchesTypes = selectedTypes.length ? (l.types || []).some(t => selectedTypes.includes(t)) : true;
      const need = Math.max(parseInt(l.needVolunteers, 10) || 0, 0);
      const matchesNeed = onlyNeeding ? need > 0 : true;
      return matchesText && matchesTypes && matchesNeed;
    })
    .sort((a, b) => {
      const na = Math.max(parseInt(a.needVolunteers, 10) || 0, 0);
      const nb = Math.max(parseInt(b.needVolunteers, 10) || 0, 0);
      const ha = Math.max(parseInt(a.haveVolunteers, 10) || 0, 0);
      const hb = Math.max(parseInt(b.haveVolunteers, 10) || 0, 0);
      if (sortKey === 'need') return nb - na;         // highest need first
      if (sortKey === 'have') return hb - ha;         // most volunteers have
      return (b.createdAt || 0) - (a.createdAt || 0); // recent by default
    });

  const handleVolunteer = (id) => {
    const all = JSON.parse(localStorage.getItem('ct_ngo_listings') || '[]');
    const idx = all.findIndex(l => l.id === id);
    if (idx < 0) return;
    const item = all[idx];
    const need = Math.max(parseInt(item.needVolunteers, 10) || 0, 0);
    const have = Math.max(parseInt(item.haveVolunteers, 10) || 0, 0);
    if (need <= 0) {
      alert('All volunteer needs are filled for this listing.');
      return;
    }
    all[idx] = { ...item, haveVolunteers: have + 1, needVolunteers: need - 1 };
    localStorage.setItem('ct_ngo_listings', JSON.stringify(all));
    setListings(all.filter(l => l.ownerRole === 'NGO'));
  };

  const logout = () => {
    localStorage.removeItem('ct_auth');
    window.location.hash = '#/';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header user={currentUser} onLogout={logout} />
      <div style={{ padding: 24 }}>
        {/* Filters */}
        <div style={{ marginTop: 16, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search NGOs, projects, or descriptions…"
              style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
            />
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
            >
              <option value="recent">Sort: Recent</option>
              <option value="need">Sort: Highest Need</option>
              <option value="have">Sort: Most Volunteers</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
              <input type="checkbox" checked={onlyNeeding} onChange={e => setOnlyNeeding(e.target.checked)} />
              Show needing volunteers
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: '1px solid #e5e7eb',
                  background: selectedTypes.includes(t) ? '#DCFCE7' : '#fff',
                  color: selectedTypes.includes(t) ? '#16A34A' : '#374151',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                {t}
              </button>
            ))}
            <button
              onClick={clearFilters}
              style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: 999, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 12 }}
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))', gap: 16 }}>
          {filtered.map(item => (
            <Card key={item.id} item={item} onVolunteer={() => handleVolunteer(item.id)} />
          ))}
          {filtered.length === 0 && <div style={{ color: '#6b7280' }}>No opportunities found.</div>}
        </div>
      </div>
    </div>
  );
}

function Card({ item, onVolunteer }) {
  const need = Math.max(parseInt(item.needVolunteers, 10) || 0, 0);
  const have = Math.max(parseInt(item.haveVolunteers, 10) || 0, 0);

  return (
    <div style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontWeight: 700 }}>{item.orgName}</div>
        <span style={{ padding: '2px 8px', borderRadius: 999, background: '#EEF2FF', color: '#374151', fontSize: 12 }}>
          {new Date(item.createdAt || Date.now()).toLocaleDateString()}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(item.types || []).map(t => (
          <span key={t} style={{ padding: '2px 8px', borderRadius: 999, background: '#DCFCE7', color: '#16A34A', fontSize: 12 }}>
            {t}
          </span>
        ))}
      </div>

      <div style={{ color: '#6b7280' }}>
        {(item.description || '').length > 140 ? item.description.slice(0, 140) + '…' : item.description}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ padding: '2px 8px', borderRadius: 999, background: '#EEF2FF', color: '#374151', fontSize: 12 }}>
          Have: <strong style={{ marginLeft: 4 }}>{have}</strong>
        </span>
        <span style={{ padding: '2px 8px', borderRadius: 999, background: need > 0 ? '#FEE2E2' : '#E5E7EB', color: need > 0 ? '#B91C1C' : '#6b7280', fontSize: 12 }}>
          Need: <strong style={{ marginLeft: 4 }}>{need}</strong>
        </span>
      </div>

      <button
        onClick={onVolunteer}
        style={{
          marginTop: 4,
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: 'none',
          background: need > 0 ? '#16A34A' : '#9CA3AF',
          color: '#fff',
          fontWeight: 600,
          cursor: need > 0 ? 'pointer' : 'not-allowed'
        }}
        disabled={need === 0}
      >
        Volunteer
      </button>
    </div>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const name = (user?.fullName || 'Volunteer').trim();
  const email = user?.email || '—';
  const aadhaar = user?.aadhaarNo || '—';
  const initial = name ? name[0].toUpperCase() : 'V';

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest?.('.user-menu-root')) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const viewProfile = () => {
    window.location.hash = '#/profile/volunteer';
  };

  return (
    <div className="user-menu-root" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, background: 'linear-gradient(135deg,#7C3AED,#3B82F6)' }}>
          {initial}
        </span>
        <span style={{ color: '#374151', fontWeight: 500 }}>{name}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 260, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.08)', padding: 12 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Quick Info</div>
            <div style={{ fontSize: 13, color: '#374151' }}>Name: <span style={{ color: '#111827' }}>{name}</span></div>
            <div style={{ fontSize: 13, color: '#374151' }}>Email: <span style={{ color: '#111827' }}>{email}</span></div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={viewProfile} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8fafc', color: '#374151', cursor: 'pointer', fontSize: 13 }}>
              User Details
            </button>
            <button onClick={onLogout} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13 }}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
