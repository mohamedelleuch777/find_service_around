import { NextResponse } from 'next/server';
import { firebaseIdentityRequest, FirebaseAuthResponse } from '../../../../lib/firebase';

type VerifyResponse = FirebaseAuthResponse<{
  email: string;
}>;

export async function POST(request: Request) {
  const { oobCode } = await request.json().catch(() => ({}));

  if (!oobCode) {
    return NextResponse.json({ error: 'Verification code (oobCode) is required' }, { status: 400 });
  }

  const res = await firebaseIdentityRequest('accounts:update', { oobCode });
  const data = (await res.json()) as VerifyResponse;

  if (!res.ok || data.error) {
    return NextResponse.json({ error: data.error?.message ?? 'Verification failed' }, { status: 400 });
  }

  return NextResponse.json({ message: 'Email verified', email: data.email });
}
