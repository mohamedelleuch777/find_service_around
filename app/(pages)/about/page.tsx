import SiteHeader from '../../components/site-header';
import '../static.css';

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="static-page">
        <div className="static-hero">
          <h1 className="static-title">About ServiceHub</h1>
          <p className="static-text" style={{ marginBottom: '1rem' }}>
            ServiceHub connects people with vetted professionals across a wide range of categories.
          </p>
          <p className="static-text">
            Our goal is to provide transparent pricing, reliable availability, and seamless booking.
          </p>
        </div>

        <div className="static-card-grid">
          <div className="static-card">
            <h3 className="static-card-title" style={{ color: 'var(--primary)' }}>
              <i className="fa-solid fa-bullseye" aria-hidden="true" />
              Our Mission
            </h3>
            <p className="static-text" style={{ margin: 0 }}>
              Empower communities by making quality services accessible to everyone, anytime.
            </p>
          </div>
          <div className="static-card">
            <h3 className="static-card-title" style={{ color: 'var(--secondary)' }}>
              <i className="fa-solid fa-star" aria-hidden="true" />
              Our Values
            </h3>
            <p className="static-text" style={{ margin: 0 }}>
              Trust, transparency, and excellence in every interaction.
            </p>
          </div>
          <div className="static-card">
            <h3 className="static-card-title" style={{ color: 'var(--accent)' }}>
              <i className="fa-solid fa-rocket" aria-hidden="true" />
              Our Vision
            </h3>
            <p className="static-text" style={{ margin: 0 }}>
              Build a global network of service providers and satisfied customers.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
