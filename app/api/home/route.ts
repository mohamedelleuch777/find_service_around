import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/firestore';

const defaultContent = {
  sliderImages: [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478121-114b1e1d1a17?auto=format&fit=crop&w=1200&q=80',
  ],
  hero: {
    title: 'Book reliable pros for any job, in minutes.',
    subtitle: 'Trusted on-demand home services',
    body: 'Compare vetted providers, get instant confirmations, and track your booking from start to finish.',
    leftTitle: 'On-demand home services',
    leftBody:
      'Plumbers, electricians, cleaners, HVAC, handymen, painters, babysitters, and more—book trusted pros in minutes.',
  },
  search: {
    placeholder: 'What do you need help with?',
    buttonText: 'Find services',
  },
  highlights: [
    { label: 'Avg. arrival time', value: '35 min' },
    { label: 'Verified providers', value: '1,200+' },
    { label: 'Cities covered', value: '40+' },
  ],
};

export async function GET() {
  const db = getDb();
  const docRef = db.collection('homeContent').doc('default');
  const doc = await docRef.get();
  const data = doc.data() || {};

  const normalizeArray = (value: unknown) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>);
    return [];
  };

  const metaRef = db.collection('meta').doc('default');
  const metaSnap = await metaRef.get();
  const metaData = metaSnap.exists ? metaSnap.data() || {} : {};
  const metaCategories = normalizeArray(metaData.categories);
  const metaJobs = normalizeArray(metaData.jobs);

  const payload = {
    ...defaultContent,
    ...data,
    sliderImages: normalizeArray(data.sliderImages ?? defaultContent.sliderImages),
    categories: metaCategories,
    jobs: metaJobs,
    highlights: normalizeArray(data.highlights ?? defaultContent.highlights),
  };

  return NextResponse.json(payload);
}
