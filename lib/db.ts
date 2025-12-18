export type User = { id: string; name: string; role: string };

export type Profile = {
  userId: string;
  accountType: 'user' | 'provider';
  firstName: string;
  lastName: string;
  age?: number;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
  photoDataUrl?: string;
};

type MockDb = {
  users: User[];
  profiles: Profile[];
};

// In-memory store for demos; replace with real database integration.
export const db: MockDb = {
  users: [
    { id: '1', name: 'Alex Johnson', role: 'Painter' },
    { id: '2', name: 'Sara Ali', role: 'Cleaner' },
  ],
  profiles: [],
};
