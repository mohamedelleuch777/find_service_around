'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import SiteHeader from '../../components/site-header';
import { SkeletonBox } from '../../components/skeleton';
import './browse.css';

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
  ratingAvg?: number;
  ratingCount?: number;
  phone?: string;
};

type Option = { id: string; name: string; categoryId?: string };

const DEFAULT_CENTER = { lat: 33.8869, lon: 9.5375 };

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocationLoaded, setUserLocationLoaded] = useState(false);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('idToken') : null;
    const uid = typeof window !== 'undefined' ? localStorage.getItem('profileUserId') || 'demo-user' : 'demo-user';
    setIsLoggedIn(!!token);
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

  useEffect(() => {
    if (!currentUserId) return;
    const fetchUserLocation = async () => {
      try {
        const res = await fetch(`/api/profile?userId=${encodeURIComponent(currentUserId)}`);
        const data = await res.json();
        if (data.profile?.latitude && data.profile?.longitude) {
          setCenter({ lat: data.profile.latitude, lon: data.profile.longitude });
          setHasUserLocation(true);
        } else {
          setHasUserLocation(false);
        }
        if (data.profile?.firstName || data.profile?.lastName) {
          const fullName = `${data.profile.firstName || ''} ${data.profile.lastName || ''}`.trim();
          setUserName(fullName || 'User');
        }
      } catch {
        // ignore
      } finally {
        setUserLocationLoaded(true);
      }
    };
    fetchUserLocation();
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
    <div className="browse-page">
      <SiteHeader />

      <main className="browse-main">
        <div className="browse-sidebar">
          <div className="browse-filter-group">
            <span className="browse-filter-title">
              <i className="fa-solid fa-layer-group" aria-hidden="true" />
              Categories & Jobs
            </span>
            <div className="stack-sm">
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <SkeletonBox key={i} width="100%" height="80px" borderRadius="0.5rem" />
                  ))}
                </>
              ) : (
                categories.map((c) => {
                  const enabled = selectedCategories.includes(c.id);
                  const categoryJobs = jobOptions.filter((j) => j.categoryId === c.id);
                  return (
                    <div key={c.id} className="browse-filter-card">
                      <label className="browse-filter-label">
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
                        <div className="browse-subfilters">
                          {categoryJobs.map((j) => {
                            const jobEnabled = selectedJobs.includes(j.id);
                            return (
                              <label key={j.id} className="browse-filter-label">
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
                })
              )}
            </div>
          </div>

          <label className="browse-filter-group">
            <span className="browse-filter-title">
              <i className="fa-solid fa-route" aria-hidden="true" />
              Distance (km)
            </span>
            <div className="browse-range">
              <input
                type="range"
                min={0}
                max={200}
                step={10}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                style={{ flex: 1, opacity: loading ? 0.5 : 1 }}
                disabled={loading}
              />
              <span className="browse-range-value">{distanceKm === 0 ? 'Any' : distanceKm}</span>
            </div>
          </label>

          <div className="browse-filter-group">
            <span className="browse-filter-title">
              <i className="fa-solid fa-location-crosshairs" aria-hidden="true" />
              Center
            </span>
            <div className="browse-center-actions">
              <button
                type="button"
                onClick={() => setCenter(DEFAULT_CENTER)}
                disabled={loading}
                className="browse-btn"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!currentUserId) return;
                  try {
                    const res = await fetch(`/api/profile?userId=${encodeURIComponent(currentUserId)}`);
                    const data = await res.json();
                    if (data.profile?.latitude && data.profile?.longitude) {
                      setCenter({ lat: data.profile.latitude, lon: data.profile.longitude });
                    } else if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setCenter({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                      });
                    }
                  } catch {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setCenter({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                      });
                    }
                  }
                }}
                disabled={loading}
                className="browse-btn browse-btn--primary"
              >
                My location
              </button>
            </div>
          </div>
        </div>

        <div className="browse-content">
          <BrowseMap
            center={center}
            radiusKm={distanceKm || undefined}
            markers={markerData}
            showUserMarker={userLocationLoaded && hasUserLocation && isLoggedIn}
            userName={userName}
            currentUserId={currentUserId}
            onMarkerClick={(m) => {
              const found = filteredProviders.find((p) => p.id === m.id) || null;
              setSelectedProvider(found);
            }}
          />

          <div className="browse-providers">
            <div className="browse-providers-head">
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>Providers</h2>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                ({filteredProviders.length} result{filteredProviders.length !== 1 ? 's' : ''})
              </span>
            </div>

            <div className="browse-providers-grid">
              {filteredProviders.map((p) => (
                <div
                  key={p.id}
                  className="provider-card"
                  onClick={() => setSelectedProvider(p)}
                >
                  <div className="provider-header">
                    <div className="provider-avatar">
                      {p.photoDataUrl ? (
                        <img src={p.photoDataUrl} alt={p.firstName} />
                      ) : (
                        <div>
                          {((p.firstName || 'P')[0] + (p.lastName || '')[0])?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="provider-name">{`${p.firstName} ${p.lastName}`.trim() || 'Provider'}</div>
                      <div className="provider-subtitle">{p.jobName || p.categoryName}</div>
                      <div className="provider-rating">
                        {p.ratingAvg ? (
                          <>
                            {p.ratingAvg.toFixed(1)}
                            <i className="fa-solid fa-star" aria-hidden="true" />
                          </>
                        ) : (
                          'Unrated'
                        )}{' '}
                        {p.ratingCount ? `(${p.ratingCount})` : ''}
                      </div>
                      <div
                        className={`provider-status ${p.providerWorkStatus && p.providerWorkStatus !== 'available' ? 'provider-status--busy' : 'provider-status--available'}`}
                      >
                        Status: {p.providerWorkStatus ? p.providerWorkStatus.replace(/_/g, ' ') : 'available'}
                      </div>
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {p.city || p.province || p.country} {p.postalCode ? `• ${p.postalCode}` : ''}
                  </div>
                  {p.phone && (
                    <div className="provider-contact">
                      <i className="fa-solid fa-phone" aria-hidden="true" />
                      {p.phone}
                    </div>
                  )}
                  <div className="provider-tags">
                    {[p.categoryName, p.jobName, ...p.keywords].filter(Boolean).map((tag) => (
                      <span key={`${p.id}-${tag}`} className="provider-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {currentUserId && (
                    <div className="provider-actions">
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
                        className="provider-btn provider-btn--primary"
                      >
                        {p.providerWorkStatus && p.providerWorkStatus !== 'available' ? 'Unavailable' : 'Hire'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/profile?userId=${encodeURIComponent(p.id)}`;
                        }}
                        className="provider-btn"
                      >
                        Profile
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedProvider && (
              <div className="provider-detail">
                <div className="provider-detail-head">
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{`${selectedProvider.firstName} ${selectedProvider.lastName}`}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedProvider.jobName || selectedProvider.categoryName}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProvider(null)}
                    className="provider-detail-close"
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  {selectedProvider.address || selectedProvider.city || selectedProvider.province || selectedProvider.country}
                </div>
                {selectedProvider.email && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <a href={`mailto:${selectedProvider.email}`} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <i className="fa-solid fa-envelope" aria-hidden="true" />
                      {selectedProvider.email}
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
