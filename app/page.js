// app/page.js - Home page
export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          color: '#333',
        }}>
          💈 WhatsApp Salon Booking System
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '2rem',
        }}>
          Automated booking system powered by WhatsApp Business API
        </p>

        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '2rem',
          borderRadius: '8px',
          marginTop: '2rem',
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>System Status</h2>
          <p style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Online</p>
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Webhook: <code>/api/webhook</code>
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Health: <code>/api/health</code>
          </p>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
        }}>
          <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>Features</h3>
          <ul style={{
            textAlign: 'left',
            listStyle: 'none',
            padding: 0,
            color: '#666',
          }}>
            <li>✅ WhatsApp booking integration</li>
            <li>✅ Automated reminders</li>
            <li>✅ Admin panel</li>
            <li>✅ Google Sheets database</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
