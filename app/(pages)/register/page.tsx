'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // Redirect away if already authenticated.
  useEffect(() => {
    const idToken = typeof window !== 'undefined' ? localStorage.getItem('idToken') : null;
    if (!idToken) {
      setChecking(false);
      return;
    }

    const verify = async () => {
      const res = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (res.ok) router.replace('/');
      else setChecking(false);
    };

    verify().catch(() => setChecking(false));
  }, [router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? 'Registration failed');
        return;
      }

      if (data?.user?.id) {
        localStorage.setItem('profileUserId', data.user.id);
      }
      localStorage.setItem('idToken', data.tokens.idToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      localStorage.setItem('pendingVerificationEmail', data.user.email);
      setStatus(data.message ?? `Registered ${data.user.email}. Verification email sent.`);
      router.push('/verify');
    } catch (error) {
      setStatus('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'white',
          borderRadius: '1rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xl)',
          padding: '2.5rem',
        }}
      >
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Create an account</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
          Join thousands of users booking and providing services.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Minimum 6 characters</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              color: 'white',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-md)',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        {status && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.75rem', background: status.includes('error') || status.includes('failed') ? '#fee2e2' : '#ecfdf5', color: status.includes('error') || status.includes('failed') ? 'var(--danger)' : 'var(--success)', fontSize: '0.9rem' }}>
            {status}
          </div>
        )}

        <div style={{ marginTop: '1.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}
