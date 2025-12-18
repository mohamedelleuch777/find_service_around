import { NextResponse } from 'next/server';
import { firebaseIdentityRequest, FirebaseAuthResponse } from '../../../../lib/firebase';

type LookupResponse = FirebaseAuthResponse<{
  users?: Array<{ localId: string; email: string; emailVerified: boolean }>;
}>;

export async function POST(request: Request) {
  const { idToken } = await request.json().catch(() => ({}));

  if (!idToken) {
    return NextResponse.json({ error: 'idToken required' }, { status: 400 });
  }

  const res = await firebaseIdentityRequest('accounts:lookup', { idToken });
  const data = (await res.json()) as LookupResponse;

  if (!res.ok || data.error || !data.users?.length) {
    return NextResponse.json({ error: data.error?.message ?? 'Invalid token' }, { status: 401 });
  }

  const user = data.users[0];
  return NextResponse.json({ user: { id: user.localId, email: user.email, emailVerified: user.emailVerified } });
}
