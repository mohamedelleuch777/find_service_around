'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DEFAULT_USER_ID = 'demo-user';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState('Guest');
  const [profilePic, setProfilePic] = useState('/avatar-placeholder.png');
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountType, setAccountType] = useState<'user' | 'provider'>('user');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('idToken') : null;
    if (!token) {
      setIsLoggedIn(false);
      router.replace('/login');
      return;
    }
    setIsLoggedIn(true);

    const userId = localStorage.getItem('profileUserId') || DEFAULT_USER_ID;
    fetch(`/api/profile?userId=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.profile) {
          setAccountType(data.profile.accountType ?? 'user');
          setFirstName(data.profile.firstName ?? '');
          setLastName(data.profile.lastName ?? '');
          setAge(typeof data.profile.age === 'number' ? data.profile.age : '');
          setAddress(data.profile.address ?? '');
          setCity(data.profile.city ?? '');
          setPostalCode(data.profile.postalCode ?? '');
          setProvince(data.profile.province ?? '');
          setCountry(data.profile.country ?? '');
          setPhotoDataUrl(data.profile.photoDataUrl ?? null);

          const fullName = `${data.profile.firstName ?? ''} ${data.profile.lastName ?? ''}`.trim() || 'User';
          setProfileName(fullName);
          if (data.profile.photoDataUrl) setProfilePic(data.profile.photoDataUrl);
          else setProfilePic('/avatar-placeholder.png');
        }
      })
      .finally(() => setInitializing(false));
  }, []);

  const onImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    const userId = localStorage.getItem('profileUserId') || DEFAULT_USER_ID;

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          accountType,
          firstName,
          lastName,
          age: age === '' ? undefined : age,
          address,
          city,
          postalCode,
          province,
          country,
          photoDataUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? 'Failed to save profile');
      } else {
        setStatus('Profile saved');
      }
    } catch (error) {
      setStatus('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  if (initializing || !isLoggedIn) return null;

  return (
    <>
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

      <main
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 20% 20%, rgba(14,165,233,0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.12), transparent 30%), #f7f9fb',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem 1.5rem',
        }}
      >
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(8px)',
          borderRadius: 18,
          border: '1px solid #e2e8f0',
          boxShadow: '0 24px 50px rgba(15,23,42,0.1)',
          padding: '1.75rem',
        }}
      >
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem' }}>Profile</h1>
        <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
          Set your account type and complete your personal details. Upload a profile picture to personalize your account.
        </p>

        <form
          onSubmit={onSubmit}
          style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Account type</span>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value === 'provider' ? 'provider' : 'user')}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            >
              <option value="user">Normal user</option>
              <option value="provider">Service provider</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>First name</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Last name</span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Age</span>
            <input
              type="number"
              min={0}
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Address</span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>City</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Postal code</span>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Province</span>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Country</span>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span>Profile picture</span>
            <input type="file" accept="image/*" onChange={onImageChange} />
            {photoDataUrl && (
              <img
                src={photoDataUrl}
                alt="Profile preview"
                style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 12, border: '1px solid #cbd5e1' }}
              />
            )}
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.95rem 1.35rem',
                borderRadius: 12,
                border: 'none',
                background: '#0f172a',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 16px 40px rgba(15,23,42,0.18)',
              }}
            >
              {loading ? 'Saving...' : 'Save profile'}
            </button>
            {status && <span style={{ color: '#475569' }}>{status}</span>}
          </div>
        </form>
      </div>
    </main>
    </>
  );
}
