<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/profile"></ion-back-button>
        </ion-buttons>
        <ion-title>Paramètres des notifications</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="status-section">
        <ion-card>
          <ion-card-header>
            <ion-card-title>État actuel</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="status-info">
              <ion-chip :color="notificationStatus.enabled ? 'success' : 'danger'">
                <ion-icon :icon="notificationStatus.enabled ? checkmarkCircleOutline : closeCircleOutline"></ion-icon>
                <ion-label>{{ notificationStatus.enabled ? 'Activées' : 'Désactivées' }}</ion-label>
              </ion-chip>
              <div v-if="watcherStats.isWatching" class="watching-info">
                <p><strong>{{ watcherStats.trackedSignalements }}</strong> signalements surveillés</p>
                <p>Vérification toutes les <strong>{{ Math.round(watcherStats.checkInterval / 1000) }}s</strong></p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
      <ion-list>
        <ion-list-header>
          <ion-label>Paramètres principaux</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-checkbox
            :checked="settings.enabled"
            @ionChange="updateSetting('enabled', $event.detail.checked)"
            slot="start"
          ></ion-checkbox>
          <ion-label>
            <h3>Activer les notifications</h3>
            <p>Recevoir des notifications sur cet appareil</p>
          </ion-label>
        </ion-item>
        <ion-item :disabled="!settings.enabled">
          <ion-checkbox
            :checked="settings.statusChanges"
            @ionChange="updateSetting('statusChanges', $event.detail.checked)"
            slot="start"
          ></ion-checkbox>
          <ion-label>
            <h3>Changements de statut</h3>
            <p>Notification à chaque changement de statut de mes signalements</p>
          </ion-label>
        </ion-item>
        <ion-item :disabled="!settings.enabled">
          <ion-checkbox
            :checked="settings.newAssignments"
            @ionChange="updateSetting('newAssignments', $event.detail.checked)"
            slot="start"
          ></ion-checkbox>
          <ion-label>
            <h3>Nouvelles affectations</h3>
            <p>Notification quand un signalement m'est assigné</p>
          </ion-label>
        </ion-item>
      </ion-list>
      <ion-list>
        <ion-list-header>
          <ion-label>Préférences</ion-label>
        </ion-list-header>
        <ion-item :disabled="!settings.enabled">
          <ion-checkbox
            :checked="settings.sound"
            @ionChange="updateSetting('sound', $event.detail.checked)"
            slot="start"
          ></ion-checkbox>
          <ion-label>
            <h3>Son</h3>
            <p>Jouer un son avec les notifications</p>
          </ion-label>
        </ion-item>
        <ion-item :disabled="!settings.enabled">
          <ion-checkbox
            :checked="settings.vibration"
            @ionChange="updateSetting('vibration', $event.detail.checked)"
            slot="start"
          ></ion-checkbox>
          <ion-label>
            <h3>Vibration</h3>
            <p>Faire vibrer l'appareil pour les notifications</p>
          </ion-label>
        </ion-item>
      </ion-list>
      <div class="actions-section">
        <ion-button
          expand="block"
          fill="outline"
          @click="testNotification"
          :disabled="!settings.enabled || loading"
        >
          <ion-icon :icon="notificationsOutline" slot="start"></ion-icon>
          Tester les notifications
        </ion-button>
        <ion-button
          expand="block"
          fill="clear"
          color="medium"
          @click="forceCheck"
          :disabled="!settings.enabled || loading"
        >
          <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
          Vérifier maintenant
        </ion-button>
        <ion-button
          expand="block"
          fill="clear"
          color="danger"
          @click="resetNotifications"
          :disabled="loading"
        >
          <ion-icon :icon="trashOutline" slot="start"></ion-icon>
          Réinitialiser
        </ion-button>
      </div>
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="helpCircleOutline"></ion-icon>
            Comment ça fonctionne ?
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>
            L'application surveille automatiquement les changements de statut de vos signalements
            toutes les 30 secondes et vous envoie une notification locale lorsqu'un changement est détecté.
          </p>
          <p>
            <strong>Note :</strong> Les notifications fonctionnent uniquement sur les appareils mobiles.
            Sur le navigateur, elles ne sont pas disponibles.
          </p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonIcon,
  toastController
} from '@ionic/vue';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  notificationsOutline,
  refreshOutline,
  trashOutline,
  helpCircleOutline
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import NotificationService from '@/services/notification.service';
import StatusWatcherService from '@/services/status-watcher.service';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
const loading = ref(false);
const settings = ref({
  enabled: true,
  statusChanges: true,
  newAssignments: true,
  sound: true,
  vibration: true
});
const watcherStats = ref({
  isWatching: false,
  trackedSignalements: 0,
  checkInterval: 30000
});
const notificationStatus = computed(() => ({
  enabled: settings.value.enabled && Capacitor.isNativePlatform()
}));
const loadSettings = async () => {
  try {
    const currentSettings = NotificationService.getSettings();
    settings.value = { ...settings.value, ...currentSettings };
    const stats = StatusWatcherService.getWatchingStats();
    watcherStats.value = stats;
  } catch (error) {
    console.error('Erreur chargement paramètres:', error);
  }
};
const updateSetting = async (key: string, value: boolean) => {
  try {
    loading.value = true;
    settings.value = { ...settings.value, [key]: value };
    await NotificationService.updateSettings({ [key]: value });
    if (key === 'enabled') {
      if (value) {
        await NotificationService.initialize();
        if (authStore.user?.id) {
          await StatusWatcherService.startWatching(String(authStore.user.id));
        }
      } else {
        StatusWatcherService.stopWatching();
        await NotificationService.cancelAllNotifications();
      }
      const stats = StatusWatcherService.getWatchingStats();
      watcherStats.value = stats;
    }
    const toast = await toastController.create({
      message: 'Paramètres mis à jour',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  } catch (error) {
    console.error('Erreur mise à jour paramètre:', error);
    const toast = await toastController.create({
      message: 'Erreur lors de la mise à jour',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};
const testNotification = async () => {
  try {
    loading.value = true;
    await NotificationService.testNotification();
    const toast = await toastController.create({
      message: 'Notification de test envoyée',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  } catch (error) {
    console.error('Erreur test notification:', error);
    const toast = await toastController.create({
      message: 'Erreur lors du test',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};
const forceCheck = async () => {
  if (!authStore.user?.id) return;
  try {
    loading.value = true;
    await StatusWatcherService.forceCheck(String(authStore.user.id));
    const toast = await toastController.create({
      message: 'Vérification effectuée',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  } catch (error) {
    console.error('Erreur vérification forcée:', error);
    const toast = await toastController.create({
      message: 'Erreur lors de la vérification',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};
const resetNotifications = async () => {
  try {
    loading.value = true;
    await StatusWatcherService.resetAllStatuses();
    await NotificationService.cancelAllNotifications();
    const toast = await toastController.create({
      message: 'Notifications réinitialisées',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
    const stats = StatusWatcherService.getWatchingStats();
    watcherStats.value = stats;
  } catch (error) {
    console.error('Erreur réinitialisation:', error);
    const toast = await toastController.create({
      message: 'Erreur lors de la réinitialisation',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};
onMounted(async () => {
  await loadSettings();
});
</script>
<style scoped>
.status-section {
  margin: 16px;
}
.status-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.watching-info {
  padding: 12px;
  background: var(--ion-color-light);
  border-radius: 8px;
  border-left: 4px solid var(--ion-color-success);
}
.watching-info p {
  margin: 4px 0;
  color: var(--ion-color-dark);
}
.actions-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
ion-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>