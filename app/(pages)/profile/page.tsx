'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DEFAULT_USER_ID = 'demo-user';
const ProfileMap = dynamic(() => import('./profile-map'), { ssr: false });

export default function ProfilePage() {
  const router = useRouter();
  const defaultCountry = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || 'Tunisia';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState('Guest');
  const [profilePic, setProfilePic] = useState('/avatar-placeholder.png');
  const [menuOpen, setMenuOpen] = useState(false);
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [accountType, setAccountType] = useState<'user' | 'provider'>('user');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState(defaultCountry);
  const [countries, setCountries] = useState<
    { id: string; name: string; value: string; delegations: { name: string; value: string; postalCode: string; latitude: number | null; longitude: number | null }[] }[]
  >([]);
  const [delegations, setDelegations] = useState<
    { name: string; value: string; postalCode: string; latitude: number | null; longitude: number | null }[]
  >([]);
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [viewLat, setViewLat] = useState<number | null>(null);
  const [viewLon, setViewLon] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [jobId, setJobId] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordSuggestion, setKeywordSuggestion] = useState('');
  const [suggestStatus, setSuggestStatus] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const [metaCategories, setMetaCategories] = useState<{ id: string; name: string }[]>([]);
  const [metaJobs, setMetaJobs] = useState<{ id: string; name: string; categoryId: string }[]>([]);
  const [metaKeywords, setMetaKeywords] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/meta')
      .then((res) => res.json())
      .then((data) => {
        setMetaCategories(data.categories ?? []);
        setMetaJobs(data.jobs ?? []);
        setMetaKeywords((data.keywords ?? []).map((k: any) => ({ id: k.id ?? k.name, name: k.name })));
      })
      .catch(() => {});

    fetch('/api/country')
      .then((res) => res.json())
      .then((data) => {
        setCountries(data.countries ?? []);
        if (!country) setCountry(defaultCountry);
      })
      .catch(() => {});

    const resolveUser = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('idToken') : null;
      if (!token) {
        setIsLoggedIn(false);
        router.replace('/login');
        return;
      }
      setIsLoggedIn(true);

      let userId = typeof window !== 'undefined' ? localStorage.getItem('profileUserId') : null;
      let fEmail = typeof window !== 'undefined' ? localStorage.getItem('pendingVerificationEmail') || '' : '';

      if (!userId) {
        try {
          const res = await fetch('/api/auth/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }),
          });
          const data = await res.json();
          if (res.ok && data?.user?.id) {
            userId = data.user.id;
            localStorage.setItem('profileUserId', userId);
            if (data.user.email) {
              fEmail = data.user.email;
              localStorage.setItem('pendingVerificationEmail', data.user.email);
            }
          }
        } catch {
          // ignore
        }
      }

      setFallbackEmail(fEmail);
      setEmail((prev) => prev || fEmail);
      setResolvedUserId(userId || DEFAULT_USER_ID);
    };

    resolveUser();
  }, [router]);

  useEffect(() => {
    if (!resolvedUserId) return;
    const fEmail = fallbackEmail || (typeof window !== 'undefined' ? localStorage.getItem('pendingVerificationEmail') || '' : '');
    fetch(`/api/profile?userId=${encodeURIComponent(resolvedUserId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.profile) {
          setAccountType(data.profile.accountType ?? 'user');
          setEmail(data.profile.email ?? fEmail);
          setFirstName(data.profile.firstName ?? '');
          setLastName(data.profile.lastName ?? '');
          setAge(typeof data.profile.age === 'number' ? data.profile.age : '');
          setAddress(data.profile.address ?? '');
          setCity(data.profile.city ?? '');
          setPostalCode(data.profile.postalCode ?? '');
          setProvince(data.profile.province ?? '');
          setCountry(data.profile.country ?? defaultCountry);
          setLatitude(typeof data.profile.latitude === 'number' ? data.profile.latitude : '');
          setLongitude(typeof data.profile.longitude === 'number' ? data.profile.longitude : '');
          setCategoryId(data.profile.categoryId ?? '');
          setJobId(data.profile.jobId ?? '');
          setKeywords(Array.isArray(data.profile.keywords) ? data.profile.keywords : []);
          setPhotoDataUrl(data.profile.photoDataUrl ?? null);

          const fullName = `${data.profile.firstName ?? ''} ${data.profile.lastName ?? ''}`.trim() || 'User';
          setProfileName(fullName);
          if (data.profile.photoDataUrl) setProfilePic(data.profile.photoDataUrl);
          else setProfilePic('/avatar-placeholder.png');
        } else {
          setEmail(fEmail);
          setCountry(defaultCountry);
        }
      })
      .finally(() => setInitializing(false));
  }, [resolvedUserId, fallbackEmail]);

  useEffect(() => {
    if (!province) {
      setDelegations([]);
      return;
    }
    const selected = (province || '').toLowerCase();
    const gov = countries.find((c) => (c.name || '').toLowerCase() === selected || (c.value || '').toLowerCase() === selected);
    setDelegations(gov?.delegations ?? []);
  }, [countries, province]);

  useEffect(() => {
    if (!city || !delegations.length) return;
    const selected = delegations.find(
      (d) => (d.name || '').toLowerCase() === (city || '').toLowerCase() || (d.value || '').toLowerCase() === (city || '').toLowerCase()
    );
    if (selected) {
      if (selected.latitude && selected.longitude) {
        setLatitude(selected.latitude);
        setLongitude(selected.longitude);
        setViewLat(selected.latitude);
        setViewLon(selected.longitude);
      }
      if (selected.postalCode) setPostalCode(selected.postalCode);
    }
  }, [city, delegations]);

  useEffect(() => {
    if (latitude !== '' && longitude !== '') {
      setViewLat(Number(latitude));
      setViewLon(Number(longitude));
    }
  }, [latitude, longitude]);

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
    const userId = resolvedUserId || DEFAULT_USER_ID;

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          accountType,
          email,
          firstName,
          lastName,
          age: age === '' ? undefined : age,
          address,
          city,
          postalCode,
          province,
          country,
          latitude: latitude === '' ? undefined : latitude,
          longitude: longitude === '' ? undefined : longitude,
          categoryId,
          jobId,
          keywords,
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

  const locationLabel = latitude !== '' && longitude !== '' ? `${latitude}, ${longitude}` : city || province || country;

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
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

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
            <span>Delegation</span>
            <select
              value={city}
              onChange={(e) => {
                const val = e.target.value;
                setCity(val);
                const selected = delegations.find((d) => d.name === val || d.value === val);
                if (selected) {
                  if (selected.latitude && selected.longitude) {
                    setLatitude(selected.latitude);
                    setLongitude(selected.longitude);
                    setViewLat(selected.latitude);
                    setViewLon(selected.longitude);
                  }
                }
              }}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              disabled={!province}
            >
              <option value="">Select a delegation</option>
              {delegations.map((d) => (
                <option key={`${d.value}-${d.postalCode}`} value={d.name || d.value}>
                  {d.name || d.value} {d.postalCode ? `(${d.postalCode})` : ''}
                </option>
              ))}
            </select>
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
            <span>Governorate</span>
            <select
              value={province}
              onChange={(e) => {
                const val = e.target.value;
                setProvince(val);
                setCity('');
                setLatitude('');
                setLongitude('');
                setViewLat(null);
                setViewLon(null);
              }}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            >
              <option value="">Select a governorate</option>
              {countries.map((c) => (
                <option key={c.id} value={c.name || c.value}>
                  {c.name || c.value}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Latitude</span>
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Longitude</span>
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600 }}>Set your location</span>
              <button
                type="button"
                onClick={() => {
                  setLatitude('');
                  setLongitude('');
                  setViewLat(null);
                  setViewLon(null);
                }}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
              <span style={{ color: '#475569' }}>Using: {locationLabel || 'Not set'}</span>
            </div>
            <ProfileMap
              latitude={latitude === '' ? undefined : Number(latitude)}
              longitude={longitude === '' ? undefined : Number(longitude)}
              viewLat={viewLat}
              viewLon={viewLon}
              onSelect={(lat, lon) => {
                setLatitude(lat);
                setLongitude(lon);
                setViewLat(lat);
                setViewLon(lon);
              }}
            />
          </div>

          {accountType === 'provider' && (
            <>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span>Category</span>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setJobId('');
                  }}
                  style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
                >
                  <option value="">Select a category</option>
                  {metaCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span>Job</span>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
                  disabled={!categoryId}
                >
                  <option value="">Select a job</option>
                  {metaJobs
                    .filter((j) => !categoryId || j.categoryId === categoryId)
                    .map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name}
                      </option>
                    ))}
                </select>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                <span>Keywords (approved)</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {metaKeywords.map((k) => {
                    const checked = keywords.includes(k.id);
                    return (
                      <label
                        key={k.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.55rem',
                          borderRadius: 10,
                          border: checked ? '1px solid #0f172a' : '1px solid #cbd5e1',
                          background: checked ? 'rgba(15,23,42,0.06)' : 'white',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) setKeywords([...keywords, k.id]);
                            else setKeywords(keywords.filter((kw) => kw !== k.id));
                          }}
                        />
                        {k.name}
                      </label>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={keywordSuggestion}
                    onChange={(e) => setKeywordSuggestion(e.target.value)}
                    placeholder="Suggest a new keyword"
                    style={{ flex: '1 1 200px', padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!keywordSuggestion.trim()) return;
                      setSuggestStatus(null);
                      try {
                        const res = await fetch('/api/meta/keywords', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: keywordSuggestion }),
                        });
                        const data = await res.json();
                        if (!res.ok) setSuggestStatus(data.error ?? 'Failed to submit keyword');
                        else setSuggestStatus('Keyword suggestion submitted for review');
                        setKeywordSuggestion('');
                      } catch {
                        setSuggestStatus('Failed to submit keyword');
                      }
                    }}
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
                    Suggest keyword
                  </button>
                </div>
                {suggestStatus && <span style={{ color: '#475569' }}>{suggestStatus}</span>}
              </div>
            </>
          )}

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
