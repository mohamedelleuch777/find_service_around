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
    email: body.email ?? '',
    accountType: body.accountType === 'provider' ? 'provider' : 'user',
    providerWorkStatus: body.providerWorkStatus || 'available',
    firstName: body.firstName,
    lastName: body.lastName,
    age: body.age === undefined || body.age === '' ? null : Number(body.age),
    address: body.address ?? '',
    city: body.city ?? '',
    postalCode: body.postalCode ?? '',
    province: body.province ?? '',
    country: body.country ?? '',
    phone: body.phone ?? '',
    photoDataUrl: body.photoDataUrl ?? '',
    latitude: body.latitude === undefined || body.latitude === '' ? null : Number(body.latitude),
    longitude: body.longitude === undefined || body.longitude === '' ? null : Number(body.longitude),
    categoryId: body.categoryId ?? '',
    jobId: body.jobId ?? '',
    keywords: Array.isArray(body.keywords) ? body.keywords : [],
    updatedAt: Date.now(),
  };

  const cleaned: Record<string, unknown> = {};
  Object.entries(payload).forEach(([k, v]) => {
    cleaned[k] = clean(v);
  });

  await db.collection('profiles').doc(userId).set(cleaned, { merge: true });

  return NextResponse.json({ profile: cleaned });
}
