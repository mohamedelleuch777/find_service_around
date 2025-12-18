'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

const DEFAULT_USER_ID = 'demo-user';

export default function ProfilePage() {
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

  if (initializing) return null;

  return (
    <main style={{ padding: '2rem 1.5rem', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 1rem' }}>Profile</h1>
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
            style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
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
            style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span>Last name</span>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span>Age</span>
          <input
            type="number"
            min={0}
            value={age}
            onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
            style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span>Address</span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span>City</span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span>Postal code</span>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span>Province</span>
          <input
            type="text"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span>Country</span>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
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
              padding: '0.85rem 1.25rem',
              borderRadius: 10,
              border: 'none',
              background: '#0f172a',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Saving...' : 'Save profile'}
          </button>
          {status && <span style={{ color: '#475569' }}>{status}</span>}
        </div>
      </form>
    </main>
  );
}
