import { NextResponse } from 'next/server';

const mockUsers = [
  { id: '1', name: 'Jane Doe', role: 'Plumber' },
  { id: '2', name: 'John Smith', role: 'Electrician' },
];

export async function GET() {
  return NextResponse.json({ users: mockUsers });
}

export async function POST(request: Request) {
  const body = await request.json();
  const created = { id: String(Date.now()), ...body };
  return NextResponse.json({ user: created }, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  return NextResponse.json({ updated: body });
}

export async function DELETE() {
  return NextResponse.json({ message: 'User removed' });
}
