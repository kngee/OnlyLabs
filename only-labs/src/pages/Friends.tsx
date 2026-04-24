export default function Friends() {
  return (
    <main style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Community</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', color: '#888', marginBottom: '15px' }}>In the Lab Now</h2>
        <div className="neu-convex" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#ddd' }} />
          <div>
            <p style={{ fontWeight: 'bold' }}>Bethlehem</p>
            <p style={{ fontSize: '12px', color: '#FF6B6B' }}>Engineering Lab 2-4</p>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '18px', color: '#888', marginBottom: '15px' }}>Daily Updates</h2>
        <div className="neu-convex" style={{ height: '200px', width: '100%', padding: '10px' }}>
          {/* Post content goes here */}
        </div>
      </section>
    </main>
  );
}