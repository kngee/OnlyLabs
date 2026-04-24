import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Timer, BarChart2, Users } from 'lucide-react';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Friends from './pages/Friends';

export default function App() {
  return (
    <Router>
      <div style={{ width: '100vw', maxWidth: '450px', position: 'relative', minHeight: '100vh', paddingBottom: '80px' }}>
        
        {/* Main Page Content */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/friends" element={<Friends />} />
        </Routes>

        {/* Bottom Navigation Bar inspired by image_c6f424.png */}
        <nav style={navStyles.tabBar}>
          <NavLink to="/" style={({ isActive }) => navStyles.icon(isActive)}>
            <Timer size={24} />
          </NavLink>
          <NavLink to="/analytics" style={({ isActive }) => navStyles.icon(isActive)}>
            <BarChart2 size={24} />
          </NavLink>
          <NavLink to="/friends" style={({ isActive }) => navStyles.icon(isActive)}>
            <Users size={24} />
          </NavLink>
        </nav>
      </div>
    </Router>
  );
}

const navStyles = {
  tabBar: {
    position: 'fixed' as 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '400px',
    height: '65px',
    backgroundColor: '#F6F6F6',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: '30px',
    boxShadow: '10px 10px 20px rgba(0,0,0,0.05), -10px -10px 20px #fff',
  },
  icon: (isActive: boolean) => ({
    color: isActive ? '#FF6B6B' : '#888',
    transition: '0.3s'
  })
};