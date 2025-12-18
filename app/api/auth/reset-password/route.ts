import { NextResponse } from 'next/server';
import { firebaseIdentityRequest, FirebaseAuthResponse } from '../../../../lib/firebase';

type ResetPasswordResponse = FirebaseAuthResponse<{
  email: string;
}>;

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const res = await firebaseIdentityRequest('accounts:sendOobCode', {
    requestType: 'PASSWORD_RESET',
    email,
  });

  const data = (await res.json()) as ResetPasswordResponse;

  if (!res.ok || data.error) {
    return NextResponse.json({ error: data.error?.message ?? 'Reset password failed' }, { status: 400 });
  }

  return NextResponse.json({ message: 'Password reset email sent', email: data.email });
}
