'use client';

import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

      setStatus(`Registered ${data.user.email}. ID token: ${data.tokens.idToken.slice(0, 8)}...`);
    } catch (error) {
      setStatus('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem 1.5rem', maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 1rem' }}>Create an account</h1>
      <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
        Start booking services and manage your provider profile.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
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
            style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.85rem',
            borderRadius: 10,
            border: 'none',
            background: '#0f172a',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      {status && (
        <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: 8, background: '#e2e8f0' }}>
          {status}
        </div>
      )}
    </main>
  );
}
