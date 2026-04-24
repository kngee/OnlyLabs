import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Clock, ListTodo, Plus, BarChart2, Settings } from 'lucide-react';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Friends from './pages/Friends';
import Auth from './pages/Auth';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

import './App.css';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check session safely
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (mounted) {
          if (error) console.error("Supabase getSession error:", error);
          setSession(data?.session || null);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error("Supabase client crash:", err);
          setLoading(false);
        }
      }
    };
    
    initSession();

    let subscription: any = null;
    try {
      const authSub = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) setSession(session);
      });
      subscription = authSub.data.subscription;
    } catch(err) {
      console.error("Supabase auth listener crash:", err);
      // Still set loading false if it fails completely
      setLoading(false);
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f9', color: '#1a1a1a', fontFamily: 'sans-serif' }}>
        <h2>Loading Setup...</h2>
      </div>
    );
  }

  // If Supabase is completely unconfigured or missing URL, it might not throw but simply return null
  if (!session) {
    return <Auth onAuthSuccess={() => window.location.reload()} />;
  }

  return (
    <Router>
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
            <Settings size={24} />
          </NavLink>
        </nav>

        {/* Main Page Content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/friends" element={<Friends />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}