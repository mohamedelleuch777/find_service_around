'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    if (prefilledName) setProfileName(prefilledName);
    if (prefilledPhoto) setProfilePic(prefilledPhoto);
  }, [prefilledName, prefilledPhoto]);

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
          setProfileName(prefilledName || full);
          if (data.profile.photoDataUrl) setProfilePic(prefilledPhoto || data.profile.photoDataUrl);
          else setProfilePic(prefilledPhoto || PLACEHOLDER);
        }
      } catch {
        // ignore and keep defaults
      }
    };
    loadProfile();
  }, [prefilledName, prefilledPhoto]);

  return (
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
                      router.replace('/login');
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
  );
}
