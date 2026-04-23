export interface UserProfile {
  id: string;
  username: string;
  role: 'OWNER' | 'ADMIN' | 'RESELLER' | 'MEMBER';
  tier: 'Lifetime' | 'Premium' | 'Free';
  expiry: string | null; // ISO string
  createdAt: string;
}

export interface PremiumKey {
  id: string;
  key: string;
  durationDays: number;
  status: 'unused' | 'used';
  usedBy?: string;
  generatedBy: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  USERS: 'goldword_users',
  KEYS: 'goldword_keys'
};

export const storage = {
  // --- USERS ---
  getUsers: (): UserProfile[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers: (users: UserProfile[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getUser: (username: string): UserProfile | undefined => {
    return storage.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  updateUser: (username: string, updates: Partial<UserProfile>) => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      storage.saveUsers(users);
      return users[index];
    }
  },

  deleteUser: (username: string) => {
    const users = storage.getUsers().filter(u => u.username.toLowerCase() !== username.toLowerCase());
    storage.saveUsers(users);
  },

  // --- KEYS ---
  getKeys: (): PremiumKey[] => {
    const data = localStorage.getItem(STORAGE_KEYS.KEYS);
    return data ? JSON.parse(data) : [];
  },

  saveKeys: (keys: PremiumKey[]) => {
    localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(keys));
  },

  addKey: (keyData: Omit<PremiumKey, 'id'>) => {
    const keys = storage.getKeys();
    const newKey = { ...keyData, id: Math.random().toString(36).substring(2, 11) };
    keys.push(newKey);
    storage.saveKeys(keys);
    return newKey;
  },

  updateKey: (key: string, updates: Partial<PremiumKey>) => {
    const keys = storage.getKeys();
    const index = keys.findIndex(k => k.key === key);
    if (index !== -1) {
      keys[index] = { ...keys[index], ...updates };
      storage.saveKeys(keys);
      return keys[index];
    }
  },

  // --- INITIALIZATION ---
  init: () => {
    // Bootstrap OWNER if not exists
    const users = storage.getUsers();
    if (!users.find(u => u.username === 'iky')) {
      users.push({
        id: 'iky_root',
        username: 'iky',
        role: 'OWNER',
        tier: 'Lifetime',
        expiry: null,
        createdAt: new Date().toISOString()
      });
      storage.saveUsers(users);
    }
  }
};
