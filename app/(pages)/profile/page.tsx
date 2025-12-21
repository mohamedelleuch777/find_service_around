'use client';

import { ChangeEvent, FormEvent, useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '../../components/site-header';
import { SkeletonLine, SkeletonBox, SkeletonCircle, FormFieldSkeleton } from '../../components/skeleton';

const DEFAULT_USER_ID = 'demo-user';
const ProfileMap = dynamic(() => import('./profile-map'), { ssr: false });

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCountry = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || 'Tunisia';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState('Guest');
  const [profilePic, setProfilePic] = useState('/avatar-placeholder.svg');
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
  const [phone, setPhone] = useState('');
  const [countries, setCountries] = useState<
    { id: string; name: string; value: string; delegations: { name: string; value: string; postalCode: string; latitude: number | null; longitude: number | null }[] }[]
  >([]);
  const [govMap, setGovMap] = useState<
    Record<
      string,
      { name: string; value: string; delegations: { name: string; value: string; postalCode: string; latitude: number | null; longitude: number | null }[] }
    >
  >({});
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
  const [folders, setFolders] = useState<{ id: string; name: string; images: { id: string; url: string; caption?: string }[] }[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [ratingAvg, setRatingAvg] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [score, setScore] = useState<number | null>(null);
  const [providerWorkStatus, setProviderWorkStatus] = useState('available');
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'provider' | 'gallery'>('basic');
  const targetUserId = searchParams?.get('userId') || resolvedUserId;
  const headerName = targetUserId ? undefined : profileName;
  const headerPhoto = targetUserId ? undefined : profilePic;

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('idToken') : null;
    const paramUserId =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('userId') || searchParams?.get('userId') : searchParams?.get('userId');

    if (paramUserId) {
      setResolvedUserId(paramUserId);
      setIsLoggedIn(!!token);
      setInitializing(false);
      return;
    }

    const userId = typeof window !== 'undefined' ? localStorage.getItem('profileUserId') || 'demo-user' : 'demo-user';
    const pendingEmail = typeof window !== 'undefined' ? localStorage.getItem('pendingVerificationEmail') || '' : '';
    if (!token) {
      setIsLoggedIn(false);
      router.replace('/login');
      return;
    }
    setIsLoggedIn(true);
    setResolvedUserId(userId);
    setFallbackEmail(pendingEmail);
    // Do NOT set initializing to false here - wait for profile data to load
  }, [router, searchParams]);

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
        const list = (data.countries ?? []).slice().sort((a: any, b: any) => {
          const an = (a.name || a.value || '').toLowerCase();
          const bn = (b.name || b.value || '').toLowerCase();
          return an.localeCompare(bn);
        });
        setCountries(list);
        const map: Record<
          string,
          { name: string; value: string; delegations: { name: string; value: string; postalCode: string; latitude: number | null; longitude: number | null }[] }
        > = {};
        list.forEach((c: any) => {
          const keyName = (c.name || '').toLowerCase();
          const keyVal = (c.value || '').toLowerCase();
          const entry = {
            name: c.name || c.value || '',
            value: c.value || c.name || '',
            delegations: Array.isArray(c.delegations)
              ? c.delegations
                  .slice()
                  .sort((d1: any, d2: any) => (d1.name || d1.value || '').toLowerCase().localeCompare((d2.name || d2.value || '').toLowerCase()))
              : [],
          };
          if (keyName) map[keyName] = entry;
          if (keyVal) map[keyVal] = entry;
        });
        setGovMap(map);
        if (!country) setCountry(defaultCountry);
      })
      .catch(() => {});

    const resolveUser = async () => {
      const urlUser = searchParams?.get('userId') || resolvedUserId;
      if (urlUser && urlUser !== DEFAULT_USER_ID) return;

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
  }, [router, searchParams, resolvedUserId]);

  useEffect(() => {
    const targetId = searchParams?.get('userId') || resolvedUserId;
    if (!targetId) return;
    const fEmail = fallbackEmail || (typeof window !== 'undefined' ? localStorage.getItem('pendingVerificationEmail') || '' : '');
    fetch(`/api/profile?userId=${encodeURIComponent(targetId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.profile) {
          setAccountType(data.profile.accountType ?? 'user');
          setEmail(data.profile.email ?? fEmail);
          setPhone(data.profile.phone ?? '');
          setFirstName(data.profile.firstName ?? '');
          setLastName(data.profile.lastName ?? '');
          setAge(typeof data.profile.age === 'number' ? data.profile.age : '');
          setAddress(data.profile.address ?? '');
          setCity(data.profile.city ?? '');
          setPostalCode(data.profile.postalCode ?? '');
          setProvince(data.profile.province ?? '');
          setCountry(data.profile.country ?? defaultCountry);
          setPhone(data.profile.phone ?? '');
          setLatitude(typeof data.profile.latitude === 'number' ? data.profile.latitude : '');
          setLongitude(typeof data.profile.longitude === 'number' ? data.profile.longitude : '');
          setCategoryId(data.profile.categoryId ?? '');
          setJobId(data.profile.jobId ?? '');
          setKeywords(Array.isArray(data.profile.keywords) ? data.profile.keywords : []);
          setProviderWorkStatus(data.profile.providerWorkStatus || 'available');
          setPhotoDataUrl(data.profile.photoDataUrl ?? null);
          if (Array.isArray(data.profile.folders)) setFolders(data.profile.folders);
          setRatingAvg(typeof data.profile.ratingAvg === 'number' ? data.profile.ratingAvg : null);
          setRatingCount(data.profile.ratingCount ?? 0);
          setReviewCount(data.profile.reviewCount ?? 0);
          setScore(typeof data.profile.score === 'number' ? data.profile.score : null);

          const fullName = `${data.profile.firstName ?? ''} ${data.profile.lastName ?? ''}`.trim() || 'User';
          setProfileName(fullName);
          if (data.profile.photoDataUrl) setProfilePic(data.profile.photoDataUrl);
          else setProfilePic('/avatar-placeholder.svg');
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
    const gov = govMap[selected];
    const sortedDelegations = (gov?.delegations ?? []).slice().sort((a, b) => {
      const an = (a.name || a.value || '').toLowerCase();
      const bn = (b.name || b.value || '').toLowerCase();
      return an.localeCompare(bn);
    });
    setDelegations(sortedDelegations);
  }, [govMap, province]);

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

  useEffect(() => {
    if (!resolvedUserId) return;
    const loadGallery = async () => {
      try {
        const res = await fetch(`/api/gallery?userId=${encodeURIComponent(resolvedUserId)}`);
        const data = await res.json();
        setFolders(data.folders || []);
        if (data.folders?.length && !selectedFolderId) setSelectedFolderId(data.folders[0].id);
      } catch {
        // ignore
      }
    };
    loadGallery();
  }, [resolvedUserId, selectedFolderId]);

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
          providerWorkStatus,
          email,
          firstName,
          lastName,
          age: age === '' ? undefined : age,
          address,
          city,
          postalCode,
          province,
          country,
          phone,
          latitude: latitude === '' ? undefined : latitude,
          longitude: longitude === '' ? undefined : longitude,
          categoryId,
          jobId,
          keywords,
          folders,
          photoDataUrl,
          score,
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

  if (initializing) return null;

  return (
    <>
      <SiteHeader prefilledName={headerName} prefilledPhoto={headerPhoto} />

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
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '0.65rem 0.9rem', border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>
              {initializing ? <SkeletonLine width="80px" height="1.5rem" /> : (ratingAvg !== null ? `${ratingAvg.toFixed(1)} / 5` : 'Unrated')}
            </div>
            <div style={{ color: '#475569', marginTop: '0.25rem' }}>
              {initializing ? <SkeletonLine width="150px" height="1rem" /> : (`${ratingCount} rating${ratingCount === 1 ? '' : 's'} • ${reviewCount} review${reviewCount === 1 ? '' : 's'}`)}
            </div>
          </div>
          <div style={{ padding: '0.65rem 0.9rem', border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>
              {initializing ? <SkeletonLine width="80px" height="1.5rem" /> : (score !== null ? `${score}% Confidence` : 'No score')}
            </div>
            <div style={{ color: '#475569', marginTop: '0.25rem', fontSize: '0.9rem' }}>
              System reliability score
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'basic' ? '2px solid #0f172a' : 'none',
              color: activeTab === 'basic' ? '#0f172a' : '#64748b',
              fontWeight: activeTab === 'basic' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >
            👤 Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('location')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'location' ? '2px solid #0f172a' : 'none',
              color: activeTab === 'location' ? '#0f172a' : '#64748b',
              fontWeight: activeTab === 'location' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >
            📍 Location
          </button>
          {accountType === 'provider' && (
            <button
              type="button"
              onClick={() => setActiveTab('provider')}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'provider' ? '2px solid #0f172a' : 'none',
                color: activeTab === 'provider' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'provider' ? 600 : 400,
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s',
              }}
            >
              💼 Services
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'gallery' ? '2px solid #0f172a' : 'none',
              color: activeTab === 'gallery' ? '#0f172a' : '#64748b',
              fontWeight: activeTab === 'gallery' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >
            🖼️ Gallery
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          style={{ display: activeTab !== 'basic' ? 'none' : 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Email</span>
            {initializing ? <FormFieldSkeleton /> : (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Phone</span>
            {initializing ? <FormFieldSkeleton /> : (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Account type</span>
            {initializing ? <FormFieldSkeleton /> : (
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value === 'provider' ? 'provider' : 'user')}
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              >
                <option value="user">Normal user</option>
                <option value="provider">Service provider</option>
              </select>
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>First name</span>
            {initializing ? <FormFieldSkeleton /> : (
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Last name</span>
            {initializing ? <FormFieldSkeleton /> : (
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Age</span>
            {initializing ? <FormFieldSkeleton /> : (
              <input
                type="number"
                min={0}
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            )}
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Confidence Score (0-100) <span style={{ color: '#64748b', fontSize: '0.9rem' }}>System reliability</span></span>
            {initializing ? <FormFieldSkeleton /> : (
              <input
                type="number"
                min={0}
                max={100}
                value={score === null ? '' : score}
                onChange={(e) => setScore(e.target.value === '' ? null : Number(e.target.value))}
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Profile picture</span>
            {initializing ? <FormFieldSkeleton /> : (
              <>
                <input type="file" accept="image/*" onChange={onImageChange} />
                {photoDataUrl && (
                  <img
                    src={photoDataUrl}
                    alt="Profile preview"
                    style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 12, border: '1px solid #cbd5e1' }}
                  />
                )}
              </>
            )}
          </label>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading || initializing}
              style={{
                padding: '0.95rem 1.35rem',
                borderRadius: 12,
                border: 'none',
                background: '#0f172a',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 16px 40px rgba(15,23,42,0.18)',
                opacity: loading || initializing ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Save profile'}
            </button>
            {status && <span style={{ color: '#475569' }}>{status}</span>}
          </div>
        </form>

        <form
          onSubmit={onSubmit}
          style={{ display: activeTab !== 'location' ? 'none' : 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Address</span>
            {initializing ? <FormFieldSkeleton /> : (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Governorate</span>
            {initializing ? <FormFieldSkeleton /> : (
              <select
                value={province}
                onChange={(e) => {
                  const val = e.target.value;
                  setProvince(val);
                  setCity('');
                  setPostalCode('');
                  setLatitude('');
                  setLongitude('');
                  setViewLat(null);
                  setViewLon(null);
                }}
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              >
                <option value="">Select a governorate</option>
                {countries.map((c, idx) => (
                  <option key={c.id} value={c.name || c.value}>
                    {idx + 1}. {c.name || c.value}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Delegation</span>
            {initializing ? <FormFieldSkeleton /> : (
              <select
                value={city}
                onChange={(e) => {
                  const val = e.target.value;
                  setCity(val);
                  const selected = delegations.find(
                    (d) => (d.name || '').toLowerCase() === val.toLowerCase() || (d.value || '').toLowerCase() === val.toLowerCase()
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
                }}
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
                disabled={!province}
              >
                <option value="">Select a delegation</option>
                {delegations.map((d, idx) => {
                  const optKey = `${d.value || d.name || 'deleg'}-${d.postalCode || 'pc'}-${idx}`;
                  const label = d.name || d.value || 'Delegation';
                  return (
                    <option key={optKey} value={d.name || d.value}>
                      {idx + 1}. {label} {d.postalCode ? `(${d.postalCode})` : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Postal code</span>
            {initializing ? <FormFieldSkeleton /> : (
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Latitude</span>
            {initializing ? <FormFieldSkeleton /> : (
              <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Longitude</span>
            {initializing ? <FormFieldSkeleton /> : (
              <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            )}
          </label>

          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600 }}>Set your location on map</span>
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
              <span style={{ color: '#475569' }}>Using: {initializing ? <SkeletonLine width="120px" height="1rem" /> : (locationLabel || 'Not set')}</span>
            </div>
            {initializing ? <SkeletonBox width="100%" height="300px" borderRadius="0.75rem" /> : (
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
            )}
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading || initializing}
              style={{
                padding: '0.95rem 1.35rem',
                borderRadius: 12,
                border: 'none',
                background: '#0f172a',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 16px 40px rgba(15,23,42,0.18)',
                opacity: loading || initializing ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Save location'}
            </button>
            {status && <span style={{ color: '#475569' }}>{status}</span>}
          </div>
        </form>

        <form
          onSubmit={onSubmit}
          style={{ display: activeTab !== 'provider' ? 'none' : 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Work status</span>
            {initializing ? <FormFieldSkeleton /> : (
              <select
                value={providerWorkStatus}
                onChange={(e) => setProviderWorkStatus(e.target.value)}
                style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="away">Away / not taking jobs</option>
              </select>
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Category</span>
            {initializing ? <FormFieldSkeleton /> : (
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
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span>Job</span>
            {initializing ? <FormFieldSkeleton /> : (
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
            )}
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
            <span>Keywords (approved)</span>
            {initializing ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonBox key={i} width="100px" height="35px" borderRadius="0.625rem" />
                ))}
              </div>
            ) : (
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
            )}
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

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading || initializing}
              style={{
                padding: '0.95rem 1.35rem',
                borderRadius: 12,
                border: 'none',
                background: '#0f172a',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 16px 40px rgba(15,23,42,0.18)',
                opacity: loading || initializing ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Save services'}
            </button>
            {status && <span style={{ color: '#475569' }}>{status}</span>}
          </div>
        </form>

        <form
          onSubmit={onSubmit}
          style={{ display: activeTab !== 'gallery' ? 'none' : 'grid', gap: '1rem', gridTemplateColumns: '1fr' }}
        >
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>📸 Your Gallery</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder name"
                  style={{ padding: '0.65rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
                  disabled={initializing}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!resolvedUserId || !newFolderName.trim()) return;
                    try {
                      const res = await fetch('/api/gallery', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: resolvedUserId, action: 'add-folder', name: newFolderName }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setFolders(data.folders || []);
                        setSelectedFolderId(data.folders?.slice(-1)?.[0]?.id || null);
                        setNewFolderName('');
                      }
                    } catch {
                      // ignore
                    }
                  }}
                  style={{ padding: '0.65rem 0.95rem', borderRadius: 10, border: '1px solid #0f172a', background: '#0f172a', color: 'white', cursor: 'pointer' }}
                  disabled={initializing}
                >
                  Add folder
                </button>
              </div>
            </div>

            {initializing ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[1, 2, 3].map((i) => (
                  <SkeletonBox key={i} width="120px" height="36px" borderRadius="0.625rem" />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFolderId(f.id)}
                    style={{
                      padding: '0.55rem 0.9rem',
                      borderRadius: 10,
                      border: f.id === selectedFolderId ? '2px solid #0f172a' : '1px solid #cbd5e1',
                      background: f.id === selectedFolderId ? 'rgba(15,23,42,0.08)' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    {f.name}
                  </button>
                ))}
                {folders.length === 0 && <span style={{ color: '#475569' }}>No folders yet. Create one to start adding images.</span>}
              </div>
            )}

            {!initializing && selectedFolderId && (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Image URL"
                    style={{ flex: '1 1 240px', padding: '0.65rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    placeholder="Caption (optional)"
                    style={{ flex: '1 1 200px', padding: '0.65rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!resolvedUserId || !newImageUrl.trim()) return;
                      try {
                        const res = await fetch('/api/gallery', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            userId: resolvedUserId,
                            action: 'add-image',
                            folderId: selectedFolderId,
                            url: newImageUrl,
                            caption: newImageCaption,
                          }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setFolders(data.folders || []);
                          setNewImageUrl('');
                          setNewImageCaption('');
                        }
                      } catch {
                        // ignore
                      }
                    }}
                    style={{ padding: '0.65rem 0.95rem', borderRadius: 10, border: '1px solid #0f172a', background: '#0f172a', color: 'white', cursor: 'pointer' }}
                  >
                    Add image
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                  {(folders.find((f) => f.id === selectedFolderId)?.images || []).map((img) => (
                    <div key={img.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                      <img src={img.url} alt={img.caption || 'Gallery image'} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                      {img.caption && <div style={{ padding: '0.45rem 0.6rem', fontSize: '0.9rem' }}>{img.caption}</div>}
                    </div>
                  ))}
                  {(folders.find((f) => f.id === selectedFolderId)?.images || []).length === 0 && (
                    <div style={{ color: '#475569' }}>No images in this folder.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading || initializing}
              style={{
                padding: '0.95rem 1.35rem',
                borderRadius: 12,
                border: 'none',
                background: '#0f172a',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 16px 40px rgba(15,23,42,0.18)',
                opacity: loading || initializing ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Save gallery'}
            </button>
            {status && <span style={{ color: '#475569' }}>{status}</span>}
          </div>
        </form>
      </div>
    </main>
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageInner />
    </Suspense>
  );
}
