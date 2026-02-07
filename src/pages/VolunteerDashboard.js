import { useEffect, useMemo, useState } from 'react';
import Logo from '../components/Logo';
import logo from '../components/logo.jpeg';

// Enhanced header with mode toggle and logo
function Header({ user, mode, onModeChange, onLogout }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Logo */}
        <Logo size={32} src={logo} />
        <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>CommuniTree</div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Mode Toggle */}
        <div style={{ display: 'inline-flex', background: '#f3f4f6', borderRadius: 999, padding: 4 }}>
          <button
            onClick={() => onModeChange('impact')}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              background: mode === 'impact' ? '#16A34A' : 'transparent',
              color: mode === 'impact' ? '#fff' : '#374151',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Impact Mode
          </button>
          <button
            onClick={() => onModeChange('grow')}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              background: mode === 'grow' ? '#7C3AED' : 'transparent',
              color: mode === 'grow' ? '#fff' : '#374151',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Grow Mode
          </button>
        </div>
        
        {/* Dynamic Track pill */}
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 8, 
          padding: '8px 14px', 
          borderRadius: 999, 
          background: mode === 'impact' ? '#FEF3C7' : '#F3E8FF',
          color: mode === 'impact' ? '#16A34A' : '#7C3AED',
          border: mode === 'impact' ? '1px solid #FDE68A' : '1px solid #E9D5FF',
          fontWeight: 600 
        }}>
          <span style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: mode === 'impact' ? '#16A34A' : '#8B5CF6' 
          }} />
          {mode === 'impact' ? 'Impact Track' : 'Grow Track'}
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

  const [mode, setMode] = useState('impact'); // 'impact' or 'grow'
  const [participations, setParticipations] = useState([]);

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

  // Load volunteer participations
  useEffect(() => {
    if (currentUser?.email) {
      const all = JSON.parse(localStorage.getItem('ct_volunteer_participations') || '[]');
      const mine = all.filter(p => p.volunteerEmail === currentUser.email);
      setParticipations(mine);
    }
  }, [currentUser]);

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
    if (!currentUser?.email) return;
    
    // Check if already volunteered
    const alreadyVolunteered = participations.some(p => p.listingId === id);
    if (alreadyVolunteered) {
      alert('You have already volunteered for this opportunity.');
      return;
    }

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

    // Update listing counts
    all[idx] = { ...item, haveVolunteers: have + 1, needVolunteers: need - 1 };
    localStorage.setItem('ct_ngo_listings', JSON.stringify(all));
    setListings(all.filter(l => l.ownerRole === 'NGO'));

    // Record participation
    const allParticipations = JSON.parse(localStorage.getItem('ct_volunteer_participations') || '[]');
    const participation = {
      id: randomId(),
      volunteerEmail: currentUser.email,
      listingId: id,
      orgName: item.orgName,
      programTitle: item.programTitle || 'Volunteer Program',
      volunteeredAt: Date.now(),
    };
    allParticipations.push(participation);
    localStorage.setItem('ct_volunteer_participations', JSON.stringify(allParticipations));
    setParticipations(allParticipations.filter(p => p.volunteerEmail === currentUser.email));
  };

  const logout = () => {
    localStorage.removeItem('ct_auth');
    window.location.hash = '#/';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header user={currentUser} mode={mode} onModeChange={setMode} onLogout={logout} />
      <div style={{ padding: 24 }}>
        {mode === 'impact' ? (
          <ImpactMode 
            listings={listings}
            participations={participations}
            currentUser={currentUser}
            onVolunteer={handleVolunteer}
            TYPES={TYPES}
          />
        ) : (
          <GrowMode user={currentUser} />
        )}
      </div>
    </div>
  );
}

// Impact Mode: Enhanced NGO directory with donation discovery
function ImpactMode({ listings, participations, currentUser, onVolunteer, TYPES }) {
  const [q, setQ] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [onlyNeeding, setOnlyNeeding] = useState(false);
  const [sortKey, setSortKey] = useState('recent');
  const [viewMode, setViewMode] = useState('opportunities'); // 'opportunities' or 'donations'

  const toggleType = (t) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const clearFilters = () => {
    setQ(''); setSelectedTypes([]); setOnlyNeeding(false); setSortKey('recent');
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

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 2 }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>Impact Mode: The Giving Engine</span>
          <span style={{ color: '#6b7280' }}>Discover verified NGOs and make immediate impact</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={() => setViewMode('opportunities')}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: viewMode === 'opportunities' ? '#16A34A' : '#fff',
              color: viewMode === 'opportunities' ? '#fff' : '#374151',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Volunteer Opportunities
          </button>
          <button
            onClick={() => setViewMode('donations')}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: viewMode === 'donations' ? '#16A34A' : '#fff',
              color: viewMode === 'donations' ? '#fff' : '#374151',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Donation Discovery
          </button>
        </div>
      </div>

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

      {viewMode === 'opportunities' ? (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))', gap: 16 }}>
          {filtered.map(item => (
            <OpportunityCard 
              key={item.id} 
              item={item} 
              onVolunteer={() => onVolunteer(item.id)}
              hasVolunteered={participations.some(p => p.listingId === item.id)}
            />
          ))}
          {filtered.length === 0 && <div style={{ color: '#6b7280' }}>No opportunities found.</div>}
        </div>
      ) : (
        <DonationDiscovery ngos={filtered} />
      )}
    </>
  );
}

