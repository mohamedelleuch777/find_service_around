/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState('Guest');
  const [profilePic, setProfilePic] = useState('/avatar-placeholder.svg');
  const [menuOpen, setMenuOpen] = useState(false);
  const [content, setContent] = useState<HomeContent | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/home');
        const data = (await res.json()) as HomeContent;
        setContent(data);
      } catch {
        // keep null
      }
    };
    load();
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('idToken') : null;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('profileUserId') || 'demo-user' : 'demo-user';
    if (!token) {
      setIsLoggedIn(false);
      setMenuOpen(false);
      return;
    }
    setIsLoggedIn(true);

    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (data?.profile) {
          const first = data.profile.firstName || '';
          const last = data.profile.lastName || '';
          const full = `${first} ${last}`.trim() || 'User';
          setProfileName(full);
          if (data.profile.photoDataUrl) setProfilePic(data.profile.photoDataUrl);
          else setProfilePic('/avatar-placeholder.svg');
        }
      } catch {
        // ignore and keep defaults
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!content?.sliderImages?.length) return;
    const id = setInterval(() => {
      setSlide((prev) => (prev + 1) % content.sliderImages.length);
    }, 3500);
    return () => clearInterval(id);
  }, [content?.sliderImages?.length]);

  return (
    <div style={{ background: 'radial-gradient(circle at 20% 20%, rgba(14,165,233,0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.12), transparent 30%), #f7f9fb' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backdropFilter: 'blur(12px)',
          background: 'rgba(247,249,251,0.9)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: 0.2 }}>
            Find Service Around
          </Link>
          <nav style={{ display: 'flex', gap: '1rem', marginLeft: 'auto', alignItems: 'center' }}>
            <Link href="/home" style={{ color: '#0f172a' }}>
              Browse
            </Link>
            <Link href="/about" style={{ color: '#0f172a' }}>
              About
            </Link>
            <Link href="/contact" style={{ color: '#0f172a' }}>
              Contact
            </Link>
            {!isLoggedIn && (
              <Link
                href="/login"
                style={{
                  padding: '0.55rem 0.9rem',
                  borderRadius: 10,
                  border: '1px solid #0f172a',
                  fontWeight: 600,
                }}
              >
                Log in
              </Link>
            )}
            {isLoggedIn && (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{profileName}</span>
                  <img
                    src={profilePic}
                    alt="Profile"
                    width={36}
                    height={36}
                    style={{ borderRadius: '50%', border: '1px solid #e2e8f0', objectFit: 'cover' }}
                  />
                </button>
                {menuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      marginTop: 8,
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      boxShadow: '0 14px 40px rgba(15,23,42,0.12)',
                      minWidth: 160,
                      overflow: 'hidden',
                      zIndex: 30,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push('/profile');
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.85rem 1rem',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#0f172a',
                      }}
                    >
                      Profile
                    </button>
                    <div style={{ height: 1, background: '#e2e8f0' }} />
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('idToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('pendingVerificationEmail');
                        setIsLoggedIn(false);
                        setMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.85rem 1rem',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#0f172a',
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
        <section
          style={{
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            marginBottom: '3rem',
            boxShadow: '0 25px 60px rgba(15,23,42,0.16)',
            background: '#0f172a',
            minHeight: 420,
          }}
        >
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
                background: 'linear-gradient(120deg, rgba(0,0,0,0.55), rgba(0,0,0,0.25))',
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
                background: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(5px)',
                borderRadius: 20,
                padding: '1.5rem',
                maxWidth: 520,
                width: '100%',
                boxShadow: '0 18px 44px rgba(15,23,42,0.20)',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem', borderRadius: 9999, background: 'rgba(15,23,42,0.06)', fontSize: '0.9rem', fontWeight: 600 }}>
                {content?.hero.subtitle ?? 'Trusted on-demand home services'}
              </div>
              <h1 style={{ margin: '1rem 0 0.75rem', fontSize: '2.7rem', lineHeight: 1.05, letterSpacing: -0.5 }}>
                {content?.hero.title}
              </h1>
              <p style={{ color: '#475569', marginBottom: '1.25rem', fontSize: '1.02rem' }}>
                {content?.hero.body}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                  placeholder={content?.search.placeholder ?? 'What do you need help with?'}
                  style={{
                    flex: '1 1 240px',
                    padding: '0.9rem 1rem',
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    minWidth: 0,
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
                    background: 'white',
                  }}
                />
                <button
                  type="button"
                  style={{
                    padding: '0.9rem 1.2rem',
                    borderRadius: 12,
                    border: 'none',
                    background: '#0f172a',
                    color: 'white',
                    fontWeight: 700,
                    boxShadow: '0 15px 30px rgba(15, 23, 42, 0.22)',
                    cursor: 'pointer',
                  }}
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
                      background: '#fff',
                      borderRadius: 14,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 14px 40px rgba(15, 23, 42, 0.08)',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{item.value}</div>
                    <div style={{ color: '#475569' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.7rem' }}>Popular categories</h2>
              <p style={{ margin: 0, color: '#475569' }}>Everything you need, from repairs to daily help.</p>
            </div>
            <Link href="/categories" style={{ color: '#0f172a', fontWeight: 700 }}>
              View all →
            </Link>
          </div>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            {content?.categories?.map((cat, idx) => {
              const label = (cat as any).title || (cat as any).name || 'Category';
              return (
              <div
                key={`${label}-${idx}`}
                style={{
                  padding: '1rem',
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <div style={{ width: 54, height: 54, borderRadius: 12, background: '#f5f5f5', display: 'grid', placeItems: 'center' }}>
                  <img src={(cat as any).image} alt={label} width={34} height={34} />
                </div>
                <div style={{ fontWeight: 700 }}>{label}</div>
              </div>
              );
            })}
          </div>
        </section>

        <section style={{ marginBottom: '3rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div style={{ padding: '1.25rem', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 14px 40px rgba(15, 23, 42, 0.08)' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>How it works</h3>
            <ul style={{ paddingLeft: '1rem', margin: 0, color: '#475569', display: 'grid', gap: '0.4rem' }}>
              <li>Tell us what you need and when.</li>
              <li>We match you with vetted local providers.</li>
              <li>Book instantly and track progress.</li>
              <li>Pay securely when the job is done.</li>
            </ul>
          </div>
          <div style={{ padding: '1.25rem', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 14px 40px rgba(15, 23, 42, 0.08)' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>Why customers trust us</h3>
            <p style={{ margin: 0, color: '#475569' }}>
              Verified professionals, transparent pricing, and support that responds fast. Every booking is covered by our service
              guarantee.
            </p>
          </div>
          <div style={{ padding: '1.25rem', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 14px 40px rgba(15, 23, 42, 0.08)' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>Become a provider</h3>
            <p style={{ margin: 0, color: '#475569', marginBottom: '0.75rem' }}>
              Grow your business with steady requests and simple scheduling tools.
            </p>
            <Link href="/register" style={{ fontWeight: 700, color: '#0f172a' }}>
              Join as provider →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
