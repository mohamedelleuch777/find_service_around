'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import SiteHeader from '../../components/site-header';

const BrowseMap = dynamic(() => import('./browse-map'), { ssr: false });

type Provider = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  categoryId: string;
  jobId: string;
  categoryName: string;
  jobName: string;
  keywords: string[];
  latitude: number | null;
  longitude: number | null;
  city: string;
  province: string;
  country: string;
  address: string;
  postalCode: string;
  photoDataUrl?: string;
  providerWorkStatus?: string;
};

type Option = { id: string; name: string; categoryId?: string };

const DEFAULT_CENTER = { lat: 33.8869, lon: 9.5375 };
const END_REASONS = [
  { id: 'completed', name: 'Completed' },
  { id: 'not_satisfied', name: 'Not satisfied' },
  { id: 'no_show', name: 'No show' },
  { id: 'canceled', name: 'Canceled' },
  { id: 'other', name: 'Other' },
];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function BrowsePage() {
  const [categories, setCategories] = useState<Option[]>([]);
  const [jobOptions, setJobOptions] = useState<Option[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [endForm, setEndForm] = useState<{ jobId: string; reason: string; comment: string; rating: string }>({
    jobId: '',
    reason: 'completed',
    comment: '',
    rating: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/providers');
        const data = await res.json();
        const catOptions: Option[] = (data.categories || []).map((c: any) => ({ id: c.id, name: c.name }));
        const jobOpts: Option[] = (data.jobs || []).map((j: any) => ({
          id: j.id,
          name: j.name,
          categoryId: j.categoryId,
        }));
        setCategories(catOptions);
        setJobOptions(jobOpts);
        setProviders(data.providers || []);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  useEffect(() => {
    const uid = typeof window !== 'undefined' ? localStorage.getItem('profileUserId') || 'demo-user' : 'demo-user';
    setCurrentUserId(uid);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/jobs?userId=${encodeURIComponent(currentUserId)}&role=client`);
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch {
        // ignore
      }
    };
    fetchJobs();
  }, [currentUserId]);

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      if (selectedCategories.length && !selectedCategories.includes(p.categoryId)) return false;
      if (selectedJobs.length && !selectedJobs.includes(p.jobId)) return false;
      if (distanceKm > 0 && p.latitude !== null && p.longitude !== null) {
        const d = haversineDistance(center.lat, center.lon, p.latitude, p.longitude);
        if (d > distanceKm) return false;
      }
      return true;
    });
  }, [providers, selectedCategories, selectedJobs, distanceKm, center.lat, center.lon]);

  const markerData = filteredProviders
    .filter((p) => p.latitude !== null && p.longitude !== null)
    .map((p) => ({
      id: p.id,
      lat: p.latitude as number,
      lon: p.longitude as number,
      label: `${p.firstName} ${p.lastName}`.trim() || 'Provider',
      category: p.categoryName,
      job: p.jobName,
    }));

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', minHeight: '100vh' }}>
      <SiteHeader />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2.5rem 1.5rem 3rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: '300px 1fr' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '0.75rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            padding: '1.5rem 1.25rem',
            display: 'grid',
            gap: '1.25rem',
            alignSelf: 'start',
            position: 'sticky',
            top: 100,
            maxHeight: 'calc(100vh - 120px)',
            overflow: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>🔍 Categories & Jobs</span>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {categories.map((c) => {
                const enabled = selectedCategories.includes(c.id);
                const categoryJobs = jobOptions.filter((j) => j.categoryId === c.id);
                return (
                  <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.65rem 0.75rem', background: 'var(--bg-light)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, c.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter((id) => id !== c.id));
                            setSelectedJobs(selectedJobs.filter((jid) => !categoryJobs.some((j) => j.id === jid)));
                          }
                        }}
                      />
                      {c.name}
                    </label>
                    {enabled && categoryJobs.length > 0 && (
                      <div style={{ marginTop: '0.4rem', paddingLeft: '1.6rem', display: 'grid', gap: '0.3rem' }}>
                        {categoryJobs.map((j) => {
                          const jobEnabled = selectedJobs.includes(j.id);
                          return (
                            <label key={j.id} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={jobEnabled}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedJobs([...selectedJobs, j.id]);
                                  else setSelectedJobs(selectedJobs.filter((id) => id !== j.id));
                                }}
                              />
                              {j.name}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>📍 Distance (km)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="range"
                min={0}
                max={200}
                step={10}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ width: 52, textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>{distanceKm === 0 ? 'Any' : distanceKm}</span>
            </div>
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>🗺️ Center</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setCenter(DEFAULT_CENTER)}
                style={{ padding: '0.65rem 0.9rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setCenter({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                    });
                  }
                }}
                style={{ padding: '0.65rem 0.9rem', borderRadius: '0.5rem', border: '1px solid var(--primary)', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary-dark)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                My location
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.2rem' }}>
          <BrowseMap
            center={center}
            radiusKm={distanceKm || undefined}
            markers={markerData}
            onMarkerClick={(m) => {
              const found = filteredProviders.find((p) => p.id === m.id) || null;
              setSelectedProvider(found);
            }}
          />

          <div
            style={{
              background: 'white',
              borderRadius: '0.75rem',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
              padding: '1.5rem 1.75rem',
              display: 'grid',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>Providers</h2>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>({filteredProviders.length} result{filteredProviders.length !== 1 ? 's' : ''})</span>
            </div>

            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {filteredProviders.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border)',
                    background: 'white',
                    boxShadow: 'var(--shadow-md)',
                    display: 'grid',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setSelectedProvider(p)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', overflow: 'hidden', flexShrink: 0 }}>
                      {p.photoDataUrl ? (
                        <img src={p.photoDataUrl} alt={p.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 700, color: 'white' }}>
                          {((p.firstName || 'P')[0] + (p.lastName || '')[0])?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{`${p.firstName} ${p.lastName}`.trim() || 'Provider'}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{p.jobName || p.categoryName}</div>
                      <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                        {p.ratingAvg ? `${p.ratingAvg.toFixed(1)} ⭐` : 'Unrated'} {p.ratingCount ? `(${p.ratingCount})` : ''}
                      </div>
                      <div style={{ color: p.providerWorkStatus && p.providerWorkStatus !== 'available' ? '#b91c1c' : '#0f172a', fontWeight: 600 }}>
                        Status: {p.providerWorkStatus ? p.providerWorkStatus.replace(/_/g, ' ') : 'available'}
                      </div>
                    </div>
                  </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {p.city || p.province || p.country} {p.postalCode ? `• ${p.postalCode}` : ''}
                </div>
                {p.phone && (
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    📞 {p.phone}
                  </div>
                )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {[p.categoryName, p.jobName, ...p.keywords].filter(Boolean).map((tag) => (
                      <span
                        key={`${p.id}-${tag}`}
                        style={{
                          padding: '0.25rem 0.6rem',
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                          borderRadius: 999,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'var(--primary)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                {currentUserId && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={p.providerWorkStatus && p.providerWorkStatus !== 'available'}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!currentUserId) return;
                        if (p.providerWorkStatus && p.providerWorkStatus !== 'available') {
                          alert('Provider is not available right now.');
                          return;
                        }
                        try {
                          const res = await fetch('/api/jobs', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            clientId: currentUserId,
                            providerId: p.id,
                            categoryId: p.categoryId,
                            jobId: p.jobId,
                            title: p.jobName || p.categoryName,
                          }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setJobs([data.job, ...jobs]);
                          alert('Job request sent to provider for acceptance');
                        } else {
                            alert(data.error || 'Failed to hire');
                          }
                        } catch (err) {
                          alert('Failed to hire');
                        }
                      }}
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        color: 'white',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      {p.providerWorkStatus && p.providerWorkStatus !== 'available' ? 'Unavailable' : 'Hire'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/profile?userId=${encodeURIComponent(p.id)}`;
                      }}
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        background: 'white',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-light)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                    >
                      Profile
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

            {selectedProvider && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '2px solid var(--primary)',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{`${selectedProvider.firstName} ${selectedProvider.lastName}`}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedProvider.jobName || selectedProvider.categoryName}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProvider(null)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)', fontWeight: 700, fontSize: '1.2rem', padding: '0.5rem' }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                  📍 {selectedProvider.address || selectedProvider.city || selectedProvider.province || selectedProvider.country}
                </div>
                {selectedProvider.email && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <a href={`mailto:${selectedProvider.email}`} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                      📧 {selectedProvider.email}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
