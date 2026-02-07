import { useEffect, useMemo, useState } from 'react';

export default function NGODashboard() {
  const auth = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ct_auth') || 'null'); } catch { return null; }
  }, []);

  // Gate: only NGOs can access
  useEffect(() => {
    if (!auth || auth.role !== 'NGO') {
      window.location.hash = '#/login/ngo';
    }
  }, [auth]);

  // Signed-up NGO account (prefill org details)
  const [account, setAccount] = useState(null);
  const [orgName, setOrgName] = useState('');
  const [types, setTypes] = useState(['Child Welfare']);
  // Use blank defaults instead of 0
  const [haveVolunteers, setHaveVolunteers] = useState(''); // was 0
  const [needVolunteers, setNeedVolunteers] = useState(''); // was 0
  const [description, setDescription] = useState('');
  const [listings, setListings] = useState([]);

  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem('ct_ngo_users') || '[]');
      // Prefer the user matching auth.userEmail, else fallback to the last created NGO user
      const byEmail = auth?.userEmail ? users.find(u => u.email === auth.userEmail) : null;
      const current = byEmail || users[users.length - 1] || null;
      setAccount(current);
      if (current?.orgName) setOrgName(current.orgName);
    } catch {}
  }, [auth]);

  const ALL_TYPES = [
    'Child Welfare',
    'Student Welfare',
    'Community Development',
    'Education',
    'Healthcare',
    'Environment',
    'Women Empowerment',
    'Disaster Relief',
    'Animal Welfare',
    'General',
  ];

  // Load my listings (filter by orgName if provided, else show all NGO listings)
  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('ct_ngo_listings') || '[]');
    setListings(all.filter(l => l.ownerRole === 'NGO'));
  }, []);

  const toggleType = (t) => {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const publish = () => {
    const desc = description.trim();
    // Safely parse to non-negative integers
    const haveRaw = parseInt(haveVolunteers, 10);
    const needRaw = parseInt(needVolunteers, 10);
    const have = Number.isFinite(haveRaw) ? Math.max(haveRaw, 0) : 0;
    const need = Number.isFinite(needRaw) ? Math.max(needRaw, 0) : 0;

    if (!account) return alert('No NGO account found. Please sign up and log in as NGO.');
    if (types.length === 0) return alert('Please select at least one type.');
    if (!desc) return alert('Please add a short description.');

    const all = JSON.parse(localStorage.getItem('ct_ngo_listings') || '[]');
    const item = {
      id: randomId(),
      ownerRole: 'NGO',
      orgName: account.orgName || orgName || 'NGO',
      orgEmail: account.email || null,
      types: [...types],
      haveVolunteers: have,
      needVolunteers: need,
      description: desc,
      createdAt: Date.now(),
    };
    const next = [item, ...all];
    localStorage.setItem('ct_ngo_listings', JSON.stringify(next));
    setListings(next.filter(l => l.ownerRole === 'NGO'));
    // Reset inputs back to blank
    setTypes(['Child Welfare']);
    setHaveVolunteers('');
    setNeedVolunteers('');
    setDescription('');
  };

  const remove = (id) => {
    const all = JSON.parse(localStorage.getItem('ct_ngo_listings') || '[]');
    const next = all.filter(l => l.id !== id);
    localStorage.setItem('ct_ngo_listings', JSON.stringify(next));
    setListings(next.filter(l => l.ownerRole === 'NGO'));
  };

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>NGO Dashboard</span>
        {/* Read-only org info from signup */}
        {account && (
          <span style={{ padding: '4px 10px', borderRadius: 999, background: '#ECFDF5', color: '#16A34A', fontSize: 12 }}>
            {account.orgName} {account.darpanId ? `• Darpan ${account.darpanId}` : ''} {account.email ? `• ${account.email}` : ''}
          </span>
        )}
        <a href="#/" style={{ marginLeft: 'auto', color: '#16A34A', textDecoration: 'none', fontSize: 14 }}>Back</a>
      </div>

      <div style={{ marginTop: 16, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ fontWeight: 700 }}>Publish your NGO listing</div>
        {/* Removed editable Organization Name input; it’s now fetched from signup */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALL_TYPES.map(t => (
            <button key={t} type="button" onClick={() => toggleType(t)} style={{
              padding: '6px 10px', borderRadius: 999, border: '1px solid #e5e7eb',
              background: types.includes(t) ? '#DCFCE7' : '#fff',
              color: types.includes(t) ? '#16A34A' : '#374151', cursor: 'pointer', fontSize: 12
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Volunteers you currently have
            </label>
            <input
              value={haveVolunteers}
              onChange={e => setHaveVolunteers(e.target.value)}
              type="number"
              min="0"
              placeholder="e.g., 12"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
              How many active volunteers are already with your NGO.
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Volunteers you need more
            </label>
            <input
              value={needVolunteers}
              onChange={e => setNeedVolunteers(e.target.value)}
              type="number"
              min="0"
              placeholder="e.g., 8"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
              How many additional volunteers you are requesting.
            </div>
          </div>
        </div>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Short description about your NGO..." style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={publish} style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#16A34A', color: '#fff', fontWeight: 600 }}>
            Publish Listing
          </button>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(260px, 1fr))', gap: 16 }}>
        {listings.map(l => (
          <ListingCard key={l.id} item={l} onDelete={() => remove(l.id)} />
        ))}
        {listings.length === 0 && (
          <div style={{ color: '#6b7280' }}>No listings published yet.</div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ item, onDelete }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
      <div style={{ fontWeight: 700 }}>{item.orgName}</div>
      <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {item.types.map(t => (
          <span key={t} style={{ padding: '2px 8px', borderRadius: 999, background: '#DCFCE7', color: '#16A34A', fontSize: 12 }}>
            {t}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 8, color: '#6b7280' }}>
        {item.description}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ padding: '2px 8px', borderRadius: 999, background: '#EEF2FF', color: '#374151', fontSize: 12 }}>
          Have: <strong style={{ marginLeft: 4 }}>{item.haveVolunteers}</strong>
        </span>
        <span style={{ padding: '2px 8px', borderRadius: 999, background: '#FEE2E2', color: '#B91C1C', fontSize: 12 }}>
          Need: <strong style={{ marginLeft: 4 }}>{item.needVolunteers}</strong>
        </span>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={onDelete} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>
          Delete
        </button>
      </div>
    </div>
  );
}

function randomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return 'id_' + Math.random().toString(36).slice(2);
  }
}
