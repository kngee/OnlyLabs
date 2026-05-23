import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Clock, ListTodo, Plus, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Friends from './pages/Friends';
import SettingsPage from './pages/Settings';
import Auth from './pages/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';

import './App.css';

function AppContent() {
  const { loading, session, user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f9', color: '#1a1a1a', fontFamily: 'sans-serif' }}>
        <h2>Loading Setup...</h2>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={() => window.location.reload()} />;
  }

  return (
    <Router>
      <SessionProvider userId={user?.id || null}>
        <div className="app-container">

        {/* Navigation Bar */}
        <nav className="bottom-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Clock size={24} />
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ListTodo size={24} />
          </NavLink>

          <div className="fab-wrapper">
            <button className="fab-button">
              <Plus size={28} color="#fff" />
            </button>
          </div>

          <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BarChart2 size={24} />
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <SettingsIcon size={24} />
          </NavLink>
        </nav>

        {/* Main Page Content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>

      </div>
      </SessionProvider>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}