// Grow Mode: Community profiles and meetups (updated to use shared communities)
function GrowMode({ user }) {
  const [activeTab, setActiveTab] = useState('communities');
  const [communities, setCommunities] = useState([]);

  // Load communities from localStorage (shared between NGOs and Volunteers)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('ct_communities') || '[]');
    setCommunities(stored);
  }, []);

  return (
    <>
      <div style={{ display: 'grid', gap: 2, marginBottom: 16 }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>Grow Mode: The Community Engine</span>
        <span style={{ color: '#6b7280' }}>Connect with like-minded locals and build movements</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(320px, 1fr))', gap: 16 }}>
          {communities.map(community => (
            <CommunityCard key={community.id} community={community} />
          ))}
          {communities.length === 0 && <div style={{ color: '#6b7280' }}>No communities yet. Create the first one!</div>}
        </div>
      ) : activeTab === 'meetups' ? (
        <MeetupsList communities={communities} />
      ) : (
        <CreateCommunityVolunteer 
          user={user} 
          communities={communities} 
          setCommunities={setCommunities}
          setActiveTab={setActiveTab}
        />
      )}
    </>
  );
}

// Create Community for Volunteers (fix variable scope)
function CreateCommunityVolunteer({ user, communities, setCommunities, setActiveTab }) {
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
        type: 'Volunteer', 
        name: user?.fullName || 'Anonymous'
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

// Enhanced opportunity card with direct contact
function OpportunityCard({ item, onVolunteer, hasVolunteered }) {
  const need = Math.max(parseInt(item.needVolunteers, 10) || 0, 0);
  const have = Math.max(parseInt(item.haveVolunteers, 10) || 0, 0);
  const canVolunteer = need > 0 && !hasVolunteered;

  const contactNGO = () => {
    const message = `Hi! I'm interested in volunteering for "${item.description?.slice(0, 50)}..." Please share more details.`;
    window.open(`mailto:${item.orgEmail || 'contact@ngo.org'}?subject=Volunteer Interest&body=${encodeURIComponent(message)}`);
  };

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

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onVolunteer}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none',
            background: canVolunteer ? '#16A34A' : '#9CA3AF', color: '#fff',
            fontWeight: 600, cursor: canVolunteer ? 'pointer' : 'not-allowed'
          }}
          disabled={!canVolunteer}
        >
          {hasVolunteered ? 'Volunteered ✓' : need > 0 ? 'Volunteer' : 'Filled'}
        </button>
        <button
          onClick={contactNGO}
          style={{
            padding: '10px 12px', borderRadius: 8, border: '1px solid #16A34A',
            background: '#fff', color: '#16A34A', fontWeight: 600, cursor: 'pointer'
          }}
        >
          Contact
        </button>
      </div>
    </div>
  );
}

// Donation discovery component
function DonationDiscovery({ ngos }) {
  const donations = [
    { type: 'Clothes', icon: '👕', description: 'Winter wear, school uniforms, daily wear' },
    { type: 'Books', icon: '📚', description: 'Educational books, novels, children stories' },
    { type: 'Food', icon: '🍲', description: 'Non-perishable items, fresh meals for events' },
    { type: 'Toys', icon: '🧸', description: 'Educational toys, sports equipment, games' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {donations.map(donation => (
          <div key={donation.type} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{donation.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{donation.type}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{donation.description}</div>
          </div>
        ))}
      </div>
      
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>NGOs Accepting Donations</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {ngos.slice(0, 6).map(ngo => (
          <div key={ngo.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700 }}>{ngo.orgName}</div>
            <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
              {ngo.description?.slice(0, 100)}...
            </div>
            <button style={{ marginTop: 12, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: '#16A34A', color: '#fff', fontWeight: 600 }}>
              Contact for Donations
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const name = (user?.fullName || 'Volunteer').trim();
  const email = user?.email || '—';
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
        {/* Replace CT/initial badge with logo */}
        <Logo size={28} src={logo} />
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

function randomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return 'id_' + Math.random().toString(36).slice(2);
  }
}

// Community card component (updated to show creator info)
function CommunityCard({ community }) {
  const [rsvped, setRsvped] = useState(false);

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{community.name}</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            {community.members} members
            {community.createdBy && (
              <span> • Created by {community.createdBy.name} ({community.createdBy.type})</span>
            )}
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
        {community.activities && community.activities.map(activity => (
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

// Meetups list component
function MeetupsList({ communities }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
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
