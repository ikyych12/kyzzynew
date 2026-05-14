import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './errors';

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  recoveryKey?: string;
  role: 'OWNER' | 'ADMIN' | 'RESELLER' | 'MEMBER';
  tier: 'Lifetime' | 'Premium' | 'Free';
  expiry: string | null;
  isBanned?: boolean;
  bannedReason?: string;
  createdAt?: any;
}

export interface PremiumKey {
  id: string;
  key: string;
  durationDays: number;
  targetRole: 'ADMIN' | 'RESELLER' | 'MEMBER';
  status: 'unused' | 'used';
  usedBy?: string;
  targetUser?: string;
  createdAt: any;
}

export const storage = {
  getUser: async (username: string): Promise<UserProfile | undefined> => {
    try {
      const uname = username.toLowerCase().trim();
      if (!uname) return undefined;
      
      // Try direct ID lookup first (Publicly allowed via rules 'allow get: if true')
      const docRef = doc(db, 'users', uname);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { ...docSnap.data(), id: docSnap.id } as UserProfile;
        }
      } catch (e) {
        console.warn(`Direct lookup for ${uname} failed, restricted or missing.`);
      }
      
      // Try recovery key lookup ONLY if it looks like a recovery key
      if (uname.toUpperCase().startsWith('REC-')) {
        try {
          const q = query(collection(db, 'users'), where('recoveryKey', '==', uname.toUpperCase()));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as UserProfile;
          }
        } catch (e) {
          console.warn('Recovery key query failed. Permission restricted for non-authenticated subjects.');
        }
      }

      return undefined;
    } catch (error) {
      // Don't throw for simple lookup failures during authentication phase
      console.error('Storage Lookup error:', error);
      return undefined;
    }
  },

  createUser: async (username: string, userData: Omit<UserProfile, 'id' | 'username' | 'recoveryKey'>) => {
    try {
      const uname_lower = username.toLowerCase().trim();
      const docRef = doc(db, 'users', uname_lower);
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        throw new Error('Username sudah terdaftar');
      }
      
      const recoveryKey = `REC-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const newUser = {
        ...userData,
        username: uname_lower,
        recoveryKey,
        createdAt: serverTimestamp()
      };
      await setDoc(docRef, newUser);
      
      // Create recovery mapping for secure lookups
      await setDoc(doc(db, 'recoveryKeys', recoveryKey), {
        username: uname_lower,
        createdAt: serverTimestamp()
      });

      return { ...newUser, id: uname_lower } as UserProfile;
    } catch (error: any) {
      if (error.message === 'Username sudah terdaftar') throw error;
      handleFirestoreError(error, OperationType.WRITE, `users/${username}`, auth);
    }
  },

  updateUser: async (username: string, updates: Partial<UserProfile>) => {
    try {
      const docRef = doc(db, 'users', username.toLowerCase());
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${username}`, auth);
    }
  },

  loginWithKey: async (keyString: string, currentIdentity?: string): Promise<UserProfile> => {
    try {
      const kStr = keyString.trim().toUpperCase();
      if (!kStr) throw new Error('Key tidak boleh kosong');

      // 0. Try recovery mapping first (No list query needed)
      if (kStr.startsWith('REC-')) {
        const recSnap = await getDoc(doc(db, 'recoveryKeys', kStr));
        if (recSnap.exists()) {
          const { username } = recSnap.data() as { username: string };
          const user = await storage.getUser(username);
          if (user) {
             if (user.isBanned) throw new Error(`AKUN DIBANNED: ${user.bannedReason || 'Tanpa alasan'}`);
             return user;
          }
        }
      }

      // 1. Try direct lookup (Key as ID) - This is preferred and bypasses list rules
      let keyDoc: any = null;
      let keyData: PremiumKey | null = null;
      
      const directRef = doc(db, 'premiumKeys', kStr);
      const directSnap = await getDoc(directRef);
      
      if (directSnap.exists()) {
        keyDoc = directSnap;
        keyData = directSnap.data() as PremiumKey;
      } else {
        // 2. Fallback to query (Support old keys) - Requires 'list' permissions
        const q = query(collection(db, 'premiumKeys'), where('key', '==', kStr));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          keyDoc = snapshot.docs[0];
          keyData = keyDoc.data() as PremiumKey;
        }
      }
      
      if (!keyData) {
        throw new Error('Key tidak valid atau salah');
      }

      if (keyData.status === 'used') {
        if (!keyData.usedBy) throw new Error('Key sudah digunakan oleh subjek tidak dikenal');
        const user = await storage.getUser(keyData.usedBy);
        if (!user) throw new Error('User pemilik key tidak ditemukan');
        return user;
      }

      const normalizedTarget = keyData.targetUser ? keyData.targetUser.toLowerCase().trim() : null;
      let identity = currentIdentity || normalizedTarget || `user_${Math.random().toString(36).substring(2, 8)}`;
      let user = await storage.getUser(identity);

      if (!user) {
        user = await storage.createUser(identity, {
          password: '1',
          role: keyData.targetRole,
          tier: 'Premium',
          expiry: null
        });
      }

      const durationMs = keyData.durationDays * 24 * 60 * 60 * 1000;
      let newExpiry: string | null = null;

      const now = new Date();
      const currentExpiry = user.expiry ? new Date(user.expiry) : now;
      const baseDate = currentExpiry > now ? currentExpiry : now;
      newExpiry = new Date(baseDate.getTime() + durationMs).toISOString();

      const updates: any = {
        role: keyData.targetRole,
        tier: 'Premium',
        expiry: newExpiry
      };
      
      await storage.updateUser(identity, updates);

      await updateDoc(doc(db, 'premiumKeys', keyDoc.id), {
        status: 'used',
        usedBy: identity
      });

      const updatedUser = await storage.getUser(identity);
      return updatedUser!;
    } catch (error: any) {
      if (error.message.includes('Key tidak valid')) throw error;
      console.error('LoginWithKey Error:', error);
      throw error; // Rethrow to show to user
    }
  }
};
