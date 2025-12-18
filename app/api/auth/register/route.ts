import { NextResponse } from 'next/server';
import { firebaseIdentityRequest, FirebaseAuthResponse } from '../../../../lib/firebase';
import { getAuthAdmin } from '../../../../lib/firebase-admin';
import { sendEmail } from '../../../../lib/email';

type SignUpResponse = FirebaseAuthResponse<{
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
}>;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const res = await firebaseIdentityRequest('accounts:signUp', {
    email,
    password,
    returnSecureToken: true,
  });

  const data = (await res.json()) as SignUpResponse;

  if (!res.ok || data.error) {
    return NextResponse.json({ error: data.error?.message ?? 'Registration failed' }, { status: 400 });
  }

  // Generate verification link via Admin SDK so we can send with our own SMTP.
  const admin = getAuthAdmin();
  const verificationLink = await admin.generateEmailVerificationLink(data.email, {
    url: `${APP_URL}/verify`,
    handleCodeInApp: true,
  });

  await sendEmail({
    to: data.email,
    subject: 'Verify your email',
    text: `Verify your account by visiting: ${verificationLink}`,
    html: `<p>Verify your account by clicking this link:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
  });

  return NextResponse.json({
    user: { id: data.localId, email: data.email },
    tokens: { idToken: data.idToken, refreshToken: data.refreshToken },
    message: 'Verification email sent. Check your inbox for the link.',
  });
}
