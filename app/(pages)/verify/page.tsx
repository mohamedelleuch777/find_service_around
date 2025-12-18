'use client';

import { useEffect, useMemo, useState } from 'react';

const RESEND_DELAY_MS =
  typeof process.env.NEXT_PUBLIC_VERIFY_RESEND_DELAY_MS !== 'undefined'
    ? Number(process.env.NEXT_PUBLIC_VERIFY_RESEND_DELAY_MS)
    : typeof process.env.VERIFY_RESEND_DELAY_MS !== 'undefined'
      ? Number(process.env.VERIFY_RESEND_DELAY_MS)
      : 120000;

export default function VerifyPage() {
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(RESEND_DELAY_MS / 1000));
  const [canResend, setCanResend] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutesSeconds = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [secondsLeft]);

  const onResend = async () => {
    if (!canResend || sending) return;
    setSending(true);
    setStatus(null);
    try {
      // The backend expects an email; use the one stored on registration if available.
      const email = localStorage.getItem('pendingVerificationEmail');
      if (!email) {
        setStatus('Email not available. Please register again to receive a new verification email.');
        setSending(false);
        return;
      }
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? 'Failed to resend verification email');
      } else {
        setStatus('Verification email re-sent.');
        setCanResend(false);
        setSecondsLeft(Math.floor(RESEND_DELAY_MS / 1000));
      }
    } catch (error) {
      setStatus('Unexpected error while resending email');
    } finally {
      setSending(false);
    }
  };

  return (
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
          maxWidth: 520,
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(8px)',
          borderRadius: 18,
          border: '1px solid #e2e8f0',
          boxShadow: '0 24px 50px rgba(15,23,42,0.1)',
          padding: '1.75rem',
        }}
      >
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem' }}>Verify your email</h1>
        <p style={{ color: '#475569', marginBottom: '1rem' }}>
          We’ve sent a verification email with a link to confirm your account.
        </p>
        <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
          Please check your inbox (and spam). When you click the link, you’ll be verified. If you don’t receive it, you
          can resend after the timer ends.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onResend}
            disabled={!canResend || sending}
            style={{
              padding: '0.95rem 1.1rem',
              borderRadius: 12,
              border: 'none',
              background: canResend ? '#0f172a' : '#94a3b8',
              color: 'white',
              fontWeight: 700,
              cursor: canResend ? 'pointer' : 'not-allowed',
              boxShadow: '0 16px 40px rgba(15,23,42,0.18)',
            }}
          >
            {sending ? 'Resending...' : 'Resend email'}
          </button>
          {!canResend && <span style={{ color: '#475569' }}>Available in {minutesSeconds}</span>}
        </div>

        {status && (
          <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: 10, background: '#e2e8f0' }}>{status}</div>
        )}
      </div>
    </main>
  );
}
