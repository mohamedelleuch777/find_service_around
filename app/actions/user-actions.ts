'use server';

import { getDb } from '../../lib/firestore';

export async function createUserAction(formData: FormData) {
  const name = formData.get('name');
  const role = formData.get('role');

  if (!name || !role) {
    throw new Error('Name and role are required');
  }

  const db = getDb();
  const docRef = db.collection('users').doc();
  const newUser = { id: docRef.id, name: String(name), role: String(role) };
  await docRef.set(newUser);
  return newUser;
}
