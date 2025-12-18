export type User = { id: string; name: string; role: string };

type MockDb = {
  users: User[];
};

// In-memory store for demos; replace with real database integration.
export const db: MockDb = {
  users: [
    { id: '1', name: 'Alex Johnson', role: 'Painter' },
    { id: '2', name: 'Sara Ali', role: 'Cleaner' },
  ],
};
