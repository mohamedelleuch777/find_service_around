import { NextRequest, NextResponse } from 'next/server';
import type { Firestore } from 'firebase-admin/firestore';
import { getDb } from '../../../../lib/firestore';

const ALLOWED_REASONS = ['completed', 'not_satisfied', 'no_show', 'canceled', 'other', 'price_disagreement', 'reschedule'];

function cleanRating(value: any) {
  if (value === undefined || value === null || value === '') return null;
  const num = Math.max(0, Math.min(5, Number(value)));
  return Math.round(num * 10) / 10;
}

async function applyRating(db: Firestore, targetId: string, fromId: string, jobId: string, rating: number | null, comment: string) {
  if (rating === null && !comment) return;
  const profileRef = db.collection('profiles').doc(targetId);
  const commentRef = db.collection('comments').doc();

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(profileRef);
    const existing = snap.exists ? snap.data() || {} : {};
    const ratingSum = (existing.ratingSum || 0) + (rating || 0);
    const ratingCount = (existing.ratingCount || 0) + (rating !== null ? 1 : 0);
    const reviewCount = (existing.reviewCount || 0) + (comment ? 1 : 0);
    tx.set(
      profileRef,
      {
        ratingSum,
        ratingCount,
        reviewCount,
        ratingAvg: ratingCount ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    if (comment || rating !== null) {
      tx.set(commentRef, {
        id: commentRef.id,
        targetUserId: targetId,
        fromUserId: fromId,
        jobId,
        rating,
        comment,
        createdAt: Date.now(),
      });
    }
  });
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { jobId, userId, action, reason, comment, rating } = body;
  if (!jobId || !userId || !action) return NextResponse.json({ error: 'jobId, userId and action are required' }, { status: 400 });

  const docRef = db.collection('jobs').doc(jobId);
  const snap = await docRef.get();
  if (!snap.exists) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  const job = snap.data() as any;

  const endReason = ALLOWED_REASONS.includes(reason) ? reason : 'other';
  const ratingValue = cleanRating(rating);

  if (job.status === 'pending_provider' && userId === job.providerId) {
    if (action === 'accept') {
      const closure = {
        reason: endReason || job?.endRequest?.reason || 'completed',
        clientRating: job?.endRequest?.rating ?? null,
        clientComment: job?.endRequest?.comment ?? '',
        providerRating: ratingValue,
        providerComment: comment || '',
        closedAt: Date.now(),
      };
      await docRef.set(
        {
          status: 'closed',
          closure,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      if (job.endRequest?.rating !== undefined && job.endRequest?.rating !== null) {
        await applyRating(db, job.providerId, job.clientId, jobId, job.endRequest.rating, job.endRequest.comment || '');
      }
      if (ratingValue !== null || comment) {
        await applyRating(db, job.clientId, job.providerId, jobId, ratingValue, comment || '');
      }
      return NextResponse.json({ job: { id: jobId, ...job, status: 'closed', closure } });
    }

    if (action === 'reject') {
      const counter = {
        by: 'provider',
        reason: endReason,
        comment: comment || '',
        rating: ratingValue,
        at: Date.now(),
      };
      await docRef.set(
        {
          counterRequest: counter,
          status: 'pending_client',
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      return NextResponse.json({ job: { id: jobId, ...job, counterRequest: counter, status: 'pending_client' } });
    }
  }

  if (job.status === 'pending_client' && userId === job.clientId) {
    if (action === 'accept') {
      const closure = {
        reason: endReason || job?.endRequest?.reason || job?.counterRequest?.reason || 'completed',
        clientRating: job?.endRequest?.rating ?? null,
        clientComment: job?.endRequest?.comment ?? '',
        providerRating: ratingValue ?? job?.counterRequest?.rating ?? null,
        providerComment: comment || job?.counterRequest?.comment || '',
        closedAt: Date.now(),
      };
      await docRef.set(
        {
          status: 'closed',
          closure,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      if (job.endRequest?.rating !== undefined && job.endRequest?.rating !== null) {
        await applyRating(db, job.providerId, job.clientId, jobId, job.endRequest.rating, job.endRequest.comment || '');
      }
      const providerRatingFinal = ratingValue ?? job?.counterRequest?.rating ?? null;
      const providerCommentFinal = comment || job?.counterRequest?.comment || '';
      if (providerRatingFinal !== null || providerCommentFinal) {
        await applyRating(db, job.clientId, job.providerId, jobId, providerRatingFinal, providerCommentFinal);
      }
      return NextResponse.json({ job: { id: jobId, ...job, status: 'closed', closure } });
    }
    if (action === 'escalate') {
      await docRef.set(
        {
          status: 'disputed',
          dispute: {
            by: 'client',
            reason: endReason,
            comment: comment || '',
            at: Date.now(),
          },
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      return NextResponse.json({ job: { id: jobId, ...job, status: 'disputed' } });
    }
  }

  return NextResponse.json({ error: 'Invalid state or permission' }, { status: 400 });
}
