import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { Network } from '@capacitor/network';
import type { Signalement, SignalementCreate } from '@/types';
class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private isOnline: boolean = true;
  private authReady: Promise<void> | null = null;
  private authReadyResolve: (() => void) | null = null;
  constructor() {
    this.initNetworkListener();
  }
  initialize(config: any) {
    if (!this.app) {
      this.app = initializeApp(config);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.authReady = new Promise((resolve) => {
        this.authReadyResolve = resolve;
        const unsubscribe = onAuthStateChanged(this.auth!, () => {
          unsubscribe();
          resolve();
        });
      });
    }
  }
  async waitForAuth(): Promise<void> {
    if (this.authReady) {
      await this.authReady;
    }
  }
  isInitialized(): boolean {
    return this.app !== null && this.auth !== null && this.db !== null;
  }
  private async initNetworkListener() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;
    Network.addListener('networkStatusChange', (status) => {
      this.isOnline = status.connected;
      console.log('Network status changed:', status.connected ? 'Online' : 'Offline');
    });
  }
  async checkOnlineStatus(): Promise<boolean> {
    const status = await Network.getStatus();
    this.isOnline = status.connected;
    return this.isOnline;
  }
  async login(email: string, password: string): Promise<FirebaseUser> {
    if (!this.auth) throw new Error('Firebase non initialisé');
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }
  async logout(): Promise<void> {
    if (!this.auth) throw new Error('Firebase non initialisé');
    await signOut(this.auth);
  }
  getCurrentUser(): FirebaseUser | null {
    if (!this.auth) return null;
    return this.auth.currentUser;
  }
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    if (!this.auth) throw new Error('Firebase non initialisé');
    return onAuthStateChanged(this.auth, callback);
  }
  async createSignalement(data: SignalementCreate): Promise<string> {
    if (!this.db) throw new Error('Firebase non initialisé');
    if (!this.isOnline) throw new Error('Hors ligne - utilisez la base locale');
    const user = this.getCurrentUser();
    if (!user) throw new Error('Utilisateur non connecté');
    const currentTimestamp = Timestamp.now();
    const signalementData = {
      titre: data.titre,
      description: data.description,
      type: data.type,
      gravite: data.gravite,
      latitude: data.latitude,
      longitude: data.longitude,
      adresse_precise: data.adresse_precise || '',
      priorite: data.priorite || 3,
      status: 'en-attente',
      photoURL: data.photoURL || null,
      photos: data.photos || [],
      userId: user.uid,
      userEmail: user.email,
      route_id: data.route_id || null,
      ville_id: data.ville_id || null,
      is_synced: true,
      date_signalement: currentTimestamp,
      dateCreation: currentTimestamp,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp
    };
    const docRef = await addDoc(collection(this.db, 'signalements'), signalementData);
    return docRef.id;
  }
  async getSignalements(): Promise<Signalement[]> {
    if (!this.db) throw new Error('Firebase non initialisé');
    if (!this.isOnline) throw new Error('Hors ligne - utilisez la base locale');
    const querySnapshot = await getDocs(
      query(collection(this.db, 'signalements'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id as any,
      firebase_id: doc.id,
      ...doc.data()
    } as Signalement));
  }
  async getMySignalements(): Promise<Signalement[]> {
    if (!this.db) throw new Error('Firebase non initialisé');
    if (!this.isOnline) throw new Error('Hors ligne - utilisez la base locale');
    await this.waitForAuth();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Utilisateur non connecté');
    const q = query(
      collection(this.db, 'signalements'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id as any,
      firebase_id: doc.id,
      ...doc.data()
    } as Signalement));
  }
  async getSignalementById(id: string): Promise<Signalement | null> {
    if (!this.db) throw new Error('Firebase non initialisé');
    if (!this.isOnline) throw new Error('Hors ligne - utilisez la base locale');
    const docRef = doc(this.db, 'signalements', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id as any,
        firebase_id: docSnap.id,
        ...docSnap.data()
      } as Signalement;
    }
    return null;
  }
  async updateSignalement(id: string, data: Partial<Signalement>): Promise<void> {
    if (!this.db) throw new Error('Firebase non initialisé');
    if (!this.isOnline) throw new Error('Hors ligne - utilisez la base locale');
    const docRef = doc(this.db, 'signalements', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }
  async deleteSignalement(id: string): Promise<void> {
    if (!this.db) throw new Error('Firebase non initialisé');
    if (!this.isOnline) throw new Error('Hors ligne - utilisez la base locale');
    const docRef = doc(this.db, 'signalements', id);
    await deleteDoc(docRef);
  }
  async uploadPhoto(signalementId: string, base64Data: string): Promise<string> {
    if (!this.db) throw new Error('Firebase non initialisé');
    if (!this.isOnline) throw new Error('Hors ligne - utilisez la base locale');
    const photoUrl = `data:image/jpeg;base64,${base64Data}`;
    const docRef = doc(this.db, 'signalements', signalementId);
    await updateDoc(docRef, {
      photoURL: photoUrl,
      updatedAt: Timestamp.now()
    });
    return photoUrl;
  }
  async uploadMultiplePhotos(signalementId: string, photosBase64: string[]): Promise<string[]> {
    if (!this.db) throw new Error('Firebase non initialisé');
    if (!this.isOnline) throw new Error('Hors ligne - utilisez la base locale');
    const photoUrls = photosBase64.map(base64 => `data:image/jpeg;base64,${base64}`);
    const docRef = doc(this.db, 'signalements', signalementId);
    await updateDoc(docRef, {
      photos: photoUrls,
      photoURL: photoUrls[0] || null,
      updatedAt: Timestamp.now()
    });
    return photoUrls;
  }
}
export default new FirebaseService();