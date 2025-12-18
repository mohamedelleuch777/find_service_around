import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/firestore';

export async function POST(request: Request) {
  const db = getDb();
  const body = await request.json();
  const name = (body?.name || '').trim();
  if (!name) {
    return NextResponse.json({ error: 'Keyword name is required' }, { status: 400 });
  }
  const docRef = db.collection('keywordSuggestions').doc();
  await docRef.set({ id: docRef.id, name, approved: false, createdAt: Date.now() });
  return NextResponse.json({ message: 'Suggestion submitted for review' });
}
