import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/firestore';

const defaultMeta = {
  categories: [
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'electricity', name: 'Electricity' },
    { id: 'housekeeping', name: 'Housekeeping' },
    { id: 'windows-blinds', name: 'Windows & Blinds' },
    { id: 'air-conditioning', name: 'Air Conditioning' },
    { id: 'handyman', name: 'Handyman & Assembly' },
    { id: 'washing-machine', name: 'Washing Machine Repair' },
    { id: 'painting', name: 'Painting' },
    { id: 'babysitting', name: 'Babysitting' },
    { id: 'gardening', name: 'Gardening' },
  ],
  jobs: [
    { id: 'leak-repair', name: 'Leak repair', categoryId: 'plumbing' },
    { id: 'pipe-installation', name: 'Pipe installation', categoryId: 'plumbing' },
    { id: 'wiring', name: 'Wiring & outlets', categoryId: 'electricity' },
    { id: 'panel-upgrade', name: 'Panel upgrade', categoryId: 'electricity' },
    { id: 'deep-clean', name: 'Deep cleaning', categoryId: 'housekeeping' },
    { id: 'window-repair', name: 'Window repair', categoryId: 'windows-blinds' },
    { id: 'blind-install', name: 'Blind installation', categoryId: 'windows-blinds' },
    { id: 'hvac-service', name: 'HVAC servicing', categoryId: 'air-conditioning' },
    { id: 'furniture-assembly', name: 'Furniture assembly', categoryId: 'handyman' },
    { id: 'appliance-repair', name: 'Appliance repair', categoryId: 'washing-machine' },
    { id: 'interior-paint', name: 'Interior painting', categoryId: 'painting' },
    { id: 'child-care', name: 'Child care', categoryId: 'babysitting' },
    { id: 'lawn-care', name: 'Lawn care', categoryId: 'gardening' },
  ],
  keywords: [
    { id: 'emergency', name: 'Emergency', approved: true },
    { id: 'same-day', name: 'Same-day', approved: true },
    { id: 'eco-friendly', name: 'Eco-friendly', approved: true },
    { id: 'licensed', name: 'Licensed', approved: true },
    { id: 'insured', name: 'Insured', approved: true },
  ],
};

export async function GET() {
  const db = getDb();
  const docRef = db.collection('meta').doc('default');
  const snap = await docRef.get();
  if (!snap.exists) {
    await docRef.set(defaultMeta);
    return NextResponse.json({ ...defaultMeta, keywords: defaultMeta.keywords.filter((k) => k.approved) });
  }
  const data = snap.data() || {};
  const normalize = (value: unknown) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>);
    return [];
  };
  const keywords = normalize(data.keywords ?? defaultMeta.keywords).filter((k: any) => k?.approved);
  return NextResponse.json({
    categories: normalize(data.categories ?? defaultMeta.categories),
    jobs: normalize(data.jobs ?? defaultMeta.jobs),
    keywords,
  });
}
