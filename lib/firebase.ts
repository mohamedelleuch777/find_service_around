const firebaseConfig = {
  apiKey: 'AIzaSyDh_9tlFgFaN5GOStUv2SYYT-oxwSooSbM',
  authDomain: 'find-service-around-dc40f.firebaseapp.com',
  projectId: 'find-service-around-dc40f',
  storageBucket: 'find-service-around-dc40f.firebasestorage.app',
  messagingSenderId: '339819633094',
  appId: '1:339819633094:web:3e7b56ff40fc18977a3ac7',
  measurementId: 'G-YR9JXCF1XN',
};

const IDENTITY_BASE = 'https://identitytoolkit.googleapis.com/v1';

export function getFirebaseApiKey() {
  return firebaseConfig.apiKey;
}

export function firebaseIdentityRequest(path: string, payload: unknown) {
  const apiKey = getFirebaseApiKey();
  if (!apiKey) {
    throw new Error('Firebase API key missing');
  }

  const url = `${IDENTITY_BASE}/${path}?key=${apiKey}`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export type FirebaseAuthResponse<T = unknown> = {
  error?: { message?: string };
} & T;
