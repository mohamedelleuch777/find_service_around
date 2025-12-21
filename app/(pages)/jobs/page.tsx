'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import SiteHeader from '../../components/site-header';

type Job = {
  id: string;
  title?: string;
  clientId: string;
  providerId: string;
  status: string;
  endRequest?: any;
  counterRequest?: any;
  closure?: any;
  acceptance?: any;
  decline?: any;
  createdAt?: number;
  updatedAt?: number;
};

const END_REASONS = [
  { id: 'completed', name: 'Completed' },
  { id: 'not_satisfied', name: 'Not satisfied' },
  { id: 'no_show', name: 'No show' },
  { id: 'canceled', name: 'Canceled' },
  { id: 'other', name: 'Other' },
  { id: 'price_disagreement', name: 'Price disagreement' },
  { id: 'reschedule', name: 'Reschedule' },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [endForm, setEndForm] = useState<{ jobId: string; reason: string; comment: string; rating: string }>({
    jobId: '',
    reason: 'completed',
    comment: '',
    rating: '',
  });
  const [responseForm, setResponseForm] = useState<{ jobId: string; comment: string; rating: string; reason: string }>({
    jobId: '',
    comment: '',
    rating: '',
    reason: 'completed',
  });

  useEffect(() => {
    const uid = typeof window !== 'undefined' ? localStorage.getItem('profileUserId') || 'demo-user' : 'demo-user';
    setCurrentUserId(uid);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs?userId=${encodeURIComponent(currentUserId)}&role=any`);
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUserId]);

  const inProgress = useMemo(() => jobs.filter((j) => j.status === 'in_progress'), [jobs]);
  const pendingProvider = useMemo(() => jobs.filter((j) => j.status === 'pending_provider'), [jobs]);
  const pendingClient = useMemo(() => jobs.filter((j) => j.status === 'pending_client'), [jobs]);
  const awaitingAcceptance = useMemo(() => jobs.filter((j) => j.status === 'pending_provider_accept'), [jobs]);
  const closed = useMemo(() => jobs.filter((j) => j.status === 'closed' || j.status === 'canceled' || j.status === 'declined'), [jobs]);
  const disputed = useMemo(() => jobs.filter((j) => j.status === 'disputed'), [jobs]);

  const endJob = async (jobId: string) => {
    if (!jobId || !currentUserId) return;
    const jobForEnd = jobs.find((j) => j.id === jobId);
    const payloadReason = endForm.jobId === jobId ? endForm.reason : 'completed';
    const payloadComment = endForm.jobId === jobId ? endForm.comment : '';
    const payloadRating = endForm.jobId === jobId ? endForm.rating : '';
    const fallbackStatus =
      jobForEnd?.clientId === currentUserId
        ? 'pending_provider'
        : jobForEnd?.providerId === currentUserId
        ? 'pending_client'
        : 'pending_provider';
    try {
      const res = await fetch('/api/jobs/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          userId: currentUserId,
          reason: payloadReason,
          comment: payloadComment,
          rating: payloadRating,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setJobs(
          jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  ...(data.job || {}),
                  status: data.job?.status || fallbackStatus,
                  endRequest: data.job?.endRequest || j.endRequest,
                }
              : j
          )
        );
        setEndForm({ jobId: '', reason: 'completed', comment: '', rating: '' });
      } else {
        alert(data.error || 'Failed to end job');
      }
    } catch {
      alert('Failed to end job');
    }
  };

  const respond = async (action: 'accept' | 'reject' | 'escalate') => {
    if (!responseForm.jobId || !currentUserId) return;
    try {
      const res = await fetch('/api/jobs/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: responseForm.jobId,
          userId: currentUserId,
          action,
          reason: responseForm.reason,
          comment: responseForm.comment,
          rating: responseForm.rating,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setJobs(jobs.map((j) => (j.id === responseForm.jobId ? { ...j, ...data.job } : j)));
        setResponseForm({ jobId: '', comment: '', rating: '', reason: 'completed' });
      } else {
        alert(data.error || 'Action failed');
      }
    } catch {
      alert('Action failed');
    }
  };

  const decideInvitation = async (jobId: string, action: 'accept' | 'refuse') => {
    if (!jobId || !currentUserId) return;
    try {
      const res = await fetch('/api/jobs/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, userId: currentUserId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setJobs(jobs.map((j) => (j.id === jobId ? { ...j, ...data.job } : j)));
      } else {
        alert(data.error || 'Action failed');
      }
    } catch {
      alert('Action failed');
    }
  };

  const allJobs = [
    ...awaitingAcceptance.map((j) => ({ ...j, section: 'Awaiting acceptance' })),
    ...inProgress.map((j) => ({ ...j, section: 'In progress' })),
    ...pendingProvider.map((j) => ({ ...j, section: 'Waiting on provider' })),
    ...pendingClient.map((j) => ({ ...j, section: 'Waiting on client' })),
    ...disputed.map((j) => ({ ...j, section: 'Disputed' })),
    ...closed.map((j) => ({ ...j, section: 'Closed' })),
  ];
  const showClient = allJobs.some((j) => j.clientId !== currentUserId);
  const showProvider = allJobs.some((j) => j.providerId !== currentUserId);
  const colCount = 4 + (showClient ? 1 : 0) + (showProvider ? 1 : 0);

  const statusStyle = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      in_progress: { bg: '#e0f2fe', color: '#0369a1' },
      pending_provider: { bg: '#fef9c3', color: '#854d0e' },
      pending_provider_accept: { bg: '#fef9c3', color: '#854d0e' },
      pending_client: { bg: '#e0f2fe', color: '#0369a1' },
      disputed: { bg: '#fee2e2', color: '#b91c1c' },
      closed: { bg: '#dcfce7', color: '#166534' },
      canceled: { bg: '#f1f5f9', color: '#0f172a' },
      declined: { bg: '#f8fafc', color: '#334155' },
    };
    return styles[status] || { bg: '#f8fafc', color: '#0f172a' };
  };

  const renderTable = (title: string, items: (Job & { section?: string })[]) => (
    <div
      style={{
        background: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
        padding: '1.25rem 1.5rem',
        display: 'grid',
        gap: '0.9rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <span style={{ color: '#475569' }}>{items.length} total</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem 0.65rem', borderBottom: '1px solid #e2e8f0' }}>Section</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 0.65rem', borderBottom: '1px solid #e2e8f0' }}>Job</th>
              {showClient && <th style={{ textAlign: 'left', padding: '0.75rem 0.65rem', borderBottom: '1px solid #e2e8f0' }}>Client</th>}
              {showProvider && <th style={{ textAlign: 'left', padding: '0.75rem 0.65rem', borderBottom: '1px solid #e2e8f0' }}>Provider</th>}
              <th style={{ textAlign: 'left', padding: '0.75rem 0.65rem', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 0.65rem', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={colCount} style={{ padding: '0.9rem 0.65rem', color: '#475569' }}>
                  No jobs here.
                </td>
              </tr>
            )}
            {items.map((job) => (
              <Fragment key={job.id}>
                <tr style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                  <td style={{ padding: '0.9rem 0.65rem', color: '#475569', fontWeight: 600 }}>{job.section || '-'}</td>
                  <td style={{ padding: '0.9rem 0.65rem' }}>
                    <div style={{ fontWeight: 700 }}>{job.title || job.jobId || 'Job'}</div>
                    {job.endRequest && (
                      <div style={{ color: '#475569', fontSize: '0.9rem', marginTop: 4 }}>
                        {job.endRequest.by === 'provider' ? 'Provider' : 'Client'} ended: {job.endRequest.reason} {job.endRequest.comment ? `• ${job.endRequest.comment}` : ''}
                        {job.endRequest.rating !== null && job.endRequest.rating !== undefined ? ` • Rating ${job.endRequest.rating}` : ''}
                      </div>
                    )}
                    {job.counterRequest && (
                      <div style={{ color: '#475569', fontSize: '0.9rem', marginTop: 4 }}>
                        Provider response: {job.counterRequest.reason} {job.counterRequest.comment ? `• ${job.counterRequest.comment}` : ''}
                        {job.counterRequest.rating !== null && job.counterRequest.rating !== undefined ? ` • Rating ${job.counterRequest.rating}` : ''}
                      </div>
                    )}
                    {job.closure && (
                      <div style={{ color: '#0f172a', fontSize: '0.9rem', marginTop: 4 }}>
                        Closed: {job.closure.reason} {job.closure.clientComment ? `• Client: ${job.closure.clientComment}` : ''}{' '}
                        {job.closure.providerComment ? `• Provider: ${job.closure.providerComment}` : ''}
                      </div>
                    )}
                    {job.status === 'pending_provider_accept' && <div style={{ color: '#0f172a', marginTop: 4 }}>Awaiting provider acceptance</div>}
                    {job.acceptance && <div style={{ color: '#0f172a', marginTop: 4 }}>Accepted by provider</div>}
                    {job.decline && <div style={{ color: '#b91c1c', marginTop: 4 }}>Declined by provider</div>}
                  </td>
                  {showClient && <td style={{ padding: '0.9rem 0.65rem', color: '#475569' }}>{job.clientId}</td>}
                  {showProvider && <td style={{ padding: '0.9rem 0.65rem', color: '#475569' }}>{job.providerId}</td>}
                  <td style={{ padding: '0.9rem 0.65rem', color: '#0f172a' }}>
                    {(() => {
                      const { bg, color } = statusStyle(job.status);
                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.35rem 0.65rem',
                            borderRadius: 10,
                            background: bg,
                            color,
                            fontWeight: 700,
                            textTransform: 'capitalize',
                          }}
                        >
                          {job.status.replace(/_/g, ' ')}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: '0.9rem 0.65rem', minWidth: 240 }}>
                    {job.status === 'pending_provider_accept' && job.providerId === currentUserId && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => decideInvitation(job.id, 'accept')}
                          style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #0f172a', background: '#0f172a', color: 'white', cursor: 'pointer' }}
                        >
                          Accept job
                        </button>
                        <button
                          type="button"
                          onClick={() => decideInvitation(job.id, 'refuse')}
                          style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                        >
                          Refuse job
                        </button>
                      </div>
                    )}

                    {job.status === 'in_progress' && (
                      <div style={{ display: 'grid', gap: '0.35rem' }}>
                        {endForm.jobId !== job.id && (
                          <button
                            type="button"
                            onClick={() => setEndForm({ ...endForm, jobId: job.id })}
                            style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #0f172a', background: '#0f172a', color: 'white', cursor: 'pointer', width: 'fit-content' }}
                          >
                            End job
                          </button>
                        )}
                        {endForm.jobId === job.id && (
                          <div style={{ display: 'grid', gap: '0.35rem' }}>
                            <select
                              value={endForm.reason}
                              onChange={(e) => setEndForm({ ...endForm, jobId: job.id, reason: e.target.value })}
                              style={{ padding: '0.5rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
                            >
                              {END_REASONS.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            <textarea
                              placeholder="Comment (optional)"
                              value={endForm.comment}
                              onChange={(e) => setEndForm({ ...endForm, jobId: job.id, comment: e.target.value })}
                              rows={2}
                              style={{ padding: '0.5rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
                            />
                            <input
                              type="number"
                              min={0}
                              max={5}
                              step={0.1}
                              placeholder={job.clientId === currentUserId ? 'Rate provider (optional)' : 'Rate client (optional)'}
                              value={endForm.rating}
                              onChange={(e) => setEndForm({ ...endForm, jobId: job.id, rating: e.target.value })}
                              style={{ padding: '0.5rem', borderRadius: 10, border: '1px solid #cbd5e1', width: 180 }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => endJob(job.id)}
                                style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #0f172a', background: '#0f172a', color: 'white', cursor: 'pointer' }}
                              >
                                Submit end
                              </button>
                              <button
                                type="button"
                                onClick={() => setEndForm({ jobId: '', reason: 'completed', comment: '', rating: '' })}
                                style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {job.status === 'pending_provider' && job.providerId === currentUserId && (
                      <div style={{ display: 'grid', gap: '0.35rem' }}>
                        {responseForm.jobId !== job.id && (
                          <button
                            type="button"
                            onClick={() => setResponseForm({ ...responseForm, jobId: job.id })}
                            style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #0f172a', background: '#0f172a', color: 'white', cursor: 'pointer', width: 'fit-content' }}
                          >
                            Respond
                          </button>
                        )}
                        {responseForm.jobId === job.id && (
                          <div style={{ display: 'grid', gap: '0.35rem' }}>
                            <textarea
                              placeholder="Comment to client (optional)"
                              value={responseForm.comment}
                              onChange={(e) => setResponseForm({ ...responseForm, jobId: job.id, comment: e.target.value })}
                              rows={2}
                              style={{ padding: '0.5rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
                            />
                            <input
                              type="number"
                              min={0}
                              max={5}
                              step={0.1}
                              placeholder="Rate client (optional)"
                              value={responseForm.rating}
                              onChange={(e) => setResponseForm({ ...responseForm, jobId: job.id, rating: e.target.value })}
                              style={{ padding: '0.5rem', borderRadius: 10, border: '1px solid #cbd5e1', width: 180 }}
                            />
                            <select
                              value={responseForm.reason}
                              onChange={(e) => setResponseForm({ ...responseForm, jobId: job.id, reason: e.target.value })}
                              style={{ padding: '0.5rem', borderRadius: 10, border: '1px solid #cbd5e1', width: 200 }}
                            >
                              {END_REASONS.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => respond('accept')}
                                style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #0f172a', background: '#0f172a', color: 'white', cursor: 'pointer' }}
                              >
                                Accept & close
                              </button>
                              <button
                                type="button"
                                onClick={() => respond('reject')}
                                style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                              >
                                Reject reason
                              </button>
                              <button
                                type="button"
                                onClick={() => setResponseForm({ jobId: '', comment: '', rating: '', reason: 'completed' })}
                                style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {job.status === 'pending_client' && job.clientId === currentUserId && (
                      <div style={{ display: 'grid', gap: '0.35rem' }}>
                        {responseForm.jobId !== job.id && (
                          <button
                            type="button"
                            onClick={() => setResponseForm({ ...responseForm, jobId: job.id })}
                            style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #0f172a', background: '#0f172a', color: 'white', cursor: 'pointer', width: 'fit-content' }}
                          >
                            Respond
                          </button>
                        )}
                        {responseForm.jobId === job.id && (
                          <div style={{ display: 'grid', gap: '0.35rem' }}>
                            <textarea
                              placeholder="Comment (optional)"
                              value={responseForm.comment}
                              onChange={(e) => setResponseForm({ ...responseForm, jobId: job.id, comment: e.target.value })}
                              rows={2}
                              style={{ padding: '0.5rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
                            />
                            <input
                              type="number"
                              min={0}
                              max={5}
                              step={0.1}
                              placeholder="Rate provider (optional)"
                              value={responseForm.rating}
                              onChange={(e) => setResponseForm({ ...responseForm, jobId: job.id, rating: e.target.value })}
                              style={{ padding: '0.5rem', borderRadius: 10, border: '1px solid #cbd5e1', width: 180 }}
                            />
                            <select
                              value={responseForm.reason}
                              onChange={(e) => setResponseForm({ ...responseForm, jobId: job.id, reason: e.target.value })}
                              style={{ padding: '0.5rem', borderRadius: 10, border: '1px solid #cbd5e1', width: 200 }}
                            >
                              {END_REASONS.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => respond('accept')}
                                style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #0f172a', background: '#0f172a', color: 'white', cursor: 'pointer' }}
                              >
                                Accept resolution
                              </button>
                              <button
                                type="button"
                                onClick={() => respond('escalate')}
                                style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                              >
                                Escalate dispute
                              </button>
                              <button
                                type="button"
                                onClick={() => setResponseForm({ jobId: '', comment: '', rating: '', reason: 'completed' })}
                                style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'radial-gradient(circle at 20% 20%, rgba(14,165,233,0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.12), transparent 30%), #f7f9fb', minHeight: '100vh' }}>
      <SiteHeader />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem 3rem', display: 'grid', gap: '1.2rem' }}>
        <h1 style={{ margin: 0 }}>My jobs</h1>
        {loading ? <div>Loading...</div> : renderTable('All jobs', allJobs)}
      </main>
    </div>
  );
}
