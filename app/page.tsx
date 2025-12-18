import Link from 'next/link';

const sections = [
  { title: 'Home', href: '/home', description: 'Find services tailored to your needs.' },
  { title: 'About', href: '/about', description: 'Learn how we connect you with trusted providers.' },
  { title: 'Contact', href: '/contact', description: 'Get support or become a provider.' },
];

export default function Home() {
  return (
    <main style={{ padding: '3rem 1.5rem', maxWidth: 960, margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.95rem', letterSpacing: 0.5 }}>Service Finder</p>
        <h1 style={{ margin: '0.25rem 0 0.75rem', fontSize: '2.5rem', lineHeight: 1.1 }}>
          Discover trusted services around you
        </h1>
        <p style={{ maxWidth: 640, color: '#475569' }}>
          Browse professionals, compare offers, and book with confidence.
        </p>
      </header>
      <section style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {sections.map((item) => (
          <Link key={item.href} href={item.href} style={{ padding: '1rem', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>{item.title}</h3>
            <p style={{ margin: 0, color: '#475569' }}>{item.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
