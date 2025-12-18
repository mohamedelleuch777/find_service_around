import { NextResponse } from 'next/server';
import { getAuthAdmin } from '../../../../lib/firebase-admin';
import { sendEmail } from '../../../../lib/email';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const admin = getAuthAdmin();
  const verificationLink = await admin.generateEmailVerificationLink(email, {
    url: `${APP_URL}/verify`,
    handleCodeInApp: true,
  });

  await sendEmail({
    to: email,
    subject: 'Verify your email',
    text: `Verify your account by visiting: ${verificationLink}`,
    html: `<p>Verify your account by clicking this link:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
  });

  return NextResponse.json({ message: 'Verification email sent.' });
}
