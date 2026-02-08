import { ref } from 'vue';
import FirebaseService from './firebase.service';
import NotificationService from './notification.service';
import { StorageService } from './storage.service';
import type { Signalement } from '@/types';
class StatusWatcherService {
  private isWatching = false;
  private watchInterval: NodeJS.Timeout | null = null;
  private lastKnownStatuses: Map<string, string> = new Map();
  private readonly CHECK_INTERVAL = 30000;
  async startWatching(userId: string): Promise<void> {
    if (this.isWatching) {
      return;
    }
    console.log('Démarrage de la surveillance des changements de statut');
    await this.loadLastKnownStatuses();
    await this.updateKnownStatuses(userId);
    this.watchInterval = setInterval(() => {
      this.checkStatusChanges(userId);
    }, this.CHECK_INTERVAL);
    this.isWatching = true;
  }
  stopWatching(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    this.isWatching = false;
    console.log('Surveillance des changements de statut arrêtée');
  }
  private async checkStatusChanges(userId: string): Promise<void> {
    try {
      const signalements = await FirebaseService.getMySignalements();
      for (const signalement of signalements) {
        const currentStatus = signalement.status || 'nouveau';
        const lastKnownStatus = this.lastKnownStatuses.get(signalement.id);
        if (lastKnownStatus && lastKnownStatus !== currentStatus) {
          console.log(`Changement de statut détecté pour ${signalement.id}: ${lastKnownStatus} → ${currentStatus}`);
          await NotificationService.notifyStatusChange(
            signalement.id,
            lastKnownStatus,
            currentStatus,
            signalement.description
          );
        }
        this.lastKnownStatuses.set(signalement.id, currentStatus);
      }
      await this.saveLastKnownStatuses();
    } catch (error) {
      console.error('Erreur vérification changements de statut:', error);
    }
  }
  private async updateKnownStatuses(userId: string): Promise<void> {
    try {
      const signalements = await FirebaseService.getMySignalements();
      for (const signalement of signalements) {
        const status = signalement.status || 'nouveau';
        this.lastKnownStatuses.set(signalement.id, status);
      }
      await this.saveLastKnownStatuses();
    } catch (error) {
      console.error('Erreur mise à jour statuts connus:', error);
    }
  }
  private async loadLastKnownStatuses(): Promise<void> {
    try {
      const saved = await StorageService.get('last_known_statuses');
      if (saved) {
        this.lastKnownStatuses = new Map(Object.entries(saved));
      }
    } catch (error) {
      console.error('Erreur chargement derniers statuts:', error);
    }
  }
  private async saveLastKnownStatuses(): Promise<void> {
    try {
      const statusObject = Object.fromEntries(this.lastKnownStatuses);
      await StorageService.set('last_known_statuses', statusObject);
    } catch (error) {
      console.error('Erreur sauvegarde derniers statuts:', error);
    }
  }
  async forceCheck(userId: string): Promise<void> {
    if (!this.isWatching) {
      return;
    }
    await this.checkStatusChanges(userId);
  }
  getWatchingStats(): {
    isWatching: boolean;
    trackedSignalements: number;
    checkInterval: number;
  } {
    return {
      isWatching: this.isWatching,
      trackedSignalements: this.lastKnownStatuses.size,
      checkInterval: this.CHECK_INTERVAL
    };
  }
  async addSignalement(signalement: Signalement): Promise<void> {
    const status = signalement.status || 'nouveau';
    this.lastKnownStatuses.set(signalement.id, status);
    await this.saveLastKnownStatuses();
  }
  async removeSignalement(signalementId: string): Promise<void> {
    this.lastKnownStatuses.delete(signalementId);
    await this.saveLastKnownStatuses();
  }
  async resetAllStatuses(): Promise<void> {
    this.lastKnownStatuses.clear();
    await this.saveLastKnownStatuses();
  }
}
export default new StatusWatcherService();