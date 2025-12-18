import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/firestore';

const DEFAULT_USER_ID = 'demo-user';

const clean = (value: unknown) => (value === undefined ? null : value);

export async function GET(req: NextRequest) {
  const db = getDb();
  const userId = req.nextUrl.searchParams.get('userId') ?? DEFAULT_USER_ID;
  const doc = await db.collection('profiles').doc(userId).get();
  return NextResponse.json({ profile: doc.exists ? doc.data() : null });
}

export async function POST(request: Request) {
  const db = getDb();
  const body = await request.json();
  const userId = body.userId ?? DEFAULT_USER_ID;

  if (!body.firstName || !body.lastName) {
    return NextResponse.json({ error: 'First and last name are required' }, { status: 400 });
  }

  const payload = {
    userId,
    accountType: body.accountType === 'provider' ? 'provider' : 'user',
    firstName: body.firstName,
    lastName: body.lastName,
    age: body.age === undefined || body.age === '' ? null : Number(body.age),
    address: body.address ?? '',
    city: body.city ?? '',
    postalCode: body.postalCode ?? '',
    province: body.province ?? '',
    country: body.country ?? '',
    photoDataUrl: body.photoDataUrl ?? '',
    updatedAt: Date.now(),
  };

  // Remove undefined to avoid Firestore errors.
  const cleaned: Record<string, unknown> = {};
  Object.entries(payload).forEach(([k, v]) => {
    cleaned[k] = clean(v);
  });

  await db.collection('profiles').doc(userId).set(cleaned, { merge: true });

  return NextResponse.json({ profile: cleaned });
}
