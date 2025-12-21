import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/firestore';

type Action = 'accept' | 'refuse';

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { jobId, userId, action } = body as { jobId?: string; userId?: string; action?: Action };

  if (!jobId || !userId || !action) return NextResponse.json({ error: 'jobId, userId and action are required' }, { status: 400 });
  if (action !== 'accept' && action !== 'refuse') return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  const docRef = db.collection('jobs').doc(jobId);
  const snap = await docRef.get();
  if (!snap.exists) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  const job = snap.data() as any;

  if (job.providerId !== userId) return NextResponse.json({ error: 'Only the hired provider can act on this job' }, { status: 403 });
  if (job.status !== 'pending_provider_accept') return NextResponse.json({ error: 'Job is not awaiting acceptance' }, { status: 400 });

  if (action === 'accept') {
    const acceptance = {
      by: 'provider',
      at: Date.now(),
    };
    await docRef.set(
      {
        status: 'in_progress',
        acceptance,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    return NextResponse.json({ job: { id: jobId, ...job, status: 'in_progress', acceptance } });
  }

  const decline = {
    by: 'provider',
    at: Date.now(),
  };
  await docRef.set(
    {
      status: 'declined',
      decline,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
  return NextResponse.json({ job: { id: jobId, ...job, status: 'declined', decline } });
}
