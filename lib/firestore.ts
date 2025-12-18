import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin';

export function getDb() {
  const app = getAdminApp();
  return getFirestore(app);
}
