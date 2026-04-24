export default function Home() {
  return (
    <main style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '40px' }}>Focus</h1>
      
      {/* Central Timer Circle */}
      <div className="neu-convex" style={homeStyles.timerCircle}>
        <div className="neu-concave" style={homeStyles.innerCircle}>
          <span style={{ fontSize: '48px', fontWeight: 'bold' }}>00:02:43</span>
        </div>
      </div>

      <button className="neu-convex" style={homeStyles.startButton}>
        START SESSION
      </button>
    </main>
  );
}

const homeStyles = {
  timerCircle: {
    width: '280px',
    height: '280px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
  },
  innerCircle: {
    width: '230px',
    height: '230px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
  },
  startButton: {
    width: '100%',
    padding: '20px',
    marginTop: '60px',
    border: 'none',
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer'
  }
};