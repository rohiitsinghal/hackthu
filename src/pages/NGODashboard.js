import { useEffect, useMemo, useState } from 'react';
import Logo from '../components/Logo';
import logo from '../components/logo.jpeg';

// Enhanced header with mode toggle and logo for NGO
function NGOHeader({ user, mode, onModeChange, onLogout }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Logo */}
      <Logo size={32} src={logo} /> {/* pass the imported jpeg */}
      <span style={{ fontSize: 22, fontWeight: 700 }}>NGO Dashboard</span>
      
      {/* Mode Toggle for NGOs */}
      <div style={{ display: 'inline-flex', background: '#f3f4f6', borderRadius: 999, padding: 4 }}>
        <button
          onClick={() => onModeChange('impact')}
          style={{
            padding: '6px 12px', borderRadius: 999, border: 'none',
            background: mode === 'impact' ? '#16A34A' : 'transparent',
            color: mode === 'impact' ? '#fff' : '#374151',
            fontWeight: 600, cursor: 'pointer', fontSize: 12,
          }}
        >
          Impact Mode
        </button>
        <button
          onClick={() => onModeChange('grow')}
          style={{
            padding: '6px 12px', borderRadius: 999, border: 'none',
            background: mode === 'grow' ? '#7C3AED' : 'transparent',
            color: mode === 'grow' ? '#fff' : '#374151',
            fontWeight: 600, cursor: 'pointer', fontSize: 12,
          }}
        >
          Grow Mode
        </button>
      </div>

      {/* Read-only org info from signup */}
      {user && (
        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#ECFDF5', color: '#16A34A', fontSize: 12 }}>
          {user.orgName} {user.darpanId ? `• Darpan ${user.darpanId}` : ''} {user.email ? `• ${user.email}` : ''}
        </span>
      )}
      
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <NGOUserMenu user={user} onLogout={onLogout} />
      </div>
    </div>
  );
}

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

  // Load only my listings (filter by current NGO's email)
  useEffect(() => {
    if (account?.email) {
      const all = JSON.parse(localStorage.getItem('ct_ngo_listings') || '[]');
      setListings(all.filter(l => l.orgEmail === account.email));
    }
  }, [account]);

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
    const nextAll = [...all, item];
    localStorage.setItem('ct_ngo_listings', JSON.stringify(nextAll));
    // Show only current NGO's listings
    setListings(nextAll.filter(l => l.orgEmail === account.email));
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
    // Show only current NGO's listings
    setListings(next.filter(l => l.orgEmail === account.email));
  };

  // Add: logout handler
  const logout = () => {
    localStorage.removeItem('ct_auth');
    window.location.hash = '#/';
  };

  const [mode, setMode] = useState('impact'); // Add missing mode state

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <NGOHeader user={account} mode={mode} onModeChange={setMode} onLogout={logout} />

      {mode === 'impact' ? (
        <ImpactModeNGO 
          account={account}
          types={types}
          haveVolunteers={haveVolunteers}
          needVolunteers={needVolunteers}
          description={description}
          listings={listings}
          ALL_TYPES={ALL_TYPES}
          toggleType={toggleType}
          setHaveVolunteers={setHaveVolunteers}
          setNeedVolunteers={setNeedVolunteers}
          setDescription={setDescription}
          publish={publish}
          remove={remove}
        />
      ) : (
        <GrowModeShared user={account} userType="NGO" />
      )}
    </div>
  );
}

// Impact Mode for NGOs (existing functionality)
function ImpactModeNGO({ account, types, haveVolunteers, needVolunteers, description, listings, ALL_TYPES, toggleType, setHaveVolunteers, setNeedVolunteers, setDescription, publish, remove }) {
  return (
    <>
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
    </>
  );
}

