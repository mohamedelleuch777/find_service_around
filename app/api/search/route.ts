import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/firestore';

function toLower(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: NextRequest) {
  const q = toLower(req.nextUrl.searchParams.get('q'));
  if (!q || q.length < 3) {
    return NextResponse.json({ error: 'Query must be at least 3 characters' }, { status: 400 });
  }

  const latParam = req.nextUrl.searchParams.get('lat');
  const lonParam = req.nextUrl.searchParams.get('lon');
  const userLat = latParam ? Number(latParam) : null;
  const userLon = lonParam ? Number(lonParam) : null;

  const db = getDb();

  // Load meta jobs/categories to resolve names.
  const metaSnap = await db.collection('meta').doc('default').get();
  const meta = metaSnap.exists ? metaSnap.data() || {} : {};
  const categories = Array.isArray(meta.categories)
    ? meta.categories
    : meta.categories
      ? Object.values(meta.categories as Record<string, unknown>)
      : [];
  const jobs = Array.isArray(meta.jobs) ? meta.jobs : meta.jobs ? Object.values(meta.jobs as Record<string, unknown>) : [];
  const keywordList = Array.isArray(meta.keywords)
    ? meta.keywords
    : meta.keywords
      ? Object.values(meta.keywords as Record<string, any>)
      : [];

  const keywordNameById = new Map<string, string>();
  (keywordList as any[]).forEach((k) => {
    if (k?.id) keywordNameById.set(k.id, k.name || k.id);
  });

  const jobMap = new Map<string, any>();
  (jobs as any[]).forEach((j) => {
    if (j?.id) jobMap.set(j.id, j);
  });
  const categoryMap = new Map<string, any>();
  (categories as any[]).forEach((c) => {
    if (c?.id) categoryMap.set(c.id, c);
  });

  // Fetch provider profiles.
  const providersSnap = await db.collection('profiles').where('accountType', '==', 'provider').get();
  const providers: any[] = [];

  providersSnap.forEach((doc) => {
    const data = doc.data();
    providers.push({ id: doc.id, ...data });
  });

  const results = providers
    .map((p) => {
      const job = p.jobId ? jobMap.get(p.jobId) : null;
      const category = p.categoryId ? categoryMap.get(p.categoryId) : null;
      const keywords: string[] = Array.isArray(p.keywords) ? p.keywords : [];
      const keywordNames = keywords.map((id) => keywordNameById.get(id) || id).filter(Boolean);

      const searchable = [p.firstName, p.lastName, p.email, job?.name, category?.name, ...keywordNames]
        .filter(Boolean)
        .map((v) => toLower(v))
        .join(' ');
      if (!searchable.includes(q)) return null;

      const hasCoords = typeof p.latitude === 'number' && typeof p.longitude === 'number';
      const distance = hasCoords && userLat !== null && userLon !== null ? haversineDistance(userLat, userLon, p.latitude, p.longitude) : null;

      return {
        id: p.userId || p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        category: category?.name || '',
        job: job?.name || '',
        keywords: keywordNames,
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null,
        distance,
      };
    })
    .filter(Boolean) as any[];

  results.sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  return NextResponse.json({ results });
}
