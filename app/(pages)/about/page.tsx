import SiteHeader from '../../components/site-header';

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ padding: '3rem 1.5rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ margin: '0 0 1rem', fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>About ServiceHub</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1.1rem', lineHeight: 1.8 }}>
          ServiceHub connects people with vetted professionals across a wide range of categories.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8 }}>
          Our goal is to provide transparent pricing, reliable availability, and seamless booking.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div style={{ padding: '2rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ margin: '0 0 0.75rem', color: 'var(--primary)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-bullseye" aria-hidden="true" />
            Our Mission
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Empower communities by making quality services accessible to everyone, anytime.
          </p>
        </div>
        <div style={{ padding: '2rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ margin: '0 0 0.75rem', color: 'var(--secondary)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-star" aria-hidden="true" />
            Our Values
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Trust, transparency, and excellence in every interaction.
          </p>
        </div>
        <div style={{ padding: '2rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ margin: '0 0 0.75rem', color: 'var(--accent)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-rocket" aria-hidden="true" />
            Our Vision
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Build a global network of service providers and satisfied customers.
          </p>
        </div>
      </div>
    </main>
    </>
  );
}
