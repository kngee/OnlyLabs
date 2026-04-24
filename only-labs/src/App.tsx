import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Clock, ListTodo, Plus, BarChart2, Settings } from 'lucide-react';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Friends from './pages/Friends';
import Auth from './pages/Auth';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <Router>
      <div style={{ backgroundColor: '#f0f4f9', width: '100vw', maxWidth: '450px', position: 'relative', minHeight: '100vh', paddingBottom: '90px', margin: '0 auto', boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}>
        
        {/* Main Page Content */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/friends" element={<Friends />} />
        </Routes>

        {/* Bottom Navigation Bar */}
        <nav style={navStyles.tabBar}>
          <NavLink to="/" style={({ isActive }) => navStyles.icon(isActive)}>
            <Clock size={24} />
          </NavLink>
          <NavLink to="/tasks" style={({ isActive }) => navStyles.icon(isActive)}>
            <ListTodo size={24} />
          </NavLink>
          
          <div style={navStyles.fabWrapper}>
            <button style={navStyles.fab}>
              <Plus size={28} color="#fff" />
            </button>
          </div>

          <NavLink to="/analytics" style={({ isActive }) => navStyles.icon(isActive)}>
            <BarChart2 size={24} />
          </NavLink>
          <NavLink to="/settings" style={({ isActive }) => navStyles.icon(isActive)}>
            <Settings size={24} />
          </NavLink>
        </nav>
      </div>
    </Router>
  );
}

const navStyles = {
  tabBar: {
    position: 'fixed' as const,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '450px',
    height: '70px',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0 -2px 20px rgba(0,0,0,0.03)',
    zIndex: 50,
  },
  icon: (isActive: boolean) => ({
    color: isActive ? '#537DF5' : '#b0b0b8',
    transition: '0.3s',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none'
  }),
  fabWrapper: {
    position: 'relative' as const,
    top: '-15px',
  },
  fab: {
    width: '56px',
    height: '56px',
    backgroundColor: '#537DF5',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 8px 24px rgba(83, 125, 245, 0.4)',
    cursor: 'pointer'
  }
};