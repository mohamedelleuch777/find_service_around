'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SkeletonCircle } from './skeleton';
import './site-header.css';

type Props = {
  prefilledName?: string;
  prefilledPhoto?: string | null;
};

const PLACEHOLDER: string | null = null;

export default function SiteHeader({ prefilledName, prefilledPhoto }: Props) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState(prefilledName || 'Guest');
  const [profilePic, setProfilePic] = useState<string | null>(prefilledPhoto || PLACEHOLDER);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
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
    <header className={`site-header${navOpen ? ' is-open' : ''}`}>
      <div className="site-header__inner">
        <Link href="/" className="site-header__brand">
          ServiceHub
        </Link>
        <button
          type="button"
          className="site-header__toggle"
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((prev) => !prev)}
        >
          <i className={navOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} aria-hidden="true" />
        </button>
        <nav className={`site-header__nav${navOpen ? ' is-open' : ''}`}>
          <Link href="/browse" className="site-header__link">Browse</Link>
          <Link href="/jobs" className="site-header__link">My jobs</Link>
          <Link href="/about" className="site-header__link">
            About
          </Link>
          <Link href="/contact" className="site-header__link">
            Contact
          </Link>
          {loading ? (
            <div className="site-header__loading">
              <div className="site-header__loading-bar" />
              <SkeletonCircle size="32px" />
            </div>
          ) : !isLoggedIn ? (
            <Link
              href="/login"
              className="site-header__cta"
            >
              Log in
            </Link>
          ) : (
            <div className="site-header__profile">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="site-header__profile-btn"
              >
                <span>{profileName}</span>
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="site-header__avatar"
                  />
                ) : (
                  <span aria-hidden="true" className="site-header__avatar-icon">
                    <i className="fa-solid fa-user" />
                  </span>
                )}
              </button>
              {menuOpen && (
                <div className="site-header__menu">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push('/profile');
                    }}
                    className="site-header__menu-btn"
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fa-solid fa-user" aria-hidden="true" />
                      Profile
                    </span>
                  </button>
                  <div className="site-header__divider" />
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
                    className="site-header__menu-btn site-header__menu-btn--danger"
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
        {navOpen && (
          <button
            type="button"
            className="site-header__overlay"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
          />
        )}
      </div>
    </header>
  );
}
