import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/firestore';

export async function GET() {
  const db = getDb();
  const snapshot = await db.collection('products').limit(50).get();
  const products = snapshot.docs.map((doc) => doc.data());
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const db = getDb();
  const body = await request.json();
  const docRef = db.collection('products').doc();
  const product = { id: docRef.id, ...body };
  await docRef.set(product);
  return NextResponse.json({ product }, { status: 201 });
}

export async function PUT(request: Request) {
  const db = getDb();
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  await db.collection('products').doc(body.id).set(body, { merge: true });
  return NextResponse.json({ updated: body });
}

export async function DELETE(request: NextRequest) {
  const db = getDb();
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  await db.collection('products').doc(id).delete();
  return NextResponse.json({ message: 'Product removed' });
}
