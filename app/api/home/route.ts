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
  categories: [
    { title: 'Plumbing', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/dbbfe3d2-92cd-43e9-805e-e81e28e8cb2c.png' },
    { title: 'Electricity', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/b114de1c-670c-433b-8834-03f2db778da0.png' },
    { title: 'Housekeeping', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/c322eceb-27ab-4660-beb4-ae0f6e29f346.png' },
    { title: 'Windows & Blinds', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/6ae5f205-a0c0-4e81-8355-2389c3490037.png' },
    { title: 'Air Conditioning', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/13cf2973-b3a6-4a9d-b39d-66ed25e73dcc.png' },
    { title: 'Handyman & Assembly', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/e44291fa-1803-4475-9489-60d584dff23f.png' },
    { title: 'Washing Machine Repair', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/037d075f-a114-4f6e-8f10-e9dc03ae9cf9.png' },
    { title: 'Painting', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/af81ea6f-720a-4f62-8b5c-db9ea13b84ac.png' },
    { title: 'Babysitting', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/a9414d9d-f60e-4ede-8409-779160af2720.png' },
    { title: 'Gardening', image: 'https://ijenintechstorage.blob.core.windows.net/userpictures/b04e914b-1abd-4c47-93e4-fd389c4a6fec.png' },
  ],
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
  if (!doc.exists) {
    await docRef.set(defaultContent);
    return NextResponse.json(defaultContent);
  }
  const data = doc.data() || {};

  const normalizeArray = (value: unknown) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>);
    return [];
  };

  const payload = {
    ...defaultContent,
    ...data,
    sliderImages: normalizeArray(data.sliderImages ?? defaultContent.sliderImages),
    categories: normalizeArray(data.categories ?? defaultContent.categories),
    highlights: normalizeArray(data.highlights ?? defaultContent.highlights),
  };

  return NextResponse.json(payload);
}
