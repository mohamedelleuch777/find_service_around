import { NextResponse } from 'next/server';

const mockProducts = [
  { id: 'a', name: 'Home cleaning', price: 80 },
  { id: 'b', name: 'AC maintenance', price: 120 },
];

export async function GET() {
  return NextResponse.json({ products: mockProducts });
}

export async function POST(request: Request) {
  const body = await request.json();
  const created = { id: String(Date.now()), ...body };
  return NextResponse.json({ product: created }, { status: 201 });
}
