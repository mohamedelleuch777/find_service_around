'use server';

import { db } from '../../lib/db';

export async function createUserAction(formData: FormData) {
  const name = formData.get('name');
  const role = formData.get('role');

  if (!name || !role) {
    throw new Error('Name and role are required');
  }

  const newUser = { id: String(Date.now()), name: String(name), role: String(role) };
  db.users.push(newUser);
  return newUser;
}
