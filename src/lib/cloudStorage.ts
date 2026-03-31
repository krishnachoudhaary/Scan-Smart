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
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { PantryItem, UserProfile } from '../types';

const PANTRY_COLLECTION = 'user_pantry';
const PROFILE_COLLECTION = 'user_profiles';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const cloudStorage = {
  subscribeToPantry: (callback: (items: PantryItem[]) => void) => {
    if (!auth.currentUser) return () => {};
    
    const q = query(
      collection(db, PANTRY_COLLECTION),
      where('uid', '==', auth.currentUser.uid),
      orderBy('addedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, PANTRY_COLLECTION);
    });
  },

  savePantryItem: async (item: Omit<PantryItem, 'id' | 'addedAt'>) => {
    if (!auth.currentUser) return;
    const path = PANTRY_COLLECTION;
    try {
      const docRef = doc(collection(db, path));
      await setDoc(docRef, {
        ...item,
        uid: auth.currentUser.uid,
        addedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  removePantryItem: async (id: string) => {
    const path = `${PANTRY_COLLECTION}/${id}`;
    try {
      await deleteDoc(doc(db, PANTRY_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  getProfile: async (uid: string): Promise<UserProfile | null> => {
    const path = `${PROFILE_COLLECTION}/${uid}`;
    try {
      const docSnap = await getDoc(doc(db, PROFILE_COLLECTION, uid));
      return docSnap.exists() ? docSnap.data() as UserProfile : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  saveProfile: async (profile: UserProfile) => {
    if (!auth.currentUser) return;
    const path = `${PROFILE_COLLECTION}/${auth.currentUser.uid}`;
    try {
      await setDoc(doc(db, PROFILE_COLLECTION, auth.currentUser.uid), {
        ...profile,
        uid: auth.currentUser.uid,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
