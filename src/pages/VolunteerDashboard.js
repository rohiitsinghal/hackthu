import { useEffect, useMemo, useState } from 'react';

export default function VolunteerDashboard() {
  const auth = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ct_auth') || 'null'); } catch { return null; }
  }, []);

  useEffect(() => {
    if (!auth || auth.role !== 'Volunteer') {
      window.location.hash = '#/login/volunteer';
    }
  }, [auth]);

  const TYPES = [
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

  const [q, setQ] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [onlyNeeding, setOnlyNeeding] = useState(false);
  const [listings, setListings] = useState([]);

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
  };

  const filtered = listings.filter(l => {
    const text = (l.orgName + ' ' + l.description + ' ' + (l.types || []).join(' ')).toLowerCase();
    const matchesText = q ? text.includes(q.toLowerCase()) : true;
    const matchesTypes = selectedTypes.length
      ? (l.types || []).some(t => selectedTypes.includes(t))
      : true;
    const matchesNeed = onlyNeeding ? (Number(l.needVolunteers) > 0) : true;
    return matchesText && matchesTypes && matchesNeed;
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
    const updated = { ...item, haveVolunteers: have + 1, needVolunteers: need - 1 };
    all[idx] = updated;
    localStorage.setItem('ct_ngo_listings', JSON.stringify(all));
    setListings(all.filter(l => l.ownerRole === 'NGO'));
  };

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>NGO Opportunities</span>
        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#ECFDF5', color: '#16A34A', fontSize: 12 }}>
          {filtered.length} listings
        </span>
        <a href="#/" style={{ marginLeft: 'auto', color: '#16A34A', textDecoration: 'none', fontSize: 14 }}>Back</a>
      </div>

      <div style={{ marginTop: 16, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search NGOs, descriptions, or types…"
            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
            <input type="checkbox" checked={onlyNeeding} onChange={e => setOnlyNeeding(e.target.checked)} />
            Show needing volunteers
          </label>
          <button onClick={clearFilters} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>
            Clear filters
          </button>
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
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))', gap: 16 }}>
        {filtered.map(item => (
          <Card key={item.id} item={item} onVolunteer={() => handleVolunteer(item.id)} />
        ))}
        {filtered.length === 0 && <div style={{ color: '#6b7280' }}>No opportunities found.</div>}
      </div>
    </div>
  );
}

function Card({ item, onVolunteer }) {
  const need = Math.max(parseInt(item.needVolunteers, 10) || 0, 0);
  const have = Math.max(parseInt(item.haveVolunteers, 10) || 0, 0);

  return (
    <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16 }}>
      <div style={{ fontWeight: 700 }}>{item.orgName}</div>
      <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(item.types || []).map(t => (
          <span key={t} style={{ padding: '2px 8px', borderRadius: 999, background: '#DCFCE7', color: '#16A34A', fontSize: 12 }}>
            {t}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 8, color: '#6b7280' }}>
        {(item.description || '').length > 120 ? item.description.slice(0, 120) + '…' : item.description}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
          marginTop: 10,
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
