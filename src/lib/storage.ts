import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError } from './errors';

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  recoveryKey?: string;
  role: 'OWNER' | 'ADMIN' | 'RESELLER' | 'MEMBER';
  tier: 'Lifetime' | 'Premium' | 'Free';
  expiry: string | null;
  createdAt: any;
}

export interface PremiumKey {
  id: string;
  key: string;
  durationDays: number;
  status: 'unused' | 'used';
  usedBy?: string;
  targetRole: 'ADMIN' | 'RESELLER' | 'MEMBER';
  targetUser?: string;
  generatedBy: string;
  createdAt: any;
}

export const storage = {
  // --- USERS ---
  getUsers: async (): Promise<UserProfile[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserProfile));
    } catch (error) {
      throw handleFirestoreError(error, 'list', 'users');
    }
  },

  getUser: async (username: string): Promise<UserProfile | undefined> => {
    try {
      const uname = username.toLowerCase().trim();
      
      // Try direct ID lookup first
      const docRef = doc(db, 'users', uname);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as UserProfile;
      }
      
      // Try recovery key lookup if not found by username
      if (username.startsWith('REC-')) {
        const q = query(collection(db, 'users'), where('recoveryKey', '==', username.toUpperCase()));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as UserProfile;
        }
      }

      return undefined;
    } catch (error) {
      throw handleFirestoreError(error, 'get', `users/${username}`);
    }
  },

  loginWithKey: async (keyString: string, currentIdentity?: string): Promise<UserProfile> => {
    try {
      const q = query(collection(db, 'premiumKeys'), where('key', '==', keyString.trim().toUpperCase()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Key tidak valid atau tidak ditemukan');
      }

      const keyDoc = snapshot.docs[0];
      const keyData = keyDoc.data() as PremiumKey;

      if (keyData.status === 'used') {
        if (!keyData.usedBy) throw new Error('Key sudah digunakan oleh subjek tidak dikenal');
        const user = await storage.getUser(keyData.usedBy);
        if (!user) throw new Error('User pemilik key tidak ditemukan');
        return user;
      }

      // --- KEY IS UNUSED: CONSUME IT ---
      
      // Order of identity preference:
      // 1. Explicitly passed currentIdentity (e.g. from Profile page)
      // 2. Key's hard-coded targetUser (e.g. key specifically for "iky")
      // 3. New random identity
      const normalizedTarget = keyData.targetUser ? keyData.targetUser.toLowerCase().trim() : null;
      let identity = currentIdentity || normalizedTarget || `user_${Math.random().toString(36).substring(2, 8)}`;
      let user = await storage.getUser(identity);

      if (!user) {
        // Auto-provision new identity if it doesn't exist
        user = await storage.createUser(identity, {
          password: '1',
          role: keyData.targetRole,
          tier: 'Premium',
          expiry: null
        });
      }

      // Calculate and apply expiry
      const durationMs = keyData.durationDays * 24 * 60 * 60 * 1000;
      let newExpiry: string | null = null;

      if (user.tier !== 'Lifetime') {
        const baseDate = user.expiry ? new Date(user.expiry) : new Date();
        const effectiveBase = baseDate < new Date() ? new Date() : baseDate;
        newExpiry = new Date(effectiveBase.getTime() + durationMs).toISOString();
      }

      const updates: any = {
        role: keyData.targetRole,
        tier: 'Premium'
      };
      
      if (newExpiry) updates.expiry = newExpiry;

      await storage.updateUser(identity, updates);

      // Finalize key consumption
      await storage.updateKey(keyDoc.id, {
        status: 'used',
        usedBy: identity
      });

      const updatedUser = await storage.getUser(identity);
      return updatedUser!;
    } catch (error: any) {
      if (error.message.includes('Key tidak valid')) throw error;
      throw handleFirestoreError(error, 'write', 'key-login');
    }
  },

  createUser: async (username: string, userData: Omit<UserProfile, 'id' | 'username' | 'recoveryKey'>) => {
    try {
      const docRef = doc(db, 'users', username.toLowerCase());
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        throw new Error('Username sudah terdaftar');
      }
      
      // Auto-generate recovery key
      const recoveryKey = `REC-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const newUser = {
        ...userData,
        username: username.toLowerCase(),
        recoveryKey,
        createdAt: serverTimestamp()
      };
      await setDoc(docRef, newUser);
      return { ...newUser, id: username.toLowerCase() };
    } catch (error) {
      throw handleFirestoreError(error, 'create', `users/${username}`);
    }
  },

  updateUser: async (username: string, updates: Partial<UserProfile>) => {
    try {
      const docRef = doc(db, 'users', username.toLowerCase());
      await updateDoc(docRef, updates);
    } catch (error) {
      throw handleFirestoreError(error, 'update', `users/${username}`);
    }
  },

  deleteUser: async (username: string) => {
    try {
      const docRef = doc(db, 'users', username.toLowerCase());
      await deleteDoc(docRef);
    } catch (error) {
      throw handleFirestoreError(error, 'delete', `users/${username}`);
    }
  },

  // --- KEYS ---
  getKeys: async (): Promise<PremiumKey[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'premiumKeys'));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PremiumKey));
    } catch (error) {
      throw handleFirestoreError(error, 'list', 'premiumKeys');
    }
  },

  addKey: async (keyData: Omit<PremiumKey, 'id'>) => {
    try {
      const id = Math.random().toString(36).substring(2, 11);
      const docRef = doc(db, 'premiumKeys', id);
      const newKey = {
        ...keyData,
        id,
        createdAt: serverTimestamp()
      };
      await setDoc(docRef, newKey);
      return newKey;
    } catch (error) {
      throw handleFirestoreError(error, 'create', 'premiumKeys');
    }
  },

  updateKey: async (id: string, updates: Partial<PremiumKey>) => {
    try {
      const docRef = doc(db, 'premiumKeys', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      throw handleFirestoreError(error, 'update', `premiumKeys/${id}`);
    }
  },

  // --- INITIALIZATION ---
  init: async () => {
    try {
      // Bootstrap root owners if they don't exist
      const roots = ['iky', 'kyzzy'];
      for (const root of roots) {
        const docRef = doc(db, 'users', root);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          await setDoc(docRef, {
            username: root,
            password: '1',
            role: 'OWNER',
            tier: 'Lifetime',
            expiry: null,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('System initialization failed:', error);
    }
  }
};
