'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SkeletonCircle } from './skeleton';

type Props = {
  prefilledName?: string;
  prefilledPhoto?: string | null;
};

const PLACEHOLDER = '/avatar-placeholder.svg';

export default function SiteHeader({ prefilledName, prefilledPhoto }: Props) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState(prefilledName || 'Guest');
  const [profilePic, setProfilePic] = useState(prefilledPhoto || PLACEHOLDER);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (prefilledName) setProfileName(prefilledName);
    if (prefilledPhoto) setProfilePic(prefilledPhoto);
    if (prefilledName || prefilledPhoto) setLoading(false);
  }, [prefilledName, prefilledPhoto]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('idToken') : null;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('profileUserId') || 'demo-user' : 'demo-user';
    if (!token) {
      setIsLoggedIn(false);
      setMenuOpen(false);
      setLoading(false);
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
          setProfileName(prefilledName || full);
          if (data.profile.photoDataUrl) setProfilePic(prefilledPhoto || data.profile.photoDataUrl);
          else setProfilePic(prefilledPhoto || PLACEHOLDER);
        }
      } catch {
        // ignore and keep defaults
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [prefilledName, prefilledPhoto]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        background: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.35rem', letterSpacing: -0.5, background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          ServiceHub
        </Link>
        <nav style={{ display: 'flex', gap: '2rem', marginLeft: 'auto', alignItems: 'center', fontSize: '0.95rem', fontWeight: 500 }}>
          <Link href="/browse" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', opacity: 0.8 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}>Browse</Link>
          <Link href="/jobs" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', opacity: 0.8 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}>My jobs</Link>
          <Link href="/about" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', opacity: 0.8 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}>
            About
          </Link>
          <Link href="/contact" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', opacity: 0.8 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}>
            Contact
          </Link>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 100, height: '1.5rem', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite', borderRadius: '0.375rem' }} />
              <SkeletonCircle size="32px" />
            </div>
          ) : !isLoggedIn ? (
            <Link
              href="/login"
              style={{
                padding: '0.65rem 1.2rem',
                borderRadius: '0.75rem',
                border: '2px solid var(--primary)',
                fontWeight: 600,
                color: 'var(--primary)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--primary)';
              }}
            >
              Log in
            </Link>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                <span>{profileName}</span>
                <img
                  src={profilePic}
                  alt="Profile"
                  width={32}
                  height={32}
                  style={{ borderRadius: '50%', border: '2px solid white', objectFit: 'cover' }}
                />
              </button>
              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: 12,
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    boxShadow: 'var(--shadow-xl)',
                    minWidth: 180,
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
                      padding: '1rem 1.25rem',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    👤 Profile
                  </button>
                  <div style={{ height: 1, background: 'var(--border)' }} />
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('idToken');
                      localStorage.removeItem('refreshToken');
                      localStorage.removeItem('pendingVerificationEmail');
                      setIsLoggedIn(false);
                      setMenuOpen(false);
                      router.replace('/login');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '1rem 1.25rem',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--danger)',
                      fontWeight: 500,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
