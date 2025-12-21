import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/firestore';

type JobStatus = 'pending_provider_accept' | 'in_progress' | 'pending_provider' | 'pending_client' | 'closed' | 'disputed' | 'canceled' | 'declined';

export async function GET(req: NextRequest) {
  const db = getDb();
  const userId = req.nextUrl.searchParams.get('userId');
  const role = req.nextUrl.searchParams.get('role'); // client | provider | any
  const statusFilter = req.nextUrl.searchParams.get('status'); // optional comma separated

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  let query = db.collection('jobs');
  if (!role || role === 'any') {
    query = query.where('participants', 'array-contains', userId);
  } else if (role === 'client') {
    query = query.where('clientId', '==', userId);
  } else if (role === 'provider') {
    query = query.where('providerId', '==', userId);
  }

  const snap = await query.get();
  let jobs = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));

  if (statusFilter) {
    const wanted = statusFilter.split(',').map((s) => s.trim());
    jobs = jobs.filter((j) => wanted.includes(j.status));
  }

  jobs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { clientId, providerId, categoryId, jobId, title } = body;
  if (!clientId || !providerId) return NextResponse.json({ error: 'clientId and providerId are required' }, { status: 400 });

  // ensure provider is available to accept new jobs
  const providerDoc = await db.collection('profiles').doc(providerId).get();
  const provider = providerDoc.exists ? providerDoc.data() || {} : {};
  if (provider.providerWorkStatus && provider.providerWorkStatus !== 'available') {
    return NextResponse.json({ error: 'Provider is not available right now' }, { status: 400 });
  }

  const payload = {
    clientId,
    providerId,
    categoryId: categoryId || '',
    jobId: jobId || '',
    title: title || '',
    status: 'pending_provider_accept' as JobStatus,
    participants: [clientId, providerId],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await db.collection('jobs').add(payload);
  return NextResponse.json({ job: { id: docRef.id, ...payload } });
}
