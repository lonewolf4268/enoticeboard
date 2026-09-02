import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  setDoc,
  query, 
  orderBy,
  Firestore 
} from 'firebase/firestore';
import { Notice } from '../types';

// Load saved config or environment config
export function getFirebaseConfig() {
  const saved = localStorage.getItem('enoticeboard_firebase_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }

  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'enoticeboard';

  if (envApiKey) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

let dbInstance: Firestore | null = null;

export function getDb(): Firestore | null {
  if (dbInstance) return dbInstance;

  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    return null;
  }
}

export function saveCustomFirebaseConfig(config: {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}) {
  localStorage.setItem('enoticeboard_firebase_config', JSON.stringify(config));
  dbInstance = null; // reset db instance to re-init
  return getDb();
}

export function resetFirebaseConfig() {
  localStorage.removeItem('enoticeboard_firebase_config');
  dbInstance = null;
}

export function subscribeToNotices(
  onNoticesUpdated: (notices: Notice[]) => void,
  onError?: (err: Error) => void
) {
  const db = getDb();
  if (!db) return () => {};

  const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const notices: Notice[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          content: data.content || '',
          author: data.author || '',
          department: data.department || '',
          date: data.date || new Date().toISOString(),
          category: data.category || 'Academic',
          isUrgent: !!data.isUrgent,
          ...(data.dueDate ? { dueDate: data.dueDate } : {}),
        };
      });
      onNoticesUpdated(notices);
    },
    (err) => {
      console.error('Firestore snapshot error:', err);
      if (onError) onError(err);
    }
  );
}

export async function addNoticeToFirestore(notice: Omit<Notice, 'id' | 'date'>) {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  const newNoticeData = {
    ...notice,
    date: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, 'notices'), newNoticeData);
  return { id: docRef.id, ...newNoticeData };
}

export async function deleteNoticeFromFirestore(id: string) {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  await deleteDoc(doc(db, 'notices', id));
}

export async function syncLocalNoticesToFirestore(localNotices: Notice[]) {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  for (const n of localNotices) {
    const { id, ...data } = n;
    await setDoc(doc(db, 'notices', id), data, { merge: true });
  }
}
