import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { getDb } from '../../../lib/firestore';

type ImageItem = { id: string; url: string; caption?: string };
type Folder = { id: string; name: string; images: ImageItem[] };

function normalize(data: any): Folder[] {
  if (!data || typeof data !== 'object') return [];
  const folders = Array.isArray(data.folders) ? data.folders : data.folders ? Object.values(data.folders as any) : [];
  return folders.map((f: any) => ({
    id: f.id || uuid(),
    name: f.name || 'Folder',
    images: Array.isArray(f.images) ? f.images : [],
  }));
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const db = getDb();
  const doc = await db.collection('galleries').doc(userId).get();
  const folders = doc.exists ? normalize(doc.data()) : [];
  return NextResponse.json({ folders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, action } = body;
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const db = getDb();
  const ref = db.collection('galleries').doc(userId);
  const snap = await ref.get();
  const currentFolders = snap.exists ? normalize(snap.data()) : [];

  if (action === 'add-folder') {
    const name = body.name || 'New folder';
    const newFolder: Folder = { id: uuid(), name, images: [] };
    const updated = [...currentFolders, newFolder];
    await ref.set({ folders: updated }, { merge: true });
    return NextResponse.json({ folders: updated });
  }

  if (action === 'add-image') {
    const folderId = body.folderId;
    const url = body.url;
    if (!folderId || !url) return NextResponse.json({ error: 'folderId and url required' }, { status: 400 });
    const caption = body.caption || '';
    const updated = currentFolders.map((f) => {
      if (f.id !== folderId) return f;
      const img: ImageItem = { id: uuid(), url, caption };
      return { ...f, images: [...(f.images || []), img] };
    });
    await ref.set({ folders: updated }, { merge: true });
    return NextResponse.json({ folders: updated });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