// Shared Grow Mode for both NGOs and Volunteers
function GrowModeShared({ user, userType }) {
  const [activeTab, setActiveTab] = useState('communities');
  const [communities, setCommunities] = useState([]);

  // Load communities from localStorage (shared between NGOs and Volunteers)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('ct_communities') || '[]');
    if (stored.length === 0) {
      // Initialize with sample data if none exists
      const sampleCommunities = [
        {
          id: 1,
          name: 'Green Mumbai Initiative',
          mission: 'Building sustainable communities through local environmental action',
          members: 156,
          pulse: 'High',
          createdBy: { type: 'Volunteer', name: 'Priya Sharma' },
          nextMeetup: { date: '2024-01-15', time: '6:00 PM', venue: 'Community Center, Bandra' },
          activities: ['Tree Plantation', 'Waste Cleanup', 'Awareness Drives'],
          createdAt: Date.now() - 86400000, // 1 day ago
        },
        {
          id: 2,
          name: 'Tech for Good Delhi',
          mission: 'Leveraging technology to solve social problems in our city',
          members: 89,
          pulse: 'Medium',
          createdBy: { type: 'NGO', name: 'Digital India Foundation' },
          nextMeetup: { date: '2024-01-20', time: '7:00 PM', venue: 'Online & Select City Mall' },
          activities: ['Code for Cause', 'Digital Literacy', 'App Development'],
          createdAt: Date.now() - 172800000, // 2 days ago
        },
      ];
      localStorage.setItem('ct_communities', JSON.stringify(sampleCommunities));
      setCommunities(sampleCommunities);
    } else {
      setCommunities(stored);
    }
  }, []);

  return (
    <>
      <div style={{ marginTop: 16, display: 'grid', gap: 2 }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>Grow Mode: The Community Engine</span>
        <span style={{ color: '#6b7280' }}>Connect with like-minded locals and build movements</span>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setActiveTab('communities')}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
            background: activeTab === 'communities' ? '#7C3AED' : '#fff',
            color: activeTab === 'communities' ? '#fff' : '#374151',
            cursor: 'pointer', fontWeight: 600,
          }}
        >
          Community Profiles
        </button>
        <button
          onClick={() => setActiveTab('meetups')}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
            background: activeTab === 'meetups' ? '#7C3AED' : '#fff',
            color: activeTab === 'meetups' ? '#fff' : '#374151',
            cursor: 'pointer', fontWeight: 600,
          }}
        >
          Upcoming Meetups
        </button>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
            background: activeTab === 'create' ? '#7C3AED' : '#fff',
            color: activeTab === 'create' ? '#fff' : '#374151',
            cursor: 'pointer', fontWeight: 600,
          }}
        >
          Create Community
        </button>
      </div>

      {activeTab === 'communities' ? (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(320px, 1fr))', gap: 16 }}>
          {communities.map(community => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      ) : activeTab === 'meetups' ? (
        <MeetupsList communities={communities} />
      ) : (
        <CreateCommunity 
          user={user} 
          userType={userType} 
          communities={communities} 
          setCommunities={setCommunities}
          setActiveTab={setActiveTab}
        />
      )}
    </>
  );
}

