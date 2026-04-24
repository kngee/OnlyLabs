
const Analytics = () => {
  // Example data based on project requirements [cite: 1]
  const stats = [
    { label: 'Weekly Progress', value: '12h / 40h', trend: '+11.01%', color: '#3B82F6' },
    { label: 'Total Lab Visits', value: '14', trend: '-0.03%', color: '#333' },
    { label: 'Current Streak', value: '5 Days', trend: '+15.03%', color: '#333' },
    { label: 'Active Researchers', value: '2,318', trend: '+6.08%', color: '#3B82F6' },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Overview</h1>
      </header>

      {/* Stats Grid inspired by image_c6f49e.png */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="neu-convex" 
            style={{ ...styles.statCard, backgroundColor: stat.color === '#333' ? '#1A1A1A' : stat.color }}
          >
            <div style={styles.statHeader}>
              <p style={{ color: stat.color === '#333' ? '#888' : 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                {stat.label}
              </p>
              <div style={styles.miniIcon}>↗</div>
            </div>
            <h2 style={{ color: '#FFF', fontSize: '24px', margin: '10px 0' }}>{stat.value}</h2>
            <p style={{ color: stat.trend.startsWith('+') ? '#4ADE80' : '#F87171', fontSize: '12px' }}>
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Session History Section  */}
      <section style={styles.historySection}>
        <h2 style={styles.subTitle}>Recent Sessions</h2>
        <div className="neu-convex" style={styles.historyList}>
          {[1, 2, 3].map((item) => (
            <div key={item} style={styles.historyItem}>
              <div>
                <p style={{ fontWeight: '600' }}>Engineering Lab 2-4</p>
                <p style={{ fontSize: '12px', color: '#888' }}>April 2{item}, 2026</p>
              </div>
              <p style={{ fontWeight: 'bold', color: '#FF6B6B' }}>3h 15m</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '450px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '40px',
  },
  statCard: {
    padding: '20px',
    height: '140px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'space-between',
    borderRadius: '24px',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniIcon: {
    width: '24px',
    height: '24px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#FFF',
    fontSize: '12px',
  },
  historySection: {
    marginTop: '20px',
  },
  subTitle: {
    fontSize: '18px',
    color: '#888',
    marginBottom: '15px',
    paddingLeft: '5px',
  },
  historyList: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '10px',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid rgba(0,0,0,0.03)',
  },
};

export default Analytics;