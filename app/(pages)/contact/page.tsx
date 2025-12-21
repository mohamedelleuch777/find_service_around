import SiteHeader from '../../components/site-header';
import '../static.css';

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="static-page">
        <div className="contact-card">
          <h1 className="static-title">Get in Touch</h1>
          <p className="static-text" style={{ marginBottom: '2rem' }}>
            Reach out for support, partnerships, or to become a listed provider.
          </p>
          <ul className="contact-list">
            <li className="contact-item">
              <i className="fa-solid fa-envelope" aria-hidden="true" />
              <strong>Email:</strong> <a href="mailto:support@servicehub.local" style={{ color: 'var(--primary)' }}>support@servicehub.local</a>
            </li>
            <li className="contact-item">
              <i className="fa-solid fa-phone" aria-hidden="true" />
              <strong>Phone:</strong> +1 (800) 555-0199
            </li>
            <li className="contact-item">
              <i className="fa-solid fa-globe" aria-hidden="true" />
              <strong>Website:</strong> www.servicehub.local
            </li>
          </ul>
        </div>
      </main>
    </>
  );
}
