'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormFieldSkeleton } from '../../components/skeleton';
import '../auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? 'Login failed');
        return;
      }

      if (data?.user?.id) {
        localStorage.setItem('profileUserId', data.user.id);
      }
      localStorage.setItem('idToken', data.tokens.idToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      setStatus(`Welcome back ${data.user.email}. Redirecting...`);
      router.replace('/');
    } catch (error) {
      setStatus('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Access your account to manage bookings and service listings.</p>

        <form onSubmit={onSubmit} className="auth-form">
          {checking || loading ? (
            <>
              <FormFieldSkeleton />
              <FormFieldSkeleton />
              <div style={{ height: '2.85rem' }} className="skeleton skeleton--line" />
            </>
          ) : (
            <>
              <label className="auth-label">
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                />
              </label>

              <label className="auth-label">
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                />
              </label>

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </>
          )}
        </form>

        {status && (
          <div
            className="auth-status"
            style={{
              background: status.includes('error') || status.includes('failed') ? '#fee2e2' : '#ecfdf5',
              color: status.includes('error') || status.includes('failed') ? 'var(--danger)' : 'var(--success)',
            }}
          >
            {status}
          </div>
        )}

        <div className="auth-links">
          <a href="/register">Create a new account</a>
          <a href="/forgot-password">Forgot your password?</a>
        </div>
      </div>
    </main>
  );
}
