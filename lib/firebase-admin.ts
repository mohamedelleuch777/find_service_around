import { getApps, initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin using a service account (preferred) or ADC with explicit projectId.
function initAdmin() {
  if (getApps().length) return getApps()[0];

  const saBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (saBase64 || saJson) {
    const serviceAccount = JSON.parse(
      saBase64 ? Buffer.from(saBase64, 'base64').toString('utf8') : (saJson as string),
    );
    return initializeApp({ credential: cert(serviceAccount) });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT || projectId) {
    return initializeApp({
      credential: applicationDefault(),
      projectId,
    });
  }

  throw new Error(
    'Firebase Admin credentials missing. Provide FIREBASE_SERVICE_ACCOUNT(_BASE64) or set GOOGLE_APPLICATION_CREDENTIALS.',
  );
}

export function getAuthAdmin() {
  const app = initAdmin();
  return getAuth(app);
}
