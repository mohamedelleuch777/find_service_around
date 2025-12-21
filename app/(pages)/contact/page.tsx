import SiteHeader from '../../components/site-header';

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ padding: '3rem 1.5rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ margin: '0 0 1rem', fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Get in Touch</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Reach out for support, partnerships, or to become a listed provider.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
          <li style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            📧 <strong>Email:</strong> <a href="mailto:support@servicehub.local" style={{ color: 'var(--primary)' }}>support@servicehub.local</a>
          </li>
          <li style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            📞 <strong>Phone:</strong> +1 (800) 555-0199
          </li>
          <li style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            🌐 <strong>Website:</strong> www.servicehub.local
          </li>
        </ul>
      </div>
    </main>
    </>
  );
}
