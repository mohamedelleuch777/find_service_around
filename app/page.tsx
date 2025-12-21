/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from './components/site-header';
import { SkeletonLine, SkeletonBox } from './components/skeleton';
import './home.css';

type HomeContent = {
  sliderImages: string[];
  hero: {
    title: string;
    subtitle: string;
    body: string;
    leftTitle: string;
    leftBody: string;
  };
  search: { placeholder: string; buttonText: string };
  categories: { id?: string; title?: string; name?: string; image?: string }[];
  highlights: { label: string; value: string }[];
};

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const categoryIconMap: Record<string, string> = {
    plumbing: 'fa-faucet',
    electricity: 'fa-bolt',
    housekeeping: 'fa-broom',
    'windows-blinds': 'fa-window-maximize',
    'air-conditioning': 'fa-snowflake',
    handyman: 'fa-screwdriver-wrench',
    'washing-machine': 'fa-soap',
    painting: 'fa-paint-roller',
    babysitting: 'fa-baby',
    gardening: 'fa-seedling',
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/home');
        const data = (await res.json()) as HomeContent;
        setContent(data);
      } catch {
        // keep null
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!content?.sliderImages?.length) return;
    const id = setInterval(() => {
      setSlide((prev) => (prev + 1) % content.sliderImages.length);
    }, 3500);
    return () => clearInterval(id);
  }, [content?.sliderImages?.length]);

  return (
    <div className="home">
      <SiteHeader />

      <main className="home__main">
        <section className="home__hero">
          {loading ? (
            <div className="home__hero-content">
              <div>
                <SkeletonLine width="60%" height="2rem" style={{ marginBottom: '0.8rem' }} />
                <SkeletonLine width="100%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                <SkeletonLine width="90%" height="1rem" style={{ marginBottom: '2rem' }} />
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonBox key={i} width="28px" height="6px" borderRadius="999px" />
                  ))}
                </div>
              </div>
              <div className="home__hero-card">
                <SkeletonBox width="100%" height="380px" borderRadius="16px" />
              </div>
            </div>
          ) : (
            <>
              <div className="home__hero-bg">
                {content?.sliderImages?.map((src, idx) => (
                  <img
                    key={`${src}-${idx}`}
                    src={src}
                    alt="Home service highlight"
                    className={`home__hero-img${slide === idx ? ' is-active' : ''}`}
                  />
                ))}
                <div className="home__hero-overlay" />
              </div>

              <div className="home__hero-content">
                <div className="home__hero-left">
                  <div className="home__hero-subtitle">
                    {content?.hero.subtitle ?? 'Trusted on-demand home services'}
                  </div>
                  <h1 className="home__hero-title">{content?.hero.title}</h1>
                  <p className="home__hero-body">{content?.hero.body}</p>
                  <div className="stack-sm">
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{content?.hero.leftTitle}</div>
                    <div style={{ opacity: 0.85 }}>{content?.hero.leftBody}</div>
                  </div>
                </div>

                <div className="home__hero-card">
                  <div className="home__hero-subtitle" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white' }}>
                    {content?.hero.subtitle ?? 'Trusted on-demand home services'}
                  </div>
                  <h1 className="home__hero-title" style={{ color: 'var(--primary)' }}>
                    {content?.hero.title}
                  </h1>
                  <p className="home__hero-body" style={{ color: 'var(--text-secondary)' }}>
                    {content?.hero.body}
                  </p>
                  <div className="mb-3">
                    <Link href="/browse" className="home__cta">
                      {content?.search.buttonText ?? 'Find services'}
                    </Link>
                  </div>
                  <div className="home__highlights">
                    {content?.highlights?.map((item, idx) => (
                      <div key={`${item.label}-${idx}`} className="home__highlight">
                        <div className="home__highlight-value">{item.value}</div>
                        <div style={{ opacity: 0.9 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="home__section">
          <div className="home__section-head">
            <div>
              <h2 className="home__section-title">Popular categories</h2>
              <p className="home__section-subtitle">Everything you need, from repairs to daily help.</p>
            </div>
            <Link href="/browse" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              View all →
            </Link>
          </div>

          <div className="home__category-grid">
            {loading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonBox key={i} width="100%" height="96px" borderRadius="0.75rem" />
                ))}
              </>
            ) : (
              content?.categories?.map((cat, idx) => {
                const label = (cat as any).title || (cat as any).name || 'Category';
                const categoryId = (cat as any).id || label.toLowerCase().replace(/\s+/g, '-');
                const iconClass = categoryIconMap[categoryId] || 'fa-briefcase';
                return (
                  <div key={`${label}-${idx}`} className="home__category-card" title={label}>
                    <div className="home__category-icon">
                      <i className={`fa-solid ${iconClass}`} aria-hidden="true" />
                    </div>
                    <div className="home__category-label">{label}</div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="home__info-grid">
          <div className="home__info-card">
            <h3 className="home__info-title" style={{ color: 'var(--primary)' }}>
              <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
              How it works
            </h3>
            <ul style={{ paddingLeft: '1rem', margin: 0, color: 'var(--text-secondary)', display: 'grid', gap: '0.5rem' }}>
              <li>Tell us what you need and when.</li>
              <li>We match you with vetted local providers.</li>
              <li>Book instantly and track progress.</li>
              <li>Pay securely when the job is done.</li>
            </ul>
          </div>
          <div className="home__info-card">
            <h3 className="home__info-title" style={{ color: 'var(--secondary)' }}>
              <i className="fa-solid fa-shield-halved" aria-hidden="true" />
              Why customers trust us
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Verified professionals, transparent pricing, and support that responds fast. Every booking is covered by our service guarantee.
            </p>
          </div>
          <div className="home__info-card">
            <h3 className="home__info-title" style={{ color: 'var(--accent)' }}>
              <i className="fa-solid fa-chart-line" aria-hidden="true" />
              Become a provider
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Grow your business with steady requests and simple scheduling tools.
            </p>
            <Link href="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              Join as provider →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
