/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from './components/site-header';
import { SkeletonLine, SkeletonBox, SkeletonCircle } from './components/skeleton';

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
  categories: { title: string; image: string }[];
  highlights: { label: string; value: string }[];
};

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', minHeight: '100vh' }}>
      <SiteHeader />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
        <section
          style={{
            position: 'relative',
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: '3rem',
            boxShadow: 'var(--shadow-2xl)',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            minHeight: 420,
          }}
        >
          {loading ? (
            <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <SkeletonLine width="60%" height="2rem" style={{ marginBottom: '0.8rem' }} />
                <SkeletonLine width="100%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                <SkeletonLine width="90%" height="1rem" style={{ marginBottom: '2rem' }} />
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonBox key={i} width="28px" height="6px" borderRadius="999px" />
                  ))}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', width: '100%', maxWidth: 520 }}>
                <SkeletonBox width="100%" height="380px" borderRadius="16px" />
              </div>
            </div>
          ) : (
            <>
              {/* Slider background */}
              <div style={{ position: 'absolute', inset: 0 }}>
                {content?.sliderImages?.map((src, idx) => (
                  <img
                    key={`${src}-${idx}`}
                    src={src}
                    alt="Home service highlight"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: slide === idx ? 1 : 0,
                      transition: 'opacity 700ms ease',
                    }}
                  />
                ))}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(120deg, rgba(0,0,0,0.35), rgba(0,0,0,0.15))',
                  }}
                />
              </div>

              {/* Foreground content */}
              <div
                style={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem',
                  padding: '2rem',
                  alignItems: 'center',
                }}
              >
                <div style={{ color: 'white', position: 'relative', height: '100%', paddingBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '2rem', marginBottom: '0.8rem', letterSpacing: -0.5 }}>
                    {content?.hero.leftTitle}
                  </div>
                  <p style={{ maxWidth: 520, margin: 0, opacity: 0.95, lineHeight: 1.6, fontSize: '1.05rem' }}>
                    {content?.hero.leftBody}
                  </p>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, display: 'flex', gap: '0.35rem' }}>
                    {content?.sliderImages?.map((_, idx) => (
                      <span
                        key={`dot-${idx}`}
                        style={{
                          width: 28,
                          height: 6,
                          borderRadius: 999,
                          background: slide === idx ? 'white' : 'rgba(255,255,255,0.35)',
                          transition: 'background 200ms',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    marginLeft: 'auto',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 16,
                    padding: '2rem',
                    maxWidth: 520,
                    width: '100%',
                    boxShadow: 'var(--shadow-2xl)',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem', borderRadius: 9999, background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                    {content?.hero.subtitle ?? 'Trusted on-demand home services'}
                  </div>
                  <h1 style={{ margin: '1rem 0 0.75rem', fontSize: '2.7rem', lineHeight: 1.05, letterSpacing: -0.5, color: 'var(--primary)' }}>
                    {content?.hero.title}
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '1.02rem' }}>
                    {content?.hero.body}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <input
                      placeholder={content?.search.placeholder ?? 'What do you need help with?'}
                      style={{
                        flex: '1 1 240px',
                        padding: '0.95rem 1.2rem',
                        borderRadius: '0.75rem',
                        border: '1px solid var(--border)',
                        minWidth: 0,
                        boxShadow: 'var(--shadow-md)',
                        background: 'white',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      type="button"
                      style={{
                        padding: '0.95rem 1.5rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        color: 'white',
                        fontWeight: 700,
                        boxShadow: 'var(--shadow-md)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      {content?.search.buttonText ?? 'Find services'}
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                    {content?.highlights?.map((item, idx) => (
                      <div
                        key={`${item.label}-${idx}`}
                        style={{
                          padding: '0.85rem 1rem',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          borderRadius: '0.75rem',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-md)',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{item.value}</div>
                        <div style={{ opacity: 0.9 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary)' }}>Popular categories</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Everything you need, from repairs to daily help.</p>
            </div>
            <Link href="/categories" style={{ color: 'var(--primary)', fontWeight: 700, transition: 'opacity 0.2s', opacity: 0.8 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}>
              View all →
            </Link>
          </div>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            {loading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonBox key={i} width="100%" height="100px" borderRadius="0.75rem" />
                ))}
              </>
            ) : (
              content?.categories?.map((cat, idx) => {
                const label = (cat as any).title || (cat as any).name || 'Category';
                return (
                <div
                  key={`${label}-${idx}`}
                  style={{
                    padding: '1.25rem',
                    background: 'white',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: '0.75rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'grid', placeItems: 'center' }}>
                    <img src={(cat as any).image} alt={label} width={36} height={36} />
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{label}</div>
                </div>
                );
              })
            )}
          </div>
        </section>

        <section style={{ marginBottom: '3rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>✨ How it works</h3>
            <ul style={{ paddingLeft: '1rem', margin: 0, color: 'var(--text-secondary)', display: 'grid', gap: '0.5rem' }}>
              <li>Tell us what you need and when.</li>
              <li>We match you with vetted local providers.</li>
              <li>Book instantly and track progress.</li>
              <li>Pay securely when the job is done.</li>
            </ul>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--secondary)' }}>🛡️ Why customers trust us</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Verified professionals, transparent pricing, and support that responds fast. Every booking is covered by our service guarantee.
            </p>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent)' }}>📈 Become a provider</h3>
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
