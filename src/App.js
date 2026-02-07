import './App.css';
import { useState, useEffect } from 'react';
import Logo from './components/Logo';
import logo from './components/logo.jpeg'; // add this import
import LoginNGO from './pages/LoginNGO';
import LoginVolunteer from './pages/LoginVolunteer';
import SignupNGO from './pages/SignupNGO'; // NEW: NGO signup page
import SignupVolunteer from './pages/SignupVolunteer'; // NEW: Volunteer signup page
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard'; // NEW
import UserDetails from './pages/UserDetails'; // NEW: User profile page

function NGOIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="8" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="15" y="4" width="6" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 8L12 4L21 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 12H6.01M6 15H6.01M18 9H18.01M18 12H18.01M18 15H18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 21s-7-4.35-9.5-7.5C1.2 11.9 2 9 4.5 7.9c2.1-.9 4.1.1 5.1 1.7 1-1.6 3-2.6 5.1-1.7C17 9 17.8 11.9 15.5 13.5 12.9 15.7 12 21 12 21z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Absolute top-center logo for auth pages (overlays the CT badge position)
function AuthLogoOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 88,            // tweak if needed to align perfectly with the CT badge
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        pointerEvents: 'none',
      }}
    >
      <Logo size={72} src={logo} />
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Resolve latest user email for a given role (fallback if login pages don't pass the user)
  const resolveUserEmailForRole = (role) => {
    try {
      const key = role === 'NGO' ? 'ct_ngo_users' : 'ct_volunteer_users';
      const users = JSON.parse(localStorage.getItem(key) || '[]');
      const last = users[users.length - 1];
      return last?.email || null;
    } catch {
      return null;
    }
  };

  const handleLoginSuccess = (role, user) => {
    localStorage.setItem('ct_auth', JSON.stringify({ role, userEmail: user?.email || null }));
    window.location.hash = role === 'NGO' ? '#/ngo' : '#/volunteer';
  };

  const handleSignupSuccess = (role, user) => {
    localStorage.setItem('ct_auth', JSON.stringify({ role, userEmail: user?.email || null }));
    window.location.hash = role === 'NGO' ? '#/ngo' : '#/volunteer';
  };

  if (route === '#/login/ngo') {
    return (
      <>
        <AuthLogoOverlay />
        <LoginNGO onBack={() => (window.location.hash = '#/')} onLogin={(user) => handleLoginSuccess('NGO', user)} />
      </>
    );
  }
  if (route === '#/login/volunteer') {
    return (
      <>
        <AuthLogoOverlay />
        <LoginVolunteer onBack={() => (window.location.hash = '#/')} onLogin={(user) => handleLoginSuccess('Volunteer', user)} />
      </>
    );
  }
  if (route === '#/signup/ngo') {
    return (
      <>
        <AuthLogoOverlay />
        <SignupNGO onBack={() => (window.location.hash = '#/login/ngo')} onCreate={(user) => handleSignupSuccess('NGO', user)} />
      </>
    );
  }
  if (route === '#/signup/volunteer') {
    return (
      <>
        <AuthLogoOverlay />
        <SignupVolunteer onBack={() => (window.location.hash = '#/login/volunteer')} onCreate={(user) => handleSignupSuccess('Volunteer', user)} />
      </>
    );
  }
  if (route === '#/ngo') {
    return <NGODashboard />;
  }
  if (route === '#/volunteer') {
    return <VolunteerDashboard />;
  }
  if (route === '#/profile/ngo') {
    return <UserDetails role="NGO" />;
  }
  if (route === '#/profile/volunteer') {
    return <UserDetails role="Volunteer" />;
  }

  return (
    <div className="landing">
      <div className="brand" style={{ opacity: 0.85 }}>
        <Logo size={120} className="brand-badge" src={logo} /> {/* pass the imported jpeg */}
      </div>

      <h1 className="title">Join CommuniTree</h1>
      <p className="subtitle">How would you like to continue?</p>

      <div className="cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px', alignItems: 'stretch' }}>
        <a className="card primary" href="#/login/ngo" aria-label="I represent an NGO">
          <div className="card-icon">
            <span className="icon-circle">
              <NGOIcon />
            </span>
          </div>
          <div className="card-body">
            <div className="card-title">I represent an NGO</div>
            <ul className="card-points">
              <li>Post opportunities and find the right volunteers</li>
              <li>Organize activities and grow your impact</li>
            </ul>
          </div>
        </a>

        <a className="card" href="#/login/volunteer" aria-label="I want to volunteer">
          <div className="card-icon">
            <span className="icon-circle">
              <HeartIcon />
            </span>
          </div>
          <div className="card-body">
            <div className="card-title">I want to volunteer</div>
            <ul className="card-points">
              <li>Find meaningful opportunities near you</li>
              <li>Give your time, make a difference</li>
            </ul>
          </div>
        </a>
      </div>

      <p className="fineprint">
        By continuing, you agree to our <a href="#/terms">Terms of Service</a> and <a href="#/privacy">Privacy Policy</a>
      </p>
    </div>
  );
}

export default App;