// Create Community component
function CreateCommunity({ user, userType, communities, setCommunities, setActiveTab }) {
  const [name, setName] = useState('');
  const [mission, setMission] = useState('');
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState('');

  const activityOptions = [
    'Tree Plantation', 'Waste Cleanup', 'Awareness Drives', 'Code for Cause', 
    'Digital Literacy', 'App Development', 'Food Distribution', 'Education Support',
    'Healthcare Camps', 'Skill Development', 'Art & Culture', 'Sports & Fitness'
  ];

  const addActivity = () => {
    if (newActivity.trim() && !activities.includes(newActivity.trim())) {
      setActivities([...activities, newActivity.trim()]);
      setNewActivity('');
    }
  };

  const createCommunity = () => {
    if (!name.trim() || !mission.trim() || activities.length === 0) {
      alert('Please fill all fields and add at least one activity.');
      return;
    }

    const newCommunity = {
      id: Date.now(),
      name: name.trim(),
      mission: mission.trim(),
      members: 1,
      pulse: 'New',
      createdBy: { 
        type: userType, 
        name: userType === 'NGO' ? user?.orgName : user?.fullName || 'Anonymous'
      },
      activities,
      createdAt: Date.now(),
    };

    const updated = [...communities, newCommunity];
    setCommunities(updated);
    localStorage.setItem('ct_communities', JSON.stringify(updated));
    
    setName(''); setMission(''); setActivities([]); setNewActivity('');
    setActiveTab('communities');
  };

  return (
    <div style={{ marginTop: 16, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Create New Community</div>
      
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Community Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Clean Bangalore Initiative"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Mission Statement
          </label>
          <textarea
            value={mission}
            onChange={e => setMission(e.target.value)}
            rows={3}
            placeholder="Describe what your community aims to achieve..."
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Activities
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={newActivity}
              onChange={e => setNewActivity(e.target.value)}
              placeholder="Add an activity..."
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6 }}
              onKeyPress={e => e.key === 'Enter' && addActivity()}
            />
            <button
              onClick={addActivity}
              style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#7C3AED', color: '#fff', fontWeight: 600 }}
            >
              Add
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {activityOptions.map(activity => (
              <button
                key={activity}
                onClick={() => !activities.includes(activity) && setActivities([...activities, activity])}
                style={{
                  padding: '4px 8px', borderRadius: 999, border: '1px solid #e5e7eb',
                  background: activities.includes(activity) ? '#EDE9FE' : '#fff',
                  color: activities.includes(activity) ? '#7C3AED' : '#6b7280',
                  fontSize: 12, cursor: 'pointer'
                }}
                disabled={activities.includes(activity)}
              >
                {activity}
              </button>
            ))}
          </div>
          {activities.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {activities.map(activity => (
                <span key={activity} style={{ padding: '2px 8px', borderRadius: 999, background: '#EDE9FE', color: '#7C3AED', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {activity}
                  <button
                    onClick={() => setActivities(activities.filter(a => a !== activity))}
                    style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={() => setActiveTab('communities')}
            style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={createCommunity}
            style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#7C3AED', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            Create Community
          </button>
        </div>
      </div>
    </div>
  );
}

// Reuse community components from VolunteerDashboard
function CommunityCard({ community }) {
  const [rsvped, setRsvped] = useState(false);

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{community.name}</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            {community.members} members • Created by {community.createdBy?.name} ({community.createdBy?.type})
          </div>
        </div>
        <span style={{
          padding: '4px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
          background: community.pulse === 'High' ? '#DCFCE7' : community.pulse === 'Medium' ? '#FEF3C7' : '#F3F4F6',
          color: community.pulse === 'High' ? '#16A34A' : community.pulse === 'Medium' ? '#B45309' : '#6b7280'
        }}>
          {community.pulse} Activity
        </span>
      </div>

      <div style={{ color: '#374151', fontSize: 14, marginBottom: 12 }}>{community.mission}</div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {community.activities.map(activity => (
          <span key={activity} style={{ padding: '2px 8px', borderRadius: 999, background: '#EDE9FE', color: '#7C3AED', fontSize: 11 }}>
            {activity}
          </span>
        ))}
      </div>

      {community.nextMeetup && (
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Next Meetup</div>
          <div style={{ fontSize: 12, color: '#374151' }}>
            {community.nextMeetup.date} • {community.nextMeetup.time}<br />
            📍 {community.nextMeetup.venue}
          </div>
        </div>
      )}

      <button
        onClick={() => setRsvped(!rsvped)}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none',
          background: rsvped ? '#16A34A' : '#7C3AED', color: '#fff',
          fontWeight: 600, cursor: 'pointer'
        }}
      >
        {rsvped ? 'RSVP Confirmed ✓' : 'RSVP for Meetup'}
      </button>
    </div>
  );
}

function MeetupsList({ communities }) {
  return (
    <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
      {communities.filter(c => c.nextMeetup).map(community => (
        <div key={community.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{community.name} Meetup</div>
              <div style={{ color: '#6b7280', marginTop: 4 }}>{community.mission}</div>
              <div style={{ marginTop: 12, fontSize: 14 }}>
                📅 {community.nextMeetup.date} • 🕕 {community.nextMeetup.time}<br />
                📍 {community.nextMeetup.venue}
              </div>
            </div>
            <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#7C3AED', color: '#fff', fontWeight: 600 }}>
              RSVP
            </button>
          </div>
        </div>
      ))}
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

function NGOUserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const name = (user?.orgName || 'NGO').trim();
  const email = user?.email || '—';
  const initial = name ? name[0].toUpperCase() : 'N';

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest?.('.ngo-user-menu-root')) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const viewProfile = () => {
    window.location.hash = '#/profile/ngo';
  };

  return (
    <div className="ngo-user-menu-root" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        {/* Replace CT/initial badge with logo */}
        <Logo size={28} src={logo} />
        <span style={{ color: '#374151', fontWeight: 500 }}>{name}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 260, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.08)', padding: 12 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Quick Info</div>
            <div style={{ fontSize: 13, color: '#374151' }}>Organization: <span style={{ color: '#111827' }}>{name}</span></div>
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
