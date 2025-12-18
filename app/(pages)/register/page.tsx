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
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem' }}>Create an account</h1>
        <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
          Start booking services and manage your provider profile.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
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
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.95rem',
              borderRadius: 12,
              border: 'none',
              background: '#0f172a',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 16px 40px rgba(15,23,42,0.18)',
            }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {status && (
          <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: 10, background: '#e2e8f0' }}>
            {status}
          </div>
        )}

        <div style={{ marginTop: '1rem', color: '#475569', fontSize: '0.95rem' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#0f172a', fontWeight: 600 }}>
            Log in
          </a>
        </div>
      </div>
    </main>
  );
}
