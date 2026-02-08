import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { StorageService } from './storage.service';
interface NotificationSettings {
  enabled: boolean;
  statusChanges: boolean;
  newAssignments: boolean;
  sound: boolean;
  vibration: boolean;
}
class NotificationService {
  private isInitialized = false;
  private settings: NotificationSettings = {
    enabled: true,
    statusChanges: true,
    newAssignments: true,
    sound: true,
    vibration: true
  };
  async initialize(): Promise<void> {
    if (this.isInitialized || !Capacitor.isNativePlatform()) {
      return;
    }
    try {
      await this.loadSettings();
      const permission = await LocalNotifications.checkPermissions();
      if (permission.display !== 'granted') {
        const request = await LocalNotifications.requestPermissions();
        if (request.display !== 'granted') {
          console.warn('Permission de notification refusée');
          this.settings.enabled = false;
          return;
        }
      }
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Notification clicked:', notification);
        this.handleNotificationClick(notification);
      });
      this.isInitialized = true;
      console.log('NotificationService initialized');
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
    }
  }
  private async loadSettings(): Promise<void> {
    try {
      const saved = await StorageService.get('notification_settings');
      if (saved) {
        this.settings = { ...this.settings, ...saved };
      }
    } catch (error) {
      console.error('Erreur chargement paramètres notifications:', error);
    }
  }
  private async saveSettings(): Promise<void> {
    try {
      await StorageService.set('notification_settings', this.settings);
    } catch (error) {
      console.error('Erreur sauvegarde paramètres notifications:', error);
    }
  }
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }
  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }
  isEnabled(): boolean {
    return this.settings.enabled && this.isInitialized;
  }
  async notifyStatusChange(signalementId: string, oldStatus: string, newStatus: string, description?: string): Promise<void> {
    if (!this.isEnabled() || !this.settings.statusChanges) {
      return;
    }
    const statusLabels: Record<string, string> = {
      'nouveau': 'Nouveau',
      'en-attente': 'En attente',
      'en-cours': 'En cours de traitement',
      'resolu': 'Résolu',
      'ferme': 'Fermé'
    };
    const title = 'Signalement mis à jour';
    const body = `Statut passé de "${statusLabels[oldStatus] || oldStatus}" à "${statusLabels[newStatus] || newStatus}"`;
    await this.scheduleNotification({
      id: Date.now(),
      title,
      body: description ? `${body}\n${description}` : body,
      extra: {
        type: 'status_change',
        signalementId,
        oldStatus,
        newStatus
      }
    });
  }
  async notifyNewAssignment(signalementId: string, assignedTo: string, description?: string): Promise<void> {
    if (!this.isEnabled() || !this.settings.newAssignments) {
      return;
    }
    await this.scheduleNotification({
      id: Date.now(),
      title: 'Nouveau signalement assigné',
      body: description || `Signalement assigné à ${assignedTo}`,
      extra: {
        type: 'new_assignment',
        signalementId,
        assignedTo
      }
    });
  }
  async sendCustomNotification(title: string, body: string, extra?: any): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }
    await this.scheduleNotification({
      id: Date.now(),
      title,
      body,
      extra
    });
  }
  private async scheduleNotification(options: {
    id: number;
    title: string;
    body: string;
    extra?: any;
  }): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: options.id,
            title: options.title,
            body: options.body,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: this.settings.sound ? 'default' : undefined,
            extra: options.extra
          }
        ]
      });
    } catch (error) {
      console.error('Erreur planification notification:', error);
    }
  }
  private handleNotificationClick(notification: any): void {
    const extra = notification.notification?.extra;
    if (extra?.type === 'status_change' || extra?.type === 'new_assignment') {
      const signalementId = extra.signalementId;
      if (signalementId) {
        window.location.href = `#/signalements/${signalementId}`;
      }
    }
  }
  async cancelAllNotifications(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      const ids = pending.notifications.map(n => n.id);
      if (ids.length > 0) {
        await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
      }
    } catch (error) {
      console.error('Erreur annulation notifications:', error);
    }
  }
  async testNotification(): Promise<void> {
    await this.sendCustomNotification(
      'Test de notification',
      'Vos notifications fonctionnent correctement !'
    );
  }
}
export default new NotificationService();