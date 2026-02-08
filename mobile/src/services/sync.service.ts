import FirebaseService from './firebase.service';
import ApiService from './api.service';
import { StorageService } from './storage.service';
import type { Signalement, SignalementCreate } from '@/types';
class SyncService {
  private syncQueue: any[] = [];
  async createSignalement(data: SignalementCreate): Promise<any> {
    const isOnline = await FirebaseService.checkOnlineStatus();
    if (isOnline && FirebaseService.isInitialized()) {
      try {
        const firebaseId = await FirebaseService.createSignalement(data);
        return { id: firebaseId, firebase_id: firebaseId, ...data };
      } catch (error) {
        console.error('Erreur Firebase, utilisation de la base locale:', error);
        return await this.createLocal(data);
      }
    } else {
      return await this.createLocal(data);
    }
  }
  private async createLocal(data: SignalementCreate): Promise<any> {
    try {
      const response = await ApiService.post('/signalements', data);
      await this.addToSyncQueue({
        type: 'create',
        collection: 'signalements',
        data: response.data,
        timestamp: Date.now()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur création locale:', error);
      throw error;
    }
  }
  async getSignalements(): Promise<Signalement[]> {
    const isOnline = await FirebaseService.checkOnlineStatus();
    if (isOnline && FirebaseService.isInitialized()) {
      try {
        return await FirebaseService.getSignalements();
      } catch (error) {
        console.error('Erreur Firebase, utilisation de la base locale:', error);
        return await this.getLocal();
      }
    } else {
      return await this.getLocal();
    }
  }
  private async getLocal(): Promise<Signalement[]> {
    try {
      const response = await ApiService.get('/signalements');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération locale:', error);
      return [];
    }
  }
  async getMySignalements(): Promise<Signalement[]> {
    const isOnline = await FirebaseService.checkOnlineStatus();
    if (isOnline && FirebaseService.isInitialized()) {
      try {
        return await FirebaseService.getMySignalements();
      } catch (error) {
        console.error('Erreur Firebase, utilisation de la base locale:', error);
        return await this.getMySignalementsLocal();
      }
    } else {
      return await this.getMySignalementsLocal();
    }
  }
  private async getMySignalementsLocal(): Promise<Signalement[]> {
    try {
      const response = await ApiService.get('/signalements/my');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération locale:', error);
      return [];
    }
  }
  async getSignalementById(id: string | number): Promise<Signalement | null> {
    const isOnline = await FirebaseService.checkOnlineStatus();
    if (isOnline && FirebaseService.isInitialized() && typeof id === 'string') {
      try {
        return await FirebaseService.getSignalementById(id);
      } catch (error) {
        console.error('Erreur Firebase, utilisation de la base locale:', error);
        return await this.getByIdLocal(id);
      }
    } else {
      return await this.getByIdLocal(id);
    }
  }
  private async getByIdLocal(id: string | number): Promise<Signalement | null> {
    try {
      const response = await ApiService.get(`/signalements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération locale:', error);
      return null;
    }
  }
  async updateSignalement(id: string | number, data: Partial<Signalement>): Promise<void> {
    const isOnline = await FirebaseService.checkOnlineStatus();
    if (isOnline && FirebaseService.isInitialized() && typeof id === 'string') {
      try {
        await FirebaseService.updateSignalement(id, data);
      } catch (error) {
        console.error('Erreur Firebase, utilisation de la base locale:', error);
        await this.updateLocal(id, data);
      }
    } else {
      await this.updateLocal(id, data);
    }
  }
  private async updateLocal(id: string | number, data: Partial<Signalement>): Promise<void> {
    try {
      await ApiService.put(`/signalements/${id}`, data);
      await this.addToSyncQueue({
        type: 'update',
        collection: 'signalements',
        id,
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Erreur mise à jour locale:', error);
      throw error;
    }
  }
  async deleteSignalement(id: string | number): Promise<void> {
    const isOnline = await FirebaseService.checkOnlineStatus();
    if (isOnline && FirebaseService.isInitialized() && typeof id === 'string') {
      try {
        await FirebaseService.deleteSignalement(id);
      } catch (error) {
        console.error('Erreur Firebase, utilisation de la base locale:', error);
        await this.deleteLocal(id);
      }
    } else {
      await this.deleteLocal(id);
    }
  }
  private async deleteLocal(id: string | number): Promise<void> {
    try {
      await ApiService.delete(`/signalements/${id}`);
      await this.addToSyncQueue({
        type: 'delete',
        collection: 'signalements',
        id,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Erreur suppression locale:', error);
      throw error;
    }
  }
  private async addToSyncQueue(operation: any): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      queue.push(operation);
      await StorageService.set('sync_queue', JSON.stringify(queue));
    } catch (error) {
      console.error('Erreur ajout file sync:', error);
    }
  }
  async getSyncQueue(): Promise<any[]> {
    try {
      const queueStr = await StorageService.get('sync_queue');
      return queueStr ? JSON.parse(queueStr) : [];
    } catch (error) {
      console.error('Erreur récupération file sync:', error);
      return [];
    }
  }
  async syncToFirebase(): Promise<{ success: number; errors: number }> {
    const isOnline = await FirebaseService.checkOnlineStatus();
    if (!isOnline || !FirebaseService.isInitialized()) {
      return { success: 0, errors: 0 };
    }
    const queue = await this.getSyncQueue();
    let success = 0;
    let errors = 0;
    for (const operation of queue) {
      try {
        switch (operation.type) {
          case 'create':
            await FirebaseService.createSignalement(operation.data);
            break;
          case 'update':
            await FirebaseService.updateSignalement(operation.id, operation.data);
            break;
          case 'delete':
            await FirebaseService.deleteSignalement(operation.id);
            break;
        }
        success++;
      } catch (error) {
        console.error('Erreur sync opération:', error);
        errors++;
      }
    }
    if (errors === 0) {
      await StorageService.remove('sync_queue');
    }
    return { success, errors };
  }
  async getPendingSyncCount(): Promise<number> {
    const queue = await this.getSyncQueue();
    return queue.length;
  }
  async uploadMultiplePhotos(signalementId: string, photosBase64: string[]): Promise<string[]> {
    const isOnline = await FirebaseService.checkOnlineStatus();
    if (isOnline && FirebaseService.isInitialized()) {
      try {
        return await FirebaseService.uploadMultiplePhotos(signalementId, photosBase64);
      } catch (error) {
        console.error('Erreur upload photos Firebase:', error);
        throw error;
      }
    } else {
      throw new Error('Impossible d\'uploader les photos hors ligne');
    }
  }
}
export default new SyncService();