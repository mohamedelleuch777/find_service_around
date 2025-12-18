import { NextResponse } from 'next/server';
import { getFirebaseApiKey } from '../../../../lib/firebase';

type RevokeResponse = {
  error?: { message?: string };
};

export async function POST(request: Request) {
  const { refreshToken } = await request.json().catch(() => ({}));

  if (!refreshToken) {
    return NextResponse.json({
      message: 'No refresh token provided. Tokens are stateless; delete stored tokens on the client to log out.',
    });
  }

  const apiKey = getFirebaseApiKey();
  const url = `https://securetoken.googleapis.com/v1/token:revoke?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token: refreshToken }).toString(),
  });

  const data = (await res.json().catch(() => ({}))) as RevokeResponse;

  if (!res.ok || data.error) {
    return NextResponse.json({ error: data.error?.message ?? 'Failed to revoke refresh token' }, { status: 400 });
  }

  return NextResponse.json({ message: 'Refresh token revoked. Ensure client clears any stored tokens.' });
}
