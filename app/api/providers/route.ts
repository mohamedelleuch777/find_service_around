import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/firestore';

export async function GET() {
  const db = getDb();

  const metaSnap = await db.collection('meta').doc('default').get();
  const meta = metaSnap.exists ? metaSnap.data() || {} : {};
  const normalize = (value: unknown) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>);
    return [];
  };

  const categories = normalize(meta.categories);
  const jobs = normalize(meta.jobs);
  const keywords = normalize(meta.keywords);

  const categoryMap = new Map<string, any>();
  categories.forEach((c: any) => {
    if (c?.id) categoryMap.set(c.id, c);
  });
  const jobMap = new Map<string, any>();
  jobs.forEach((j: any) => {
    if (j?.id) jobMap.set(j.id, j);
  });
  const keywordNameById = new Map<string, string>();
  keywords.forEach((k: any) => {
    if (k?.id) keywordNameById.set(k.id, k.name || k.id);
  });

  const providersSnap = await db.collection('profiles').where('accountType', '==', 'provider').get();
  const providers: any[] = [];

  providersSnap.forEach((doc) => {
    const data = doc.data();
    providers.push({ id: doc.id, ...data });
  });

  const results = providers.map((p) => {
    const job = p.jobId ? jobMap.get(p.jobId) : null;
    const category = p.categoryId ? categoryMap.get(p.categoryId) : null;
    const keywordNames = Array.isArray(p.keywords) ? p.keywords.map((id: string) => keywordNameById.get(id) || id) : [];
    return {
      id: p.userId || p.id,
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      email: p.email || '',
      categoryId: p.categoryId || '',
      jobId: p.jobId || '',
      categoryName: category?.name || '',
      jobName: job?.name || '',
      keywords: keywordNames,
      latitude: typeof p.latitude === 'number' ? p.latitude : null,
      longitude: typeof p.longitude === 'number' ? p.longitude : null,
      city: p.city || '',
      province: p.province || '',
      country: p.country || '',
      address: p.address || '',
      postalCode: p.postalCode || '',
      photoDataUrl: p.photoDataUrl || '',
      ratingAvg: typeof p.ratingAvg === 'number' ? p.ratingAvg : p.ratingCount && p.ratingSum ? Math.round((p.ratingSum / p.ratingCount) * 10) / 10 : 0,
      ratingCount: p.ratingCount || 0,
      reviewCount: p.reviewCount || 0,
    };
  });

  return NextResponse.json({ providers: results, categories, jobs });
}
