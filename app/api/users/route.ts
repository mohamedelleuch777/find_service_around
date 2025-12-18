import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/firestore';

export async function GET() {
  const db = getDb();
  const snapshot = await db.collection('users').limit(50).get();
  const users = snapshot.docs.map((doc) => doc.data());
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const db = getDb();
  const body = await request.json();
  const docRef = db.collection('users').doc();
  const user = { id: docRef.id, ...body };
  await docRef.set(user);
  return NextResponse.json({ user }, { status: 201 });
}

export async function PUT(request: Request) {
  const db = getDb();
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  await db.collection('users').doc(body.id).set(body, { merge: true });
  return NextResponse.json({ updated: body });
}

export async function DELETE(request: NextRequest) {
  const db = getDb();
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  await db.collection('users').doc(id).delete();
  return NextResponse.json({ message: 'User removed' });
}
