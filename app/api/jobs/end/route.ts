import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/firestore';

const ALLOWED_REASONS = ['completed', 'not_satisfied', 'no_show', 'canceled', 'other', 'price_disagreement', 'reschedule'];

function cleanRating(value: any) {
  if (value === undefined || value === null || value === '') return null;
  const num = Math.max(0, Math.min(5, Number(value)));
  return Math.round(num * 10) / 10;
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { jobId, userId, reason, comment, rating } = body;
  if (!jobId || !userId) return NextResponse.json({ error: 'jobId and userId are required' }, { status: 400 });

  const snap = await db.collection('jobs').doc(jobId).get();
  if (!snap.exists) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  const job = snap.data() as any;

  const role = userId === job.clientId ? 'client' : userId === job.providerId ? 'provider' : null;
  if (!role) return NextResponse.json({ error: 'Only job participants can end the job' }, { status: 403 });
  if (job.status !== 'in_progress') return NextResponse.json({ error: 'Job not in progress' }, { status: 400 });

  const endReason = ALLOWED_REASONS.includes(reason) ? reason : 'other';
  const endPayload = {
    by: role,
    reason: endReason,
    comment: comment || '',
    rating: cleanRating(rating),
    at: Date.now(),
  };

  const nextStatus = role === 'client' ? 'pending_provider' : 'pending_client';

  await db
    .collection('jobs')
    .doc(jobId)
    .set(
      {
        endRequest: endPayload,
        status: nextStatus,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

  return NextResponse.json({ job: { id: jobId, ...job, endRequest: endPayload, status: nextStatus } });
}
