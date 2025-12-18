import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/firestore';

const defaultMeta = {
  categories: [
    { id: 'plumbing', name: 'Plumbing', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/dbbfe3d2-92cd-43e9-805e-e81e28e8cb2c.png' },
    { id: 'electricity', name: 'Electricity', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/b114de1c-670c-433b-8834-03f2db778da0.png' },
    { id: 'housekeeping', name: 'Housekeeping', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/c322eceb-27ab-4660-beb4-ae0f6e29f346.png' },
    { id: 'windows-blinds', name: 'Windows & Blinds', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/6ae5f205-a0c0-4e81-8355-2389c3490037.png' },
    { id: 'air-conditioning', name: 'Air Conditioning', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/13cf2973-b3a6-4a9d-b39d-66ed25e73dcc.png' },
    { id: 'handyman', name: 'Handyman & Assembly', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/e44291fa-1803-4475-9489-60d584dff23f.png' },
    { id: 'washing-machine', name: 'Washing Machine Repair', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/037d075f-a114-4f6e-8f10-e9dc03ae9cf9.png' },
    { id: 'painting', name: 'Painting', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/af81ea6f-720a-4f62-8b5c-db9ea13b84ac.png' },
    { id: 'babysitting', name: 'Babysitting', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/a9414d9d-f60e-4ede-8409-779160af2720.png' },
    { id: 'gardening', name: 'Gardening', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/b04e914b-1abd-4c47-93e4-fd389c4a6fec.png' },
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
  const categories = normalize(data.categories ?? defaultMeta.categories).map((c: any) => {
    const fallback = defaultMeta.categories.find((d) => d.id === c?.id);
    return { ...fallback, ...c };
  });
  return NextResponse.json({
    categories,
    jobs: normalize(data.jobs ?? defaultMeta.jobs),
    keywords,
  });
}
