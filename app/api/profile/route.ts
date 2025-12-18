import { NextRequest, NextResponse } from 'next/server';
import { db, Profile } from '../../../lib/db';

const DEFAULT_USER_ID = 'demo-user';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') ?? DEFAULT_USER_ID;
  const profile = db.profiles.find((p) => p.userId === userId);
  return NextResponse.json({ profile: profile ?? null });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Profile> & { userId?: string };
  const userId = body.userId ?? DEFAULT_USER_ID;

  if (!body.firstName || !body.lastName) {
    return NextResponse.json({ error: 'First and last name are required' }, { status: 400 });
  }

  const payload: Profile = {
    userId,
    accountType: body.accountType === 'provider' ? 'provider' : 'user',
    firstName: body.firstName,
    lastName: body.lastName,
    age: body.age,
    address: body.address,
    city: body.city,
    postalCode: body.postalCode,
    province: body.province,
    country: body.country,
    photoDataUrl: body.photoDataUrl,
  };

  const existingIndex = db.profiles.findIndex((p) => p.userId === userId);
  if (existingIndex >= 0) {
    db.profiles[existingIndex] = payload;
  } else {
    db.profiles.push(payload);
  }

  return NextResponse.json({ profile: payload });
}
