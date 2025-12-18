import { NextResponse } from 'next/server';
import { firebaseIdentityRequest, FirebaseAuthResponse } from '../../../../lib/firebase';

type SignInResponse = FirebaseAuthResponse<{
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
}>;

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const res = await firebaseIdentityRequest('accounts:signInWithPassword', {
    email,
    password,
    returnSecureToken: true,
  });

  const data = (await res.json()) as SignInResponse;

  if (!res.ok || data.error) {
    return NextResponse.json({ error: data.error?.message ?? 'Login failed' }, { status: 400 });
  }

  return NextResponse.json({
    user: { id: data.localId, email: data.email },
    tokens: { idToken: data.idToken, refreshToken: data.refreshToken },
  });
}
