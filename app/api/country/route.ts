import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/firestore';

export async function GET() {
  const db = getDb();
  const snap = await db.collection('country').get();
  const items = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.Name ?? data.Value ?? doc.id,
      value: data.Value ?? doc.id,
      delegations: Array.isArray(data.Delegations)
        ? data.Delegations.map((d: any) => ({
            name: d.Name ?? d.Value ?? '',
            value: d.Value ?? '',
            postalCode: d.PostalCode ?? '',
            latitude: typeof d.Latitude === 'number' ? d.Latitude : null,
            longitude: typeof d.Longitude === 'number' ? d.Longitude : null,
          }))
        : [],
    };
  });
  return NextResponse.json({ countries: items });
}
