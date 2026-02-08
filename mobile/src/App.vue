<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>
<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAuthStore } from '@/stores/auth';
import FirebaseService from '@/services/firebase.service';
import NotificationService from '@/services/notification.service';
import StatusWatcherService from '@/services/status-watcher.service';
const authStore = useAuthStore();
onMounted(async () => {
  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#3880ff' });
  } catch (error) {
    console.warn('StatusBar not available:', error);
  }
  await FirebaseService.waitForAuth();
  await authStore.restoreSession();
  if (authStore.isAuthenticated && authStore.user?.id) {
    try {
      await NotificationService.initialize();
      await StatusWatcherService.startWatching(String(authStore.user.id));
      console.log('Services de notifications initialisés');
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
    }
  }
});
</script>
<style>
@import '@ionic/vue/css/core.css';
@import '@ionic/vue/css/normalize.css';
@import '@ionic/vue/css/structure.css';
@import '@ionic/vue/css/typography.css';
@import '@ionic/vue/css/padding.css';
@import '@ionic/vue/css/float-elements.css';
@import '@ionic/vue/css/text-alignment.css';
@import '@ionic/vue/css/text-transformation.css';
@import '@ionic/vue/css/flex-utils.css';
@import '@ionic/vue/css/display.css';
@import './theme/variables.css';
</style